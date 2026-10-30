from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.topic import Topic
from app.models.revision import RevisionSchedule
from app.schemas.revision import RevisionScheduleResponse, RevisionReviewSubmit
from app.services.revision_planner import calculate_next_revision

router = APIRouter(prefix="/revision", tags=["Revision Planner"])

def build_revision_response(s: RevisionSchedule) -> RevisionScheduleResponse:
    topic_title = s.topic.title if s.topic else "General Topic"
    subject_name = s.topic.subject.name if (s.topic and s.topic.subject) else "General"
    return RevisionScheduleResponse(
        id=s.id,
        user_id=s.user_id,
        topic_id=s.topic_id,
        topic_title=topic_title,
        subject_name=subject_name,
        repetitions=s.repetitions,
        interval_days=s.interval_days,
        ease_factor=s.ease_factor,
        last_reviewed_at=s.last_reviewed_at,
        next_review_at=s.next_review_at,
        last_rating=s.last_rating,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at
    )

@router.get("/due", response_model=List[RevisionScheduleResponse])
def get_due_revisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    schedules = db.query(RevisionSchedule).filter(
        RevisionSchedule.user_id == current_user.id,
        RevisionSchedule.next_review_at <= now
    ).order_by(RevisionSchedule.next_review_at.asc()).all()
    return [build_revision_response(s) for s in schedules]

@router.get("/upcoming", response_model=List[RevisionScheduleResponse])
def get_upcoming_revisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    schedules = db.query(RevisionSchedule).filter(
        RevisionSchedule.user_id == current_user.id,
        RevisionSchedule.next_review_at > now
    ).order_by(RevisionSchedule.next_review_at.asc()).all()
    return [build_revision_response(s) for s in schedules]

@router.post("/{topic_id}/review", response_model=RevisionScheduleResponse)
def submit_topic_review(
    topic_id: str,
    review_in: RevisionReviewSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedule = db.query(RevisionSchedule).filter(
        RevisionSchedule.topic_id == topic_id,
        RevisionSchedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        schedule = RevisionSchedule(
            user_id=current_user.id,
            topic_id=topic_id,
            repetitions=0,
            interval_days=1,
            ease_factor=2.5
        )
        db.add(schedule)
        
    reps, interval, ease, next_rev, status_val = calculate_next_revision(
        schedule.repetitions,
        schedule.interval_days,
        schedule.ease_factor,
        review_in.rating
    )
    
    schedule.repetitions = reps
    schedule.interval_days = interval
    schedule.ease_factor = ease
    schedule.last_reviewed_at = datetime.now(timezone.utc)
    schedule.next_review_at = next_rev
    schedule.last_rating = review_in.rating
    schedule.status = status_val
    
    db.commit()
    db.refresh(schedule)
    return build_revision_response(schedule)
