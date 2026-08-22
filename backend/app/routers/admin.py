from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.activity import Activity
from app.models.trip_extras import TripActivity, TripCopy
from app.core.dependencies import get_current_admin
from app.schemas.user_schemas import UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats", response_model=Dict[str, Any])
def get_stats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    total_users = db.query(User).count()
    total_trips = db.query(Trip).count()
    total_stops = db.query(Stop).count()
    total_copies = db.query(TripCopy).count()
    
    return {
        "total_users": total_users,
        "total_trips": total_trips,
        "total_stops": total_stops,
        "total_copies": total_copies
    }

@router.get("/cities/popular", response_model=List[Dict[str, Any]])
def get_popular_cities(limit: int = 5, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    results = db.query(
        Stop.city_id,
        func.count(Stop.id).label("stop_count")
    ).group_by(Stop.city_id).order_by(func.count(Stop.id).desc()).limit(limit).all()
    
    popular = []
    for city_id, count in results:
        from app.models.city import City
        city = db.query(City).filter(City.id == city_id).first()
        if city:
            popular.append({
                "city_id": city.id,
                "name": city.name,
                "country": city.country,
                "count": count
            })
    return popular

@router.get("/activities/popular", response_model=List[Dict[str, Any]])
def get_popular_activities(limit: int = 5, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    results = db.query(
        TripActivity.activity_id,
        func.count(TripActivity.id).label("attach_count")
    ).group_by(TripActivity.activity_id).order_by(func.count(TripActivity.id).desc()).limit(limit).all()
    
    popular = []
    for activity_id, count in results:
        act = db.query(Activity).filter(Activity.id == activity_id).first()
        if act:
            popular.append({
                "activity_id": act.id,
                "name": act.name,
                "cost": float(act.cost),
                "count": count
            })
    return popular

@router.get("/users", response_model=List[UserOut])
def get_admin_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    users = db.query(User).all()
    return users
