import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RecallSession(Base):
    __tablename__ = "recall_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    
    mode = Column(String(32), default="free_text")  # "free_text", "qa", "flashcard", "topic_practice"
    total_items = Column(Integer, default=0)
    completed_items = Column(Integer, default=0)
    score_percentage = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="recall_sessions")
    attempts = relationship("RecallAttempt", back_populates="session", cascade="all, delete-orphan")

class RecallAttempt(Base):
    __tablename__ = "recall_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(36), ForeignKey("recall_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    note_id = Column(String(36), ForeignKey("notes.id", ondelete="SET NULL"), nullable=True)
    
    prompt = Column(Text, nullable=False)
    user_attempt = Column(Text, nullable=True)
    revealed_reference = Column(Text, nullable=True)
    rating = Column(String(32), nullable=False)  # "forgot", "partial", "well"
    user_reflection = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    session = relationship("RecallSession", back_populates="attempts")
