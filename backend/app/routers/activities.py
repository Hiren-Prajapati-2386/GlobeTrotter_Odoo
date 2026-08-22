from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.models.stop import Stop
from app.models.trip import Trip
from app.models.trip_extras import TripActivity
from app.schemas.destination_schemas import ActivityOut
from app.schemas.trip_extras_schemas import TripActivityCreate, TripActivityUpdate, TripActivityOut
from app.core.dependencies import get_current_user
from app.core.rate_limiter import limit_search_requests

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.get("/", response_model=List[ActivityOut], dependencies=[Depends(limit_search_requests)])

def get_activities(city_id: int = None, category: str = None, search: str = None, max_cost: float = None, max_duration: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Activity)
    
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    if category:
        query = query.filter(Activity.category.ilike(category))
    if search:
        query = query.filter(
            (Activity.name.ilike(f"%{search}%")) |
            (Activity.description.ilike(f"%{search}%"))
        )
    if max_cost is not None:
        query = query.filter(Activity.cost <= max_cost)
    if max_duration is not None:
        query = query.filter(Activity.duration_minutes <= max_duration)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.post("/stops/{stop_id}/activities", response_model=TripActivityOut)
def attach_activity_to_stop(stop_id: int, activity_in: TripActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    trip = db.query(Trip).filter(Trip.id == stop.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    act = db.query(Activity).filter(Activity.id == activity_in.activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    new_trip_activity = TripActivity(
        stop_id=stop_id,
        activity_id=activity_in.activity_id,
        scheduled_date=activity_in.scheduled_date,
        scheduled_time=activity_in.scheduled_time,
        cost_override=activity_in.cost_override,
        notes=activity_in.notes
    )
    db.add(new_trip_activity)
    db.commit()
    db.refresh(new_trip_activity)
    return new_trip_activity

@router.put("/trip-activities/{id}", response_model=TripActivityOut)
def update_trip_activity(id: int, activity_in: TripActivityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip_act = db.query(TripActivity).filter(TripActivity.id == id).first()
    if not trip_act:
        raise HTTPException(status_code=404, detail="Scheduled activity not found")
        
    stop = db.query(Stop).filter(Stop.id == trip_act.stop_id).first()
    trip = db.query(Trip).filter(Trip.id == stop.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    for key, value in activity_in.dict(exclude_unset=True).items():
        setattr(trip_act, key, value)
        
    db.commit()
    db.refresh(trip_act)
    return trip_act

@router.delete("/trip-activities/{id}", status_code=204)
def detach_activity_from_stop(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip_act = db.query(TripActivity).filter(TripActivity.id == id).first()
    if not trip_act:
        raise HTTPException(status_code=404, detail="Scheduled activity not found")
        
    stop = db.query(Stop).filter(Stop.id == trip_act.stop_id).first()
    trip = db.query(Trip).filter(Trip.id == stop.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    db.delete(trip_act)
    db.commit()
    return None