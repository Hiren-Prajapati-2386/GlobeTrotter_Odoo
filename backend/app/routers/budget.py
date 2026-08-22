from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.trip_extras import Expense
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip_extras_schemas import ExpenseCreate, ExpenseOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/trips/{trip_id}/budget", tags=["budget"])

@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def add_expense(trip_id: int, expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    new_expense = Expense(**expense_in.dict(), trip_id=trip_id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
    return expenses