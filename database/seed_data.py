"""
MindVault Database Seeding Script
Populates high-value academic and engineering notes, subjects, topics, flashcards,
and revision schedules for demonstration and immediate local verification.
"""

import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.note import Note
from app.models.tag import Tag
from app.models.flashcard import Flashcard
from app.models.revision import RevisionSchedule
from app.models.goal import LearningGoal

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Scholar User
        user = db.query(User).filter(User.email == "scholar@mindvault.edu").first()
        if not user:
            user = User(
                email="scholar@mindvault.edu",
                hashed_password=get_password_hash("RetentionMastery2026!"),
                full_name="Ada Lovelace",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("[+] Created user: scholar@mindvault.edu")
        else:
            print("[*] User already exists: scholar@mindvault.edu")

        # 2. Create Subjects
        sub_cs = db.query(Subject).filter(Subject.user_id == user.id, Subject.name == "Computer Systems & Algorithms").first()
        if not sub_cs:
            sub_cs = Subject(
                user_id=user.id,
                name="Computer Systems & Algorithms",
                description="Core concepts in distributed consensus, memory hierarchies, and complexity theory.",
                color="#8B5CF6",
                icon="Cpu"
            )
            db.add(sub_cs)

        sub_neuro = db.query(Subject).filter(Subject.user_id == user.id, Subject.name == "Cognitive Neuroscience").first()
        if not sub_neuro:
            sub_neuro = Subject(
                user_id=user.id,
                name="Cognitive Neuroscience",
                description="Synaptic plasticity, memory consolidation, and hippocampal recall pathways.",
                color="#06B6D4",
                icon="Brain"
            )
            db.add(sub_neuro)

        db.commit()

        # 3. Create Topics
        t_dp = db.query(Topic).filter(Topic.user_id == user.id, Topic.title == "Dynamic Programming & Memoization").first()
        if not t_dp:
            t_dp = Topic(
                user_id=user.id,
                subject_id=sub_cs.id,
                title="Dynamic Programming & Memoization",
                description="Breaking recursive problems into overlapping subproblems with cached solutions.",
                order_index=1
            )
            db.add(t_dp)

        t_raft = db.query(Topic).filter(Topic.user_id == user.id, Topic.title == "Raft Distributed Consensus").first()
        if not t_raft:
            t_raft = Topic(
                user_id=user.id,
                subject_id=sub_cs.id,
                title="Raft Distributed Consensus",
                description="Leader election, log replication, and split-brain safety in cluster nodes.",
                order_index=2
            )
            db.add(t_raft)

        t_ebbinghaus = db.query(Topic).filter(Topic.user_id == user.id, Topic.title == "The Forgetting Curve & Spaced Retrieval").first()
        if not t_ebbinghaus:
            t_ebbinghaus = Topic(
                user_id=user.id,
                subject_id=sub_neuro.id,
                title="The Forgetting Curve & Spaced Retrieval",
                description="Mathematical models of memory decay and optimal revision intervals.",
                order_index=1
            )
            db.add(t_ebbinghaus)

        db.commit()

        # 4. Create Revision Schedules
        now = datetime.now(timezone.utc)
        for t, reps, interval, rating, status_val, due_offset in [
            (t_dp, 3, 7, "well", "upcoming", 3),
            (t_raft, 0, 1, "forgot", "due", -1),  # Overdue / due today
            (t_ebbinghaus, 4, 14, "well", "upcoming", 9),
        ]:
            sched = db.query(RevisionSchedule).filter(RevisionSchedule.topic_id == t.id).first()
            if not sched:
                sched = RevisionSchedule(
                    user_id=user.id,
                    topic_id=t.id,
                    repetitions=reps,
                    interval_days=interval,
                    ease_factor=2.5,
                    last_reviewed_at=now - timedelta(days=2),
                    next_review_at=now + timedelta(days=due_offset),
                    last_rating=rating,
                    status=status_val
                )
                db.add(sched)

        # 5. Create Structured Note
        note_dp = db.query(Note).filter(Note.user_id == user.id, Note.title == "DP: Memoization vs Tabulation").first()
        if not note_dp:
            note_dp = Note(
                user_id=user.id,
                subject_id=sub_cs.id,
                topic_id=t_dp.id,
                title="DP: Memoization vs Tabulation",
                mode="structured",
                content="Dynamic Programming is both a mathematical optimization method and a computer programming method.",
                structured_content={
                    "topic_name": "Dynamic Programming",
                    "definition": "Optimization technique storing subproblem solutions to prevent recomputation.",
                    "simple_explanation": "Remembering past answers instead of redoing work every time.",
                    "why_it_matters": "Reduces exponential time complexity O(2^n) to polynomial time O(n).",
                    "how_it_works": "Overlapping subproblems and optimal substructure.",
                    "architecture": "Top-Down (Memoization) vs Bottom-Up (Tabulation).",
                    "examples": "Fibonacci numbers, 0/1 Knapsack problem, Longest Common Subsequence.",
                    "code_snippets": "def fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]",
                    "important_points": "Space-time tradeoff: uses additional memory O(n) for drastic time savings.",
                    "my_understanding": "Whenever a decision tree has identical sub-branches, cache the result.",
                    "questions_doubts": "When is tabulation preferred over recursion with memoization?",
                    "references": "Introduction to Algorithms (CLRS) Chapter 15."
                },
                is_pinned=True,
                is_favorite=True,
                word_count=180,
                last_edited_at=now
            )
            db.add(note_dp)

        # 6. Create Flashcards
        for front, back, diff, t_ref in [
            ("What is the CAP Theorem?", "In a distributed data store, you can only guarantee at most two of Consistency, Availability, and Partition Tolerance.", "medium", t_raft),
            ("Top-Down vs Bottom-Up Dynamic Programming?", "Top-Down uses recursion + memoization table; Bottom-Up uses iteration + table initialization from base cases.", "easy", t_dp),
            ("What is Ebbinghaus's spacing effect?", "Information is recalled better when study sessions are spaced out over increasing intervals rather than crammed in one session.", "easy", t_ebbinghaus)
        ]:
            card = db.query(Flashcard).filter(Flashcard.user_id == user.id, Flashcard.front == front).first()
            if not card:
                card = Flashcard(
                    user_id=user.id,
                    topic_id=t_ref.id,
                    front=front,
                    back=back,
                    difficulty=diff,
                    repetitions=1,
                    interval_days=3,
                    next_review_at=now + timedelta(days=1)
                )
                db.add(card)

        # 7. Create Learning Goal
        goal = db.query(LearningGoal).filter(LearningGoal.user_id == user.id, LearningGoal.title == "Crack Distributed Systems & DP Exam").first()
        if not goal:
            goal = LearningGoal(
                user_id=user.id,
                subject_id=sub_cs.id,
                title="Crack Distributed Systems & DP Exam",
                description="Achieve 90%+ recall mastery on consensus algorithms and dynamic programming.",
                target_date=now + timedelta(days=30),
                status="in_progress",
                progress_percentage=65
            )
            db.add(goal)

        db.commit()
        print("[+] Seed data successfully initialized!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
