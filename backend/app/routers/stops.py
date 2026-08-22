from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.stop import Stop
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip_schemas import StopCreate, StopOut
from app.core.dependencies import get_current_user

# Notice we nest the route under the trip ID
router = APIRouter(prefix="/api/trips/{trip_id}/stops", tags=["stops"])

@router.post("/", response_model=StopOut, status_code=status.HTTP_201_CREATED)
def create_stop(trip_id: int, stop_in: StopCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # First, verify the user owns the trip
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or unauthorized")
    
    new_stop = Stop(**stop_in.dict(), trip_id=trip_id)
    db.add(new_stop)
    db.commit()
    db.refresh(new_stop)
    return new_stop

@router.get("/", response_model=List[StopOut])
def get_stops(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stops = db.query(Stop).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()
    return stops