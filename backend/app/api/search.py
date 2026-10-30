from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.note import Note
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.flashcard import Flashcard

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("/")
def global_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    term = f"%{q}%"
    
    # 1. Notes
    notes = db.query(Note).filter(
        Note.user_id == current_user.id,
        Note.is_archived == False,
        (Note.title.ilike(term) | Note.content.ilike(term))
    ).limit(8).all()
    
    # 2. Subjects
    subjects = db.query(Subject).filter(
        Subject.user_id == current_user.id,
        Subject.name.ilike(term)
    ).limit(5).all()
    
    # 3. Topics
    topics = db.query(Topic).filter(
        Topic.user_id == current_user.id,
        Topic.title.ilike(term)
    ).limit(5).all()
    
    # 4. Flashcards
    flashcards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id,
        (Flashcard.front.ilike(term) | Flashcard.back.ilike(term))
    ).limit(5).all()
    
    return {
        "query": q,
        "total_results": len(notes) + len(subjects) + len(topics) + len(flashcards),
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "mode": n.mode,
                "preview": (n.content[:120] + "...") if n.content else "",
                "subject_name": n.subject.name if n.subject else "General"
            }
            for n in notes
        ],
        "subjects": [
            {"id": s.id, "name": s.name, "color": s.color, "icon": s.icon}
            for s in subjects
        ],
        "topics": [
            {"id": t.id, "title": t.title, "subject_name": t.subject.name if t.subject else "General"}
            for t in topics
        ],
        "flashcards": [
            {"id": f.id, "front": f.front, "back": f.back[:80]}
            for f in flashcards
        ]
    }
