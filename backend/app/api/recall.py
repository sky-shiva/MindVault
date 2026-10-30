from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.recall import RecallSession, RecallAttempt
from app.schemas.recall import (
    RecallStartRequest, RecallAttemptSubmit,
    RecallSessionResponse, RecallAttemptResponse
)
from app.services.recall_service import create_recall_session, record_recall_attempt

router = APIRouter(prefix="/recall", tags=["Active Recall"])

@router.post("/session", response_model=RecallSessionResponse, status_code=status.HTTP_201_CREATED)
def start_recall_session(
    req: RecallStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = create_recall_session(
        db=db,
        user_id=current_user.id,
        subject_id=req.subject_id,
        topic_id=req.topic_id,
        mode=req.mode
    )
    return session

@router.post("/session/{session_id}/attempt", response_model=RecallAttemptResponse)
def submit_attempt(
    session_id: str,
    attempt_in: RecallAttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(RecallSession).filter(
        RecallSession.id == session_id,
        RecallSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Recall session not found")
        
    attempt = record_recall_attempt(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        prompt=attempt_in.prompt,
        rating=attempt_in.rating,
        user_attempt=attempt_in.user_attempt,
        revealed_reference=attempt_in.revealed_reference,
        user_reflection=attempt_in.user_reflection,
        topic_id=attempt_in.topic_id or session.topic_id,
        note_id=attempt_in.note_id
    )
    return attempt

@router.get("/sessions", response_model=List[RecallSessionResponse])
def get_sessions(
    limit: int = 15,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(RecallSession).filter(
        RecallSession.user_id == current_user.id
    ).order_by(RecallSession.created_at.desc()).limit(limit).all()
    return sessions
