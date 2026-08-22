from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip_schemas import TripOut

router = APIRouter(prefix="/api/shared", tags=["shared"])

@router.get("/{share_token}", response_model=TripOut)
def get_shared_trip(share_token: str, db: Session = Depends(get_db)):
    # Look up the trip by its unique share token
    trip = db.query(Trip).filter(Trip.share_token == share_token).first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
        
    # Optional: ensure the user explicitly marked it public
    if not trip.is_public:
        raise HTTPException(status_code=403, detail="This trip is private")
        
    return trip