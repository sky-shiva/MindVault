from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.revision import RevisionSchedule
from app.schemas.topic import TopicCreate, TopicUpdate, TopicResponse

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("/", response_model=List[TopicResponse])
def get_topics(
    subject_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Topic).filter(Topic.user_id == current_user.id)
    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    topics = query.order_by(Topic.order_index.asc()).all()
    
    results = []
    for t in topics:
        sched = db.query(RevisionSchedule).filter(RevisionSchedule.topic_id == t.id).first()
        resp = TopicResponse.model_validate(t)
        if sched:
            resp.next_review_at = sched.next_review_at
            resp.revision_status = sched.status
        results.append(resp)
    return results

@router.post("/", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == topic_in.subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    topic = Topic(
        user_id=current_user.id,
        subject_id=topic_in.subject_id,
        title=topic_in.title,
        description=topic_in.description,
        order_index=topic_in.order_index or 0
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    # Initialize Revision Schedule for active recall
    now = datetime.now(timezone.utc)
    schedule = RevisionSchedule(
        user_id=current_user.id,
        topic_id=topic.id,
        repetitions=0,
        interval_days=1,
        ease_factor=2.5,
        next_review_at=now + timedelta(days=1),
        status="due"
    )
    db.add(schedule)
    db.commit()
    
    resp = TopicResponse.model_validate(topic)
    resp.next_review_at = schedule.next_review_at
    resp.revision_status = schedule.status
    return resp

@router.put("/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: str,
    topic_in: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(
        Topic.id == topic_id,
        Topic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    if topic_in.title is not None:
        topic.title = topic_in.title
    if topic_in.description is not None:
        topic.description = topic_in.description
    if topic_in.order_index is not None:
        topic.order_index = topic_in.order_index
        
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(
        Topic.id == topic_id,
        Topic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return None
