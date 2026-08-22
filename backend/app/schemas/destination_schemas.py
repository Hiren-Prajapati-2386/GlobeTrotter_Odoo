from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

# --- ACTIVITY SCHEMAS ---
class ActivityBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    cost: Decimal
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None

class ActivityOut(ActivityBase):
    id: int
    city_id: int

    class Config:
        from_attributes = True

# --- CITY SCHEMAS ---
class CityBase(BaseModel):
    name: str
    country: str
    region: Optional[str] = None
    cost_index: Decimal
    popularity_score: int = 0
    image_url: Optional[str] = None

class CityOut(CityBase):
    id: int
    # Including activities here so the frontend can load everything in one call if needed
    activities: List[ActivityOut] = [] 

    class Config:
        from_attributes = True