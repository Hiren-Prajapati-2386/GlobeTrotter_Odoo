from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user_schemas import UserCreate, UserOut, Token
from app.core.rate_limiter import limit_auth_requests
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(limit_auth_requests)])
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Create new user
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token, dependencies=[Depends(limit_auth_requests)])
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user.id))
    
    # Set HTTP-only secure cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax", # Allows cookie sharing across frontend/backend localhost
        max_age=settings.access_token_expire_minutes * 60
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")
    return {"detail": "Successfully logged out"}

@router.post("/forgot-password", dependencies=[Depends(limit_auth_requests)])
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    
    if user:
        expire = datetime.utcnow() + timedelta(minutes=15)
        # Store a signature segment of the current password hash to verify single-use
        payload = {
            "sub": str(user.id),
            "exp": expire,
            "purpose": "reset",
            "password_hash_short": user.password_hash[-10:]
        }
        token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
        
        # Log to terminal for manual testing
        print(f"\n==========================================")
        print(f"🔑 PASSWORD RESET REQUESTED FOR: {user.email}")
        print(f"🔗 RESET LINK: http://localhost:5173/reset-password?token={token}")
        print(f"==========================================\n")
        
    return {"detail": "If a user with this email exists, a password reset link has been sent."}

@router.post("/reset-password", dependencies=[Depends(limit_auth_requests)])
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("purpose") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token purpose")
            
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
            
        # Verify single-use check
        token_hash_short = payload.get("password_hash_short")
        if user.password_hash[-10:] != token_hash_short:
            raise HTTPException(status_code=400, detail="This token has already been used")
            
        # Hash new password
        user.password_hash = hash_password(req.new_password)
        db.commit()
        return {"detail": "Password has been reset successfully"}
        
    except (JWTError, KeyError, ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

