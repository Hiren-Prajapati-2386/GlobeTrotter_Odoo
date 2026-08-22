from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.city import City
from app.models.user import User
from app.schemas.destination_schemas import CityOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/cities", tags=["cities"])

@router.get("/", response_model=List[CityOut])
def get_cities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch cities ordered by popularity
    cities = db.query(City).order_by(City.popularity_score.desc()).offset(skip).limit(limit).all()
    return cities

@router.get("/{city_id}", response_model=CityOut)
def get_city(city_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city