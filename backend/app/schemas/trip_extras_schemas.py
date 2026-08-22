from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

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
    expenses: List[ExpenseOut] = []