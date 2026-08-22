from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.destination_schemas import ActivityOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.get("/", response_model=List[ActivityOut])
def get_activities(city_id: int = None, category: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Activity)
    
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    if category:
        query = query.filter(Activity.category == category)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity