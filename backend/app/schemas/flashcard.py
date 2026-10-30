from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FlashcardBase(BaseModel):
    front: str
    back: str
    difficulty: Optional[str] = "medium"
    topic_id: Optional[str] = None
    note_id: Optional[str] = None

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardUpdate(BaseModel):
    front: Optional[str] = None
    back: Optional[str] = None
    difficulty: Optional[str] = None
    topic_id: Optional[str] = None

class FlashcardReview(BaseModel):
    rating: str  # "forgot", "partial", "well"

class FlashcardResponse(FlashcardBase):
    id: str
    user_id: str
    repetitions: int
    interval_days: int
    last_rating: Optional[str] = None
    next_review_at: datetime
    created_at: datetime
    updated_at: datetime
    topic_title: Optional[str] = None

    class Config:
        from_attributes = True
