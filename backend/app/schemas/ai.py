from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIFlashcardRequest(BaseModel):
    note_id: Optional[str] = None
    topic_id: Optional[str] = None
    content: Optional[str] = None
    count: Optional[int] = 5

class GeneratedFlashcard(BaseModel):
    front: str
    back: str
    difficulty: str = "medium"

class AIQuizRequest(BaseModel):
    note_id: Optional[str] = None
    topic_id: Optional[str] = None
    content: Optional[str] = None
    quiz_type: str = "mcq"  # "mcq", "descriptive", "interview"
    count: Optional[int] = 5

class MCQOption(BaseModel):
    id: str
    text: str

class QuizItem(BaseModel):
    question: str
    quiz_type: str
    options: Optional[List[MCQOption]] = None
    correct_answer: Optional[str] = None
    explanation: str

class AIExplanationRequest(BaseModel):
    concept: str
    target_audience: Optional[str] = "beginner"  # "beginner", "intermediate", "expert"
    format: Optional[str] = "summary"  # "summary", "analogy", "detailed"

class AIRAGQueryRequest(BaseModel):
    query: str
    subject_id: Optional[str] = None

class RAGCitation(BaseModel):
    note_id: str
    note_title: str
    snippet: str

class AIRAGResponse(BaseModel):
    answer: str
    citations: List[RAGCitation]
    provider: str
