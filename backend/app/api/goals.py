from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.goal import LearningGoal
from app.schemas.goal import LearningGoalCreate, LearningGoalUpdate, LearningGoalResponse

router = APIRouter(prefix="/goals", tags=["Learning Goals"])

def build_goal_response(g: LearningGoal) -> LearningGoalResponse:
    return LearningGoalResponse(
        id=g.id,
        user_id=g.user_id,
        subject_id=g.subject_id,
        title=g.title,
        description=g.description,
        target_date=g.target_date,
        status=g.status,
        progress_percentage=g.progress_percentage,
        created_at=g.created_at,
        updated_at=g.updated_at,
        subject_name=g.subject.name if g.subject else None
    )

@router.get("/", response_model=List[LearningGoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(LearningGoal).filter(
        LearningGoal.user_id == current_user.id
    ).order_by(LearningGoal.created_at.desc()).all()
    return [build_goal_response(g) for g in goals]

@router.post("/", response_model=LearningGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: LearningGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = LearningGoal(
        user_id=current_user.id,
        subject_id=goal_in.subject_id,
        title=goal_in.title,
        description=goal_in.description,
        target_date=goal_in.target_date,
        status=goal_in.status or "in_progress",
        progress_percentage=goal_in.progress_percentage or 0
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return build_goal_response(goal)

@router.put("/{goal_id}", response_model=LearningGoalResponse)
def update_goal(
    goal_id: str,
    goal_in: LearningGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(LearningGoal).filter(
        LearningGoal.id == goal_id,
        LearningGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
        
    if goal_in.title is not None:
        goal.title = goal_in.title
    if goal_in.description is not None:
        goal.description = goal_in.description
    if goal_in.target_date is not None:
        goal.target_date = goal_in.target_date
    if goal_in.status is not None:
        goal.status = goal_in.status
    if goal_in.progress_percentage is not None:
        goal.progress_percentage = goal_in.progress_percentage
    if goal_in.subject_id is not None:
        goal.subject_id = goal_in.subject_id
        
    db.commit()
    db.refresh(goal)
    return build_goal_response(goal)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(LearningGoal).filter(
        LearningGoal.id == goal_id,
        LearningGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    db.delete(goal)
    db.commit()
    return None
