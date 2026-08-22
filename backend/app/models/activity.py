from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50))
    cost = Column(Numeric(8,2), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    image_url = Column(Text, nullable=True)
    
    city = relationship("City", back_populates="activities")