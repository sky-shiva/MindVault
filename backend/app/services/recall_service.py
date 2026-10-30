from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.recall import RecallSession, RecallAttempt
from app.models.topic import Topic
from app.models.note import Note
from app.models.revision import RevisionSchedule
from app.services.revision_planner import calculate_next_revision

def create_recall_session(
    db: Session,
    user_id: str,
    subject_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    mode: str = "free_text"
) -> RecallSession:
    session = RecallSession(
        user_id=user_id,
        subject_id=subject_id,
        topic_id=topic_id,
        mode=mode,
        total_items=0,
        completed_items=0,
        score_percentage=0.0
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def record_recall_attempt(
    db: Session,
    session_id: str,
    user_id: str,
    prompt: str,
    rating: str,
    user_attempt: Optional[str] = None,
    revealed_reference: Optional[str] = None,
    user_reflection: Optional[str] = None,
    topic_id: Optional[str] = None,
    note_id: Optional[str] = None
) -> RecallAttempt:
    attempt = RecallAttempt(
        session_id=session_id,
        topic_id=topic_id,
        note_id=note_id,
        prompt=prompt,
        user_attempt=user_attempt,
        revealed_reference=revealed_reference,
        rating=rating,
        user_reflection=user_reflection
    )
    db.add(attempt)
    
    # Update RevisionSchedule if topic_id is provided
    if topic_id:
        schedule = db.query(RevisionSchedule).filter(
            RevisionSchedule.topic_id == topic_id,
            RevisionSchedule.user_id == user_id
        ).first()
        
        if not schedule:
            schedule = RevisionSchedule(
                user_id=user_id,
                topic_id=topic_id,
                repetitions=0,
                interval_days=1,
                ease_factor=2.5
            )
            db.add(schedule)
            
        reps, interval, ease, next_review, status = calculate_next_revision(
            schedule.repetitions,
            schedule.interval_days,
            schedule.ease_factor,
            rating
        )
        schedule.repetitions = reps
        schedule.interval_days = interval
        schedule.ease_factor = ease
        schedule.last_reviewed_at = datetime.now(timezone.utc)
        schedule.next_review_at = next_review
        schedule.last_rating = rating
        schedule.status = status
    
    # Recalculate session statistics
    session = db.query(RecallSession).filter(RecallSession.id == session_id).first()
    if session:
        session.completed_items = (session.completed_items or 0) + 1
        all_attempts = db.query(RecallAttempt).filter(RecallAttempt.session_id == session_id).all()
        # Scoring: 'well' = 100%, 'partial' = 50%, 'forgot' = 0%
        score_map = {"well": 100.0, "partial": 50.0, "forgot": 0.0}
        total_score = sum(score_map.get(a.rating, 0.0) for a in all_attempts) + score_map.get(rating, 0.0)
        session.score_percentage = round(total_score / (len(all_attempts) + 1), 1)
        session.completed_at = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(attempt)
    return attempt
