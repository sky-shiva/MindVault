from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.note import Note
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("/", response_model=List[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    results = []
    for s in subjects:
        t_count = db.query(Topic).filter(Topic.subject_id == s.id).count()
        n_count = db.query(Note).filter(Note.subject_id == s.id, Note.is_archived == False).count()
        resp = SubjectResponse.model_validate(s)
        resp.topic_count = t_count
        resp.note_count = n_count
        results.append(resp)
    return results

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = Subject(
        user_id=current_user.id,
        name=subject_in.name,
        description=subject_in.description,
        color=subject_in.color or "#8B5CF6",
        icon=subject_in.icon or "BookOpen"
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    resp = SubjectResponse.model_validate(subject)
    resp.topic_count = 0
    resp.note_count = 0
    return resp

@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    t_count = db.query(Topic).filter(Topic.subject_id == subject.id).count()
    n_count = db.query(Note).filter(Note.subject_id == subject.id, Note.is_archived == False).count()
    resp = SubjectResponse.model_validate(subject)
    resp.topic_count = t_count
    resp.note_count = n_count
    return resp

@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: str,
    subject_in: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    if subject_in.name is not None:
        subject.name = subject_in.name
    if subject_in.description is not None:
        subject.description = subject_in.description
    if subject_in.color is not None:
        subject.color = subject_in.color
    if subject_in.icon is not None:
        subject.icon = subject_in.icon
        
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return None
