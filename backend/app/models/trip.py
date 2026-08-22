from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    cover_photo_url = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    share_token = Column(String(64), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="trips")
    stops = relationship("Stop", back_populates="trip", cascade="all, delete-orphan")