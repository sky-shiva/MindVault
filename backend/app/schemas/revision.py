from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RevisionScheduleBase(BaseModel):
    topic_id: str

class RevisionScheduleResponse(BaseModel):
    id: str
    user_id: str
    topic_id: str
    topic_title: Optional[str] = None
    subject_name: Optional[str] = None
    repetitions: int
    interval_days: int
    ease_factor: float
    last_reviewed_at: Optional[datetime] = None
    next_review_at: datetime
    last_rating: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RevisionReviewSubmit(BaseModel):
    rating: str  # "forgot", "partial", "well"
    user_reflection: Optional[str] = None
