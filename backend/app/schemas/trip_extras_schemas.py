from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import date, time
from app.schemas.destination_schemas import ActivityOut

# --- EXPENSE SCHEMAS ---
class ExpenseBase(BaseModel):
    category: str # transport, stay, meals, other
    amount: Decimal
    note: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: int
    trip_id: int

    class Config:
        from_attributes = True

# --- BUDGET SUMMARY SCHEMA ---
class BudgetSummary(BaseModel):
    total_spent: Decimal
    by_category: dict
    daily_average: Decimal
    overbudget_days: List[date]
    expenses: List[ExpenseOut] = []


# --- TRIP ACTIVITY SCHEMAS ---
class TripActivityBase(BaseModel):
    activity_id: int
    scheduled_date: date
    scheduled_time: Optional[time] = None
    cost_override: Optional[Decimal] = None
    notes: Optional[str] = None

class TripActivityCreate(TripActivityBase):
    pass

class TripActivityUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    cost_override: Optional[Decimal] = None
    notes: Optional[str] = None

class TripActivityOut(TripActivityBase):
    id: int
    stop_id: int
    activity: Optional[ActivityOut] = None

    class Config:
        from_attributes = True