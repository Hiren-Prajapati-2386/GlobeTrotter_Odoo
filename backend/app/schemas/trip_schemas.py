from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# --- STOP SCHEMAS ---
class StopBase(BaseModel):
    city_id: int
    start_date: date
    end_date: date
    order_index: int

class StopCreate(StopBase):
    pass

class StopOut(StopBase):
    id: int
    trip_id: int

    class Config:
        from_attributes = True

# --- TRIP SCHEMAS ---
class TripBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    cover_photo_url: Optional[str] = None
    is_public: bool = False

class TripCreate(TripBase):
    pass

class TripOut(TripBase):
    id: int
    user_id: int
    share_token: Optional[str] = None
    stops: List[StopOut] = []

    class Config:
        from_attributes = True