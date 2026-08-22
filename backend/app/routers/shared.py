from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from app.database import get_db
from app.models.trip import Trip
from app.models.user import User
from app.models.stop import Stop
from app.models.trip_extras import TripActivity, TripCopy
from app.schemas.trip_schemas import TripOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/shared", tags=["shared"])

@router.get("/{share_token}", response_model=TripOut)
def get_shared_trip(share_token: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.share_token == share_token).first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
        
    if not trip.is_public:
        raise HTTPException(status_code=403, detail="This trip is private")
        
    return trip

@router.post("/{share_token}/copy", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def copy_shared_trip(share_token: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orig_trip = db.query(Trip).filter(Trip.share_token == share_token).first()
    if not orig_trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
        
    if not orig_trip.is_public:
        raise HTTPException(status_code=403, detail="This trip is private")
        
    new_share_token = str(uuid.uuid4().hex)
    copied_trip = Trip(
        user_id=current_user.id,
        name=f"Copy of {orig_trip.name}",
        description=orig_trip.description,
        start_date=orig_trip.start_date,
        end_date=orig_trip.end_date,
        cover_photo_url=orig_trip.cover_photo_url,
        is_public=False,
        share_token=new_share_token
    )
    db.add(copied_trip)
    db.commit()
    db.refresh(copied_trip)
    
    orig_stops = db.query(Stop).filter(Stop.trip_id == orig_trip.id).all()
    for o_stop in orig_stops:
        new_stop = Stop(
            trip_id=copied_trip.id,
            city_id=o_stop.city_id,
            start_date=o_stop.start_date,
            end_date=o_stop.end_date,
            order_index=o_stop.order_index
        )
        db.add(new_stop)
        db.commit()
        db.refresh(new_stop)
        
        orig_acts = db.query(TripActivity).filter(TripActivity.stop_id == o_stop.id).all()
        for o_act in orig_acts:
            new_act = TripActivity(
                stop_id=new_stop.id,
                activity_id=o_act.activity_id,
                scheduled_date=o_act.scheduled_date,
                scheduled_time=o_act.scheduled_time,
                cost_override=o_act.cost_override,
                notes=o_act.notes
            )
            db.add(new_act)
            
    log_copy = TripCopy(
        original_trip_id=orig_trip.id,
        copied_by_user_id=current_user.id
    )
    db.add(log_copy)
    db.commit()
    db.refresh(copied_trip)
    
    return copied_trip