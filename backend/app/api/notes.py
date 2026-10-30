from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.note import Note
from app.models.tag import Tag
from app.models.subject import Subject
from app.models.topic import Topic
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])

def compute_word_count(content: str, structured: dict) -> int:
    text = content or ""
    if structured and isinstance(structured, dict):
        text += " " + " ".join(str(v) for v in structured.values() if v)
    return len(text.split())

def build_note_response(note: Note) -> NoteResponse:
    tag_names = [t.name for t in note.tags] if note.tags else []
    return NoteResponse(
        id=note.id,
        user_id=note.user_id,
        subject_id=note.subject_id,
        topic_id=note.topic_id,
        title=note.title,
        mode=note.mode,
        content=note.content or "",
        structured_content=note.structured_content or {},
        is_pinned=note.is_pinned,
        is_favorite=note.is_favorite,
        is_archived=note.is_archived,
        word_count=note.word_count,
        last_edited_at=note.last_edited_at or note.created_at,
        created_at=note.created_at,
        updated_at=note.updated_at,
        tag_names=tag_names,
        subject_name=note.subject.name if note.subject else None,
        topic_title=note.topic.title if note.topic else None
    )

@router.get("/", response_model=List[NoteResponse])
def get_notes(
    subject_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    tag: Optional[str] = None,
    pinned_only: Optional[bool] = False,
    favorites_only: Optional[bool] = False,
    include_archived: Optional[bool] = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Note).filter(Note.user_id == current_user.id)
    
    if not include_archived:
        query = query.filter(Note.is_archived == False)
    if subject_id:
        query = query.filter(Note.subject_id == subject_id)
    if topic_id:
        query = query.filter(Note.topic_id == topic_id)
    if pinned_only:
        query = query.filter(Note.is_pinned == True)
    if favorites_only:
        query = query.filter(Note.is_favorite == True)
    if tag:
        query = query.join(Note.tags).filter(Tag.name == tag)
    if search:
        s_term = f"%{search}%"
        query = query.filter((Note.title.ilike(s_term)) | (Note.content.ilike(s_term)))
        
    notes = query.order_by(Note.is_pinned.desc(), Note.last_edited_at.desc()).all()
    return [build_note_response(n) for n in notes]

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    words = compute_word_count(note_in.content or "", note_in.structured_content or {})
    note = Note(
        user_id=current_user.id,
        subject_id=note_in.subject_id,
        topic_id=note_in.topic_id,
        title=note_in.title or "Untitled Note",
        mode=note_in.mode or "freeform",
        content=note_in.content or "",
        structured_content=note_in.structured_content or {},
        is_pinned=note_in.is_pinned or False,
        is_favorite=note_in.is_favorite or False,
        is_archived=note_in.is_archived or False,
        word_count=words,
        last_edited_at=datetime.now(timezone.utc)
    )
    
    if note_in.tags:
        for t_name in note_in.tags:
            tag_name_clean = t_name.strip().lower()
            if not tag_name_clean:
                continue
            tag = db.query(Tag).filter(Tag.user_id == current_user.id, Tag.name == tag_name_clean).first()
            if not tag:
                tag = Tag(user_id=current_user.id, name=tag_name_clean)
                db.add(tag)
            note.tags.append(tag)
            
    db.add(note)
    db.commit()
    db.refresh(note)
    return build_note_response(note)

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return build_note_response(note)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    if note_in.title is not None:
        note.title = note_in.title
    if note_in.mode is not None:
        note.mode = note_in.mode
    if note_in.content is not None:
        note.content = note_in.content
    if note_in.structured_content is not None:
        note.structured_content = note_in.structured_content
    if note_in.subject_id is not None:
        note.subject_id = note_in.subject_id if note_in.subject_id != "" else None
    if note_in.topic_id is not None:
        note.topic_id = note_in.topic_id if note_in.topic_id != "" else None
    if note_in.is_pinned is not None:
        note.is_pinned = note_in.is_pinned
    if note_in.is_favorite is not None:
        note.is_favorite = note_in.is_favorite
    if note_in.is_archived is not None:
        note.is_archived = note_in.is_archived
        
    if note_in.tags is not None:
        note.tags.clear()
        for t_name in note_in.tags:
            tag_name_clean = t_name.strip().lower()
            if not tag_name_clean:
                continue
            tag = db.query(Tag).filter(Tag.user_id == current_user.id, Tag.name == tag_name_clean).first()
            if not tag:
                tag = Tag(user_id=current_user.id, name=tag_name_clean)
                db.add(tag)
            note.tags.append(tag)
            
    note.word_count = compute_word_count(note.content, note.structured_content)
    note.last_edited_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(note)
    return build_note_response(note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return None
