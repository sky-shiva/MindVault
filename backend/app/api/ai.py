from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.note import Note
from app.models.topic import Topic
from app.schemas.ai import (
    AIFlashcardRequest, GeneratedFlashcard,
    AIQuizRequest, QuizItem,
    AIExplanationRequest, AIRAGQueryRequest, AIRAGResponse
)
from app.services.ai_provider import ai_service
from app.services.rag_service import query_personal_rag

router = APIRouter(prefix="/ai", tags=["AI Learning Assistant & RAG"])

def extract_source_text(db: Session, user_id: str, note_id: str = None, topic_id: str = None, raw_content: str = None) -> str:
    if raw_content and raw_content.strip():
        return raw_content
    if note_id:
        note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if note:
            text = note.title + "\n\n" + (note.content or "")
            if note.structured_content:
                text += "\n" + "\n".join(f"{k}: {v}" for k, v in note.structured_content.items() if v)
            return text
    if topic_id:
        topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == user_id).first()
        if topic:
            notes = db.query(Note).filter(Note.topic_id == topic_id, Note.user_id == user_id).all()
            return f"{topic.title}\n{topic.description or ''}\n\n" + "\n\n".join(n.content or '' for n in notes)
    return "Core retention principles emphasize regular active recall, spaced repetition, and structured concept mastery."

from app.models.ai_setting import UserAISetting
from app.core.encryption import decrypt_secret

def get_user_credentials(db: Session, user_id: str):
    setting = db.query(UserAISetting).filter(UserAISetting.user_id == user_id).first()
    if setting:
        key = decrypt_secret(setting.encrypted_api_key) if setting.encrypted_api_key else None
        return setting.provider, key, setting.model_name
    return "gemini", None, "gemini-1.5-flash"

@router.post("/flashcards", response_model=List[GeneratedFlashcard])
async def generate_flashcards(
    req: AIFlashcardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source_text = extract_source_text(db, current_user.id, req.note_id, req.topic_id, req.content)
    provider, api_key, model = get_user_credentials(db, current_user.id)
    cards = await ai_service.generate_flashcards(source_text, count=req.count or 5, provider=provider, api_key=api_key, model_name=model)
    return [GeneratedFlashcard(**c) for c in cards]

@router.post("/quiz", response_model=List[QuizItem])
async def generate_quiz(
    req: AIQuizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source_text = extract_source_text(db, current_user.id, req.note_id, req.topic_id, req.content)
    provider, api_key, model = get_user_credentials(db, current_user.id)
    items = await ai_service.generate_quiz(source_text, quiz_type=req.quiz_type or "mcq", count=req.count or 4, provider=provider, api_key=api_key, model_name=model)
    return [QuizItem(**i) for i in items]

@router.post("/explain")
async def explain_concept(
    req: AIExplanationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    provider, api_key, model = get_user_credentials(db, current_user.id)
    explanation = await ai_service.explain_concept(req.concept, audience=req.target_audience or "beginner", provider=provider, api_key=api_key, model_name=model)
    return explanation

@router.post("/rag", response_model=AIRAGResponse)
def query_rag(
    req: AIRAGQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = query_personal_rag(
        db=db,
        user_id=current_user.id,
        query=req.query,
        subject_id=req.subject_id
    )
    return result
