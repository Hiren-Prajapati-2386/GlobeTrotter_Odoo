from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.city import City
from app.models.user import User
from app.schemas.destination_schemas import CityOut
from app.core.dependencies import get_current_user
from app.core.rate_limiter import limit_search_requests

router = APIRouter(prefix="/api/cities", tags=["cities"])

@router.get("/", response_model=List[CityOut], dependencies=[Depends(limit_search_requests)])

def get_cities(country: str = None, region: str = None, search: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(City)
    
    if country:
        query = query.filter(City.country.ilike(f"%{country}%"))
    if region:
        query = query.filter(City.region.ilike(f"%{region}%"))
    if search:
        query = query.filter(
            (City.name.ilike(f"%{search}%")) |
            (City.country.ilike(f"%{search}%")) |
            (City.region.ilike(f"%{search}%"))
        )
        
    cities = query.order_by(City.popularity_score.desc()).offset(skip).limit(limit).all()
    return cities

@router.get("/{city_id}", response_model=CityOut)
def get_city(city_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city