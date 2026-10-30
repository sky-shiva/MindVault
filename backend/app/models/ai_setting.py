import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserAISetting(Base):
    __tablename__ = "user_ai_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Provider: "gemini", "openai", "none"
    provider = Column(String(32), default="gemini", nullable=False)
    
    # Configured model name, e.g. "gemini-1.5-flash", "gpt-4o-mini"
    model_name = Column(String(64), default="gemini-1.5-flash", nullable=False)
    
    # Encrypted API key stored at rest (never plaintext)
    encrypted_api_key = Column(Text, nullable=True)
    
    # Connection verification status
    is_valid = Column(Boolean, nullable=True)
    last_tested_at = Column(DateTime, nullable=True)
    validation_message = Column(String(512), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="ai_setting")
