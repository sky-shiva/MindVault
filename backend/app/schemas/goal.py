from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LearningGoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = "in_progress"
    progress_percentage: Optional[int] = 0
    subject_id: Optional[str] = None

class LearningGoalCreate(LearningGoalBase):
    pass

class LearningGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None
    progress_percentage: Optional[int] = None
    subject_id: Optional[str] = None

class LearningGoalResponse(LearningGoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True
