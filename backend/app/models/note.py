import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.tag import note_tags

def generate_uuid():
    return str(uuid.uuid4())

class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False, default="Untitled Note")
    mode = Column(String(32), default="freeform")  # "freeform" or "structured"
    
    # Free-form content: markdown / HTML string
    content = Column(Text, default="")
    
    # Structured note content: JSON storing the 11 retention fields:
    # definition, simple_explanation, why_it_matters, how_it_works, architecture,
    # examples, code_snippets, important_points, my_understanding, questions_doubts, references
    structured_content = Column(JSON, default=dict)
    
    # Organization and Flags
    is_pinned = Column(Boolean, default=False, index=True)
    is_favorite = Column(Boolean, default=False, index=True)
    is_archived = Column(Boolean, default=False, index=True)
    
    word_count = Column(Integer, default=0)
    last_edited_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="notes")
    subject = relationship("Subject", back_populates="notes")
    topic = relationship("Topic", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    flashcards = relationship("Flashcard", back_populates="note", cascade="all, delete-orphan")
