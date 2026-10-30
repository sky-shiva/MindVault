from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    user_id: str
    created_at: datetime
    note_count: Optional[int] = 0

    class Config:
        from_attributes = True
