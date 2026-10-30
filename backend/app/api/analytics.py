from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import DashboardStats
from app.services.analytics_service import get_dashboard_analytics

router = APIRouter(prefix="/analytics", tags=["Knowledge Analytics"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_analytics(db=db, user_id=current_user.id)
