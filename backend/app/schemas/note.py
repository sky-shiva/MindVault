from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StructuredContent(BaseModel):
    topic_name: Optional[str] = ""
    definition: Optional[str] = ""
    simple_explanation: Optional[str] = ""
    why_it_matters: Optional[str] = ""
    how_it_works: Optional[str] = ""
    architecture: Optional[str] = ""
    examples: Optional[str] = ""
    code_snippets: Optional[str] = ""
    important_points: Optional[str] = ""
    my_understanding: Optional[str] = ""
    questions_doubts: Optional[str] = ""
    references: Optional[str] = ""

class NoteBase(BaseModel):
    title: str = "Untitled Note"
    mode: str = "freeform"  # "freeform" or "structured"
    content: Optional[str] = ""
    structured_content: Optional[Dict[str, Any]] = Field(default_factory=dict)
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    is_pinned: Optional[bool] = False
    is_favorite: Optional[bool] = False
    is_archived: Optional[bool] = False
    tags: Optional[List[str]] = Field(default_factory=list)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    mode: Optional[str] = None
    content: Optional[str] = None
    structured_content: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    tags: Optional[List[str]] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    mode: str
    content: str
    structured_content: Dict[str, Any]
    is_pinned: bool
    is_favorite: bool
    is_archived: bool
    word_count: int
    last_edited_at: datetime
    created_at: datetime
    updated_at: datetime
    tag_names: List[str] = []
    subject_name: Optional[str] = None
    topic_title: Optional[str] = None

    class Config:
        from_attributes = True
