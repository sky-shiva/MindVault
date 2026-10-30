from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.tag import Tag
from app.schemas.tag import TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.get("/", response_model=List[TagResponse])
def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    results = []
    for t in tags:
        resp = TagResponse(
            id=t.id,
            user_id=t.user_id,
            name=t.name,
            created_at=t.created_at,
            note_count=len(t.notes)
        )
        results.append(resp)
    return results
