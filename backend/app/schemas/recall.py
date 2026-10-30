from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RecallStartRequest(BaseModel):
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    note_id: Optional[str] = None
    mode: str = "free_text"  # "free_text", "qa", "flashcard", "topic_practice"

class RecallAttemptSubmit(BaseModel):
    prompt: str
    user_attempt: Optional[str] = None
    revealed_reference: Optional[str] = None
    rating: str  # "forgot", "partial", "well"
    user_reflection: Optional[str] = None
    topic_id: Optional[str] = None
    note_id: Optional[str] = None

class RecallAttemptResponse(BaseModel):
    id: str
    session_id: str
    prompt: str
    user_attempt: Optional[str] = None
    revealed_reference: Optional[str] = None
    rating: str
    user_reflection: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RecallSessionResponse(BaseModel):
    id: str
    user_id: str
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    mode: str
    total_items: int
    completed_items: int
    score_percentage: float
    created_at: datetime
    completed_at: Optional[datetime] = None
    attempts: List[RecallAttemptResponse] = []

    class Config:
        from_attributes = True
