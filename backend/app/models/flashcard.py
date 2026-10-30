import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    note_id = Column(String(36), ForeignKey("notes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    difficulty = Column(String(32), default="medium")  # "easy", "medium", "hard"
    
    # Review stats
    repetitions = Column(Integer, default=0)
    interval_days = Column(Integer, default=1)
    last_rating = Column(String(32), nullable=True)  # "forgot", "partial", "well"
    next_review_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="flashcards")
    topic = relationship("Topic", back_populates="flashcards")
    note = relationship("Note", back_populates="flashcards")
