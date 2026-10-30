from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = 0

class TopicCreate(TopicBase):
    subject_id: str

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class TopicResponse(TopicBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    subject_id: str
    created_at: datetime
    updated_at: datetime
    next_review_at: Optional[datetime] = None
    revision_status: Optional[str] = None
