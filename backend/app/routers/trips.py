from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip_schemas import TripCreate, TripOut
from app.core.dependencies import get_current_user
import uuid
import os
from PIL import Image
import io

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Generate a unique share token automatically
    share_token = str(uuid.uuid4().hex)
    
    new_trip = Trip(**trip_in.dict(), user_id=current_user.id, share_token=share_token)
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/", response_model=List[TripOut])
def get_my_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    return trips

@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(trip)
    db.commit()
    return None

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, trip_in: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for key, value in trip_in.dict(exclude_unset=True).items():
        setattr(trip, key, value)
        
    db.commit()
    db.refresh(trip)
    return trip

@router.post("/upload")
def upload_cover_photo(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."
        )
        
    MAX_SIZE = 5 * 1024 * 1024 # 5MB
    contents = file.file.read(MAX_SIZE + 1)
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum size is 5MB."
        )
        
    file.file.seek(0)
    
    try:
        image = Image.open(io.BytesIO(contents))
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("static", "uploads", filename)
        
        # Save stripping metadata
        image.save(filepath, format=image.format)
        
        url = f"http://localhost:8000/static/uploads/{filename}"
        return {"url": url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )
