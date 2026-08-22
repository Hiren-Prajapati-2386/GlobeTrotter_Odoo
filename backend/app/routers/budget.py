from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from decimal import Decimal
from datetime import date
from app.database import get_db
from app.models.trip_extras import Expense, TripActivity
from app.models.trip import Trip
from app.models.user import User
from app.models.stop import Stop
from app.models.activity import Activity
from app.schemas.trip_extras_schemas import ExpenseCreate, ExpenseOut, BudgetSummary
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

@router.get("/summary", response_model=BudgetSummary)
def get_budget_summary(trip_id: int, daily_limit: Decimal = Decimal("150.0"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    duration = (trip.end_date - trip.start_date).days + 1
    if duration <= 0:
        duration = 1
        
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
    
    by_category = {
        "transport": Decimal("0.0"),
        "stay": Decimal("0.0"),
        "meals": Decimal("0.0"),
        "activities": Decimal("0.0"),
        "other": Decimal("0.0")
    }
    
    for exp in expenses:
        cat = exp.category.lower()
        if cat in by_category:
            by_category[cat] += exp.amount
        else:
            by_category["other"] += exp.amount
            
    stops = db.query(Stop).filter(Stop.trip_id == trip_id).all()
    stop_ids = [s.id for s in stops]
    
    daily_act_spending = {}
    
    if stop_ids:
        trip_acts = db.query(TripActivity, Activity).join(Activity, TripActivity.activity_id == Activity.id).filter(TripActivity.stop_id.in_(stop_ids)).all()
        for ta, act in trip_acts:
            cost = ta.cost_override if ta.cost_override is not None else act.cost
            by_category["activities"] += cost
            
            s_date = ta.scheduled_date
            daily_act_spending[s_date] = daily_act_spending.get(s_date, Decimal("0.0")) + cost
            
    total_spent = sum(by_category.values())
    daily_average = total_spent / Decimal(str(duration))
    
    overbudget_days = []
    for s_date, amt in daily_act_spending.items():
        if amt > daily_limit:
            overbudget_days.append(s_date)
            
    overbudget_days.sort()
    
    return BudgetSummary(
        total_spent=total_spent,
        by_category=by_category,
        daily_average=daily_average,
        overbudget_days=overbudget_days,
        expenses=expenses
    )

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(trip_id: int, expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.trip_id == trip_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return None