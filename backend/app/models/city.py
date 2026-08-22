from sqlalchemy import Column, Integer, String, Numeric, Text
from sqlalchemy.orm import relationship
from app.database import Base

class City(Base):
    __tablename__ = "cities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    country = Column(String(120), nullable=False)
    region = Column(String(120), nullable=True)
    cost_index = Column(Numeric(6,2), nullable=False)
    popularity_score = Column(Integer, default=0)
    image_url = Column(Text, nullable=True)
    
    stops = relationship("Stop", back_populates="city")
    activities = relationship("Activity", back_populates="city")