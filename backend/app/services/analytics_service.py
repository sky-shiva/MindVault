from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Any, List
from app.models.note import Note
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.revision import RevisionSchedule
from app.models.recall import RecallAttempt, RecallSession
from app.schemas.analytics import DashboardStats, DailyActivity, TopicMastery

def get_dashboard_analytics(db: Session, user_id: str) -> DashboardStats:
    now = datetime.now(timezone.utc)
    
    total_notes = db.query(Note).filter(Note.user_id == user_id, Note.is_archived == False).count()
    total_subjects = db.query(Subject).filter(Subject.user_id == user_id).count()
    total_topics = db.query(Topic).filter(Topic.user_id == user_id).count()
    
    # Revision counts
    due_revisions = db.query(RevisionSchedule).filter(
        RevisionSchedule.user_id == user_id,
        RevisionSchedule.next_review_at <= now
    ).count()
    
    completed_revisions = db.query(RevisionSchedule).filter(
        RevisionSchedule.user_id == user_id,
        RevisionSchedule.repetitions > 0
    ).count()
    
    # Recent notes
    recent_notes_query = db.query(Note).filter(
        Note.user_id == user_id,
        Note.is_archived == False
    ).order_by(Note.last_edited_at.desc()).limit(5).all()
    
    recent_notes = [
        {
            "id": n.id,
            "title": n.title,
            "mode": n.mode,
            "word_count": n.word_count,
            "last_edited_at": n.last_edited_at.isoformat() if n.last_edited_at else None,
            "subject_name": n.subject.name if n.subject else "General",
        }
        for n in recent_notes_query
    ]
    
    # Topic Mastery Evaluation
    schedules = db.query(RevisionSchedule).filter(RevisionSchedule.user_id == user_id).all()
    weak_topics: List[TopicMastery] = []
    strong_topics: List[TopicMastery] = []
    
    retention_scores = []
    for s in schedules:
        topic = s.topic
        if not topic:
            continue
        
        # Calculate topic-specific recall accuracy
        attempts = db.query(RecallAttempt).filter(RecallAttempt.topic_id == s.topic_id).all()
        if attempts:
            score_map = {"well": 1.0, "partial": 0.5, "forgot": 0.0}
            acc = (sum(score_map.get(a.rating, 0.0) for a in attempts) / len(attempts)) * 100.0
        else:
            acc = 100.0 if s.last_rating == "well" else (50.0 if s.last_rating == "partial" else 0.0)
            
        retention_scores.append(acc)
        status = "strong" if acc >= 75.0 else ("moderate" if acc >= 50.0 else "weak")
        
        item = TopicMastery(
            topic_id=s.topic_id,
            topic_title=topic.title,
            subject_name=topic.subject.name if topic.subject else "General",
            recall_accuracy=round(acc, 1),
            total_reviews=s.repetitions,
            status=status
        )
        if status == "weak":
            weak_topics.append(item)
        elif status == "strong":
            strong_topics.append(item)
            
    avg_retention = round(sum(retention_scores) / len(retention_scores), 1) if retention_scores else 85.0
    
    # Weekly Activity (Past 7 days)
    weekly_activity: List[DailyActivity] = []
    streak = 0
    day_had_review = True
    
    for i in range(6, -1, -1):
        target_day = now - timedelta(days=i)
        day_start = datetime(target_day.year, target_day.month, target_day.day, 0, 0, 0, tzinfo=timezone.utc)
        day_end = datetime(target_day.year, target_day.month, target_day.day, 23, 59, 59, tzinfo=timezone.utc)
        
        rev_count = db.query(RecallAttempt).join(RecallSession).filter(
            RecallSession.user_id == user_id,
            RecallAttempt.created_at >= day_start,
            RecallAttempt.created_at <= day_end
        ).count()
        
        notes_created = db.query(Note).filter(
            Note.user_id == user_id,
            Note.created_at >= day_start,
            Note.created_at <= day_end
        ).count()
        
        day_name = day_start.strftime("%a")
        date_str = day_start.strftime("%Y-%m-%d")
        
        weekly_activity.append(
            DailyActivity(
                date=date_str,
                day_name=day_name,
                reviews_count=rev_count,
                notes_created=notes_created
            )
        )
        if rev_count > 0 or notes_created > 0:
            if day_had_review:
                streak += 1
        else:
            if i <= 1:  # today or yesterday
                pass
            else:
                day_had_review = False

    return DashboardStats(
        total_notes=total_notes,
        total_subjects=total_subjects,
        total_topics=total_topics,
        due_revisions=due_revisions,
        completed_revisions=completed_revisions,
        learning_streak_days=max(1, streak),
        average_retention_rate=avg_retention,
        recent_notes=recent_notes,
        weak_topics=weak_topics[:5],
        strong_topics=strong_topics[:5],
        weekly_activity=weekly_activity
    )
