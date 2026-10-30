import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Spaced Repetition parameters
    repetitions = Column(Integer, default=0)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)  # SuperMemo / Anki style ease
    
    last_reviewed_at = Column(DateTime, nullable=True)
    next_review_at = Column(DateTime, nullable=False, index=True, default=lambda: datetime.now(timezone.utc))
    
    last_rating = Column(String(32), nullable=True)  # "forgot", "partial", "well"
    status = Column(String(32), default="due")  # "due", "upcoming", "mastered"
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="revision_schedules")
    topic = relationship("Topic", back_populates="revision_schedule")
