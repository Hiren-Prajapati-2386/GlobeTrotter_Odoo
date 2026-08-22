from sqlalchemy import Column, Integer, String, Numeric, Date, Time, Text, DateTime, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class TripActivity(Base):
    __tablename__ = "trip_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=True)
    cost_override = Column(Numeric(8,2), nullable=True)
    notes = Column(Text, nullable=True)
    
    activity = relationship("Activity")


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    category = Column(String(30), nullable=False) # transport | stay | meals | other
    amount = Column(Numeric(8,2), nullable=False)
    note = Column(Text, nullable=True)

class TripCopy(Base):
    __tablename__ = "trip_copies"
    
    id = Column(Integer, primary_key=True, index=True)
    original_trip_id = Column(Integer, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    copied_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    copied_at = Column(DateTime(timezone=True), server_default=func.now())

class TripShare(Base):
    __tablename__ = "trip_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    share_token = Column(String(64), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())