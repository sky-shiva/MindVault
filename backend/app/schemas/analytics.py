from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DailyActivity(BaseModel):
    date: str
    day_name: str
    reviews_count: int
    notes_created: int

class TopicMastery(BaseModel):
    topic_id: str
    topic_title: str
    subject_name: str
    recall_accuracy: float
    total_reviews: int
    status: str  # "weak", "moderate", "strong"

class DashboardStats(BaseModel):
    total_notes: int
    total_subjects: int
    total_topics: int
    due_revisions: int
    completed_revisions: int
    learning_streak_days: int
    average_retention_rate: float
    recent_notes: List[Dict[str, Any]]
    weak_topics: List[TopicMastery]
    strong_topics: List[TopicMastery]
    weekly_activity: List[DailyActivity]
