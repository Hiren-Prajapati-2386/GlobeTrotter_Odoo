from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from app.database import get_db
from app.models.trip import Trip
from app.models.user import User
from app.models.stop import Stop
from app.models.trip_extras import TripActivity, TripCopy, TripShare
from app.schemas.trip_schemas import TripOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/shared", tags=["shared"])

@router.get("/{share_token}", response_model=TripOut)
def get_shared_trip(share_token: str, db: Session = Depends(get_db)):
    share = db.query(TripShare).filter(TripShare.share_token == share_token, TripShare.is_active == True).first()
    if not share:
        raise HTTPException(status_code=404, detail="Shared trip not found or link has been revoked")
        
    trip = db.query(Trip).filter(Trip.id == share.trip_id).first()
    if not trip or not trip.is_public:
        raise HTTPException(status_code=404, detail="Shared trip not found or is private")
        
    return trip

@router.post("/{share_token}/copy", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def copy_shared_trip(share_token: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    share = db.query(TripShare).filter(TripShare.share_token == share_token, TripShare.is_active == True).first()
    if not share:
        raise HTTPException(status_code=404, detail="Shared trip not found or link has been revoked")
        
    orig_trip = db.query(Trip).filter(Trip.id == share.trip_id).first()
    if not orig_trip or not orig_trip.is_public:
        raise HTTPException(status_code=404, detail="Shared trip not found or is private")
        
    copied_trip = Trip(
        user_id=current_user.id,
        name=f"Copy of {orig_trip.name}",
        description=orig_trip.description,
        start_date=orig_trip.start_date,
        end_date=orig_trip.end_date,
        cover_photo_url=orig_trip.cover_photo_url,
        is_public=False
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

@router.post("/trips/{trip_id}/share", response_model=str)
def create_share_link(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    trip.is_public = True
    
    share = db.query(TripShare).filter(TripShare.trip_id == trip_id).first()
    if not share:
        share = TripShare(
            trip_id=trip_id,
            share_token=str(uuid.uuid4().hex),
            is_active=True
        )
        db.add(share)
    else:
        share.is_active = True
        
    db.commit()
    db.refresh(share)
    return share.share_token

@router.delete("/trips/{trip_id}/share")
def revoke_share_link(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    trip.is_public = False
    
    share = db.query(TripShare).filter(TripShare.trip_id == trip_id).first()
    if share:
        db.delete(share)
        
    db.commit()
    return {"detail": "Share token revoked and trip set to private"}

@router.get("/trips/{trip_id}/share")
def get_trip_share_token(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if not trip.is_public:
        return {"share_token": None}
        
    share = db.query(TripShare).filter(TripShare.trip_id == trip_id, TripShare.is_active == True).first()
    if not share:
        share = TripShare(
            trip_id=trip_id,
            share_token=str(uuid.uuid4().hex),
            is_active=True
        )
        db.add(share)
        db.commit()
        db.refresh(share)
        
    return {"share_token": share.share_token}

