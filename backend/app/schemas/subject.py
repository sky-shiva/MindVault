from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#8B5CF6"
    icon: Optional[str] = "BookOpen"

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class SubjectResponse(SubjectBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    topic_count: Optional[int] = 0
    note_count: Optional[int] = 0
