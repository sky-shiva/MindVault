from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.flashcard import Flashcard
from app.schemas.flashcard import (
    FlashcardCreate, FlashcardUpdate, FlashcardReview, FlashcardResponse
)

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

def build_flashcard_response(f: Flashcard) -> FlashcardResponse:
    return FlashcardResponse(
        id=f.id,
        user_id=f.user_id,
        topic_id=f.topic_id,
        note_id=f.note_id,
        front=f.front,
        back=f.back,
        difficulty=f.difficulty,
        repetitions=f.repetitions,
        interval_days=f.interval_days,
        last_rating=f.last_rating,
        next_review_at=f.next_review_at,
        created_at=f.created_at,
        updated_at=f.updated_at,
        topic_title=f.topic.title if f.topic else None
    )

@router.get("/", response_model=List[FlashcardResponse])
def get_flashcards(
    topic_id: Optional[str] = None,
    note_id: Optional[str] = None,
    due_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Flashcard).filter(Flashcard.user_id == current_user.id)
    if topic_id:
        query = query.filter(Flashcard.topic_id == topic_id)
    if note_id:
        query = query.filter(Flashcard.note_id == note_id)
    if due_only:
        now = datetime.now(timezone.utc)
        query = query.filter(Flashcard.next_review_at <= now)
        
    flashcards = query.order_by(Flashcard.next_review_at.asc()).all()
    return [build_flashcard_response(f) for f in flashcards]

@router.post("/", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
def create_flashcard(
    f_in: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = Flashcard(
        user_id=current_user.id,
        topic_id=f_in.topic_id,
        note_id=f_in.note_id,
        front=f_in.front,
        back=f_in.back,
        difficulty=f_in.difficulty or "medium",
        repetitions=0,
        interval_days=1,
        next_review_at=datetime.now(timezone.utc)
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return build_flashcard_response(card)

@router.post("/{card_id}/review", response_model=FlashcardResponse)
def review_flashcard(
    card_id: str,
    review_in: FlashcardReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
        
    now = datetime.now(timezone.utc)
    rating = review_in.rating
    card.last_rating = rating
    
    if rating == "forgot":
        card.repetitions = 0
        card.interval_days = 1
        card.next_review_at = now + timedelta(days=1)
    elif rating == "partial":
        card.repetitions = max(1, card.repetitions)
        card.interval_days = max(2, int(card.interval_days * 1.3))
        card.next_review_at = now + timedelta(days=card.interval_days)
    else:  # "well"
        card.repetitions += 1
        intervals = [1, 3, 7, 14, 30, 60]
        if card.repetitions <= len(intervals):
            card.interval_days = intervals[card.repetitions - 1]
        else:
            card.interval_days = int(card.interval_days * 2.2)
        card.next_review_at = now + timedelta(days=card.interval_days)
        
    db.commit()
    db.refresh(card)
    return build_flashcard_response(card)

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard(
    card_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    db.delete(card)
    db.commit()
    return None
