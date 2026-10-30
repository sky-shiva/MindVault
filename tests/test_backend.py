import pytest
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, r"C:\MindVault\backend")

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.user import User

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_user_registration_and_login():
    email = "scholar@mindvault.edu"
    password = "RetentionMastery2026!"
    
    # 1. Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Ada Lovelace"}
    )
    assert reg_resp.status_code in [200, 400]  # 400 if already created in previous run
    
    # 2. Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token is not None

def test_complete_learning_workflow():
    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "scholar@mindvault.edu", "password": "RetentionMastery2026!"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Subject
    subj_resp = client.post(
        "/api/v1/subjects/",
        headers=headers,
        json={"name": "Computer Systems & Algorithms", "description": "Core CS principles", "color": "#8B5CF6", "icon": "Cpu"}
    )
    assert subj_resp.status_code == 201
    subj_id = subj_resp.json()["id"]
    
    # 2. Create Topic under Subject
    topic_resp = client.post(
        "/api/v1/topics/",
        headers=headers,
        json={"subject_id": subj_id, "title": "Dynamic Programming & Memoization", "description": "Breaking problems into subproblems"}
    )
    assert topic_resp.status_code == 201
    topic_id = topic_resp.json()["id"]
    
    # 3. Create Structured Note
    note_resp = client.post(
        "/api/v1/notes/",
        headers=headers,
        json={
            "subject_id": subj_id,
            "topic_id": topic_id,
            "title": "DP: Memoization vs Tabulation",
            "mode": "structured",
            "content": "Dynamic programming is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems.",
            "structured_content": {
                "topic_name": "Dynamic Programming",
                "definition": "Optimization technique storing subproblem solutions to prevent recomputation.",
                "simple_explanation": "Remembering past answers instead of redoing work.",
                "why_it_matters": "Reduces exponential time complexity O(2^n) to polynomial time O(n).",
                "how_it_works": "Overlapping subproblems and optimal substructure.",
                "architecture": "Top-Down (Memoization) vs Bottom-Up (Tabulation).",
                "examples": "Fibonacci numbers, Knapsack problem, Longest Common Subsequence.",
                "code_snippets": "def fib(n, memo={}): if n in memo: return memo[n] ...",
                "important_points": "Space-time tradeoff: uses additional memory O(n) for drastic time savings.",
                "my_understanding": "Whenever a tree has identical branches, cache the result.",
                "questions_doubts": "When is tabulation preferred over recursion with memoization?",
                "references": "Introduction to Algorithms (CLRS) Chapter 15."
            },
            "tags": ["algorithms", "cs", "interview-prep"]
        }
    )
    assert note_resp.status_code == 201
    note_id = note_resp.json()["id"]
    
    # 4. Query Notes
    get_notes_resp = client.get(f"/api/v1/notes/?subject_id={subj_id}", headers=headers)
    assert get_notes_resp.status_code == 200
    assert len(get_notes_resp.json()) >= 1
    
    # 5. Start Active Recall Session
    session_resp = client.post(
        "/api/v1/recall/session",
        headers=headers,
        json={"subject_id": subj_id, "topic_id": topic_id, "mode": "free_text"}
    )
    assert session_resp.status_code == 201
    session_id = session_resp.json()["id"]
    
    # 6. Submit Recall Attempt
    attempt_resp = client.post(
        f"/api/v1/recall/session/{session_id}/attempt",
        headers=headers,
        json={
            "prompt": "Explain the difference between memoization and tabulation.",
            "user_attempt": "Memoization is top-down recursion with caching; tabulation is bottom-up iterative table filling.",
            "rating": "well",
            "user_reflection": "Felt confident with the recurrence relation.",
            "topic_id": topic_id,
            "note_id": note_id
        }
    )
    assert attempt_resp.status_code == 200
    assert attempt_resp.json()["rating"] == "well"
    
    # 7. Check Dashboard Analytics
    analytics_resp = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert analytics_resp.status_code == 200
    stats = analytics_resp.json()
    assert stats["total_notes"] >= 1
    assert stats["total_subjects"] >= 1
    assert stats["learning_streak_days"] >= 1
    
    # 8. Test AI Flashcard Generator
    ai_card_resp = client.post(
        "/api/v1/ai/flashcards",
        headers=headers,
        json={"note_id": note_id, "count": 3}
    )
    assert ai_card_resp.status_code == 200
    assert len(ai_card_resp.json()) >= 1

    # 9. Test Personal Note RAG Search
    rag_resp = client.post(
        "/api/v1/ai/rag",
        headers=headers,
        json={"query": "time complexity memoization"}
    )
    assert rag_resp.status_code == 200
    assert len(rag_resp.json()["citations"]) >= 1

def test_data_isolation():
    # User B cannot see User A's private notes
    client.post(
        "/api/v1/auth/register",
        json={"email": "student_b@mindvault.edu", "password": "SecurePassword123!"}
    )
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": "student_b@mindvault.edu", "password": "SecurePassword123!"}
    )
    token_b = login_b.json()["access_token"]
    notes_b = client.get("/api/v1/notes/", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert len(notes_b) == 0


def test_user_configurable_ai_settings_and_encryption():
    # Login user
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "scholar@mindvault.edu", "password": "RetentionMastery2026!"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch initial AI settings
    get_res = client.get("/api/v1/ai/settings", headers=headers)
    assert get_res.status_code == 200
    initial_data = get_res.json()
    assert "available_providers" in initial_data
    assert "supported_models" in initial_data
    assert "gemini" in initial_data["supported_models"]
    assert "openai" in initial_data["supported_models"]

    # 2. Save user-configured API key (Gemini)
    raw_key = "AIzaSyFakeTestKeyForEncryptionValidation123456"
    save_res = client.post(
        "/api/v1/ai/settings",
        headers=headers,
        json={
            "provider": "gemini",
            "model_name": "gemini-1.5-flash",
            "api_key": raw_key
        }
    )
    assert save_res.status_code == 200
    saved_data = save_res.json()
    assert saved_data["has_key"] is True
    # Security check: verify raw key is NEVER returned in response!
    assert raw_key not in str(saved_data)
    # Masked representation present
    assert saved_data["masked_key"] == "AIza••••••••3456"

    # 3. Verify database storage is encrypted at rest (not plaintext)
    from app.models.ai_setting import UserAISetting
    from app.models.user import User
    from app.core.encryption import decrypt_secret
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "scholar@mindvault.edu").first()
        setting = db.query(UserAISetting).filter(UserAISetting.user_id == user.id).first()
        assert setting is not None
        # Must be ciphertext
        assert setting.encrypted_api_key != raw_key
        assert not setting.encrypted_api_key.startswith("AIza")
        # Decryption should reproduce the original raw key
        assert decrypt_secret(setting.encrypted_api_key) == raw_key
    finally:
        db.close()

    # 4. Test connection endpoint with invalid key format
    test_res = client.post(
        "/api/v1/ai/settings/test",
        headers=headers,
        json={"provider": "openai", "api_key": "invalid-key"}
    )
    assert test_res.status_code == 200
    assert test_res.json()["success"] is False

    # 5. Delete saved key
    del_res = client.delete("/api/v1/ai/settings/key", headers=headers)
    assert del_res.status_code == 200
    verify_res = client.get("/api/v1/ai/settings", headers=headers)
    assert verify_res.json()["has_key"] is False
    assert verify_res.json()["masked_key"] is None

def test_ai_chat_assistant_and_isolation():
    # User A chat
    login_a = client.post(
        "/api/v1/auth/login",
        json={"email": "scholar@mindvault.edu", "password": "RetentionMastery2026!"}
    )
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    chat_res = client.post(
        "/api/v1/ai/chat",
        headers=headers_a,
        json={"message": "What is memoization?"}
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "reply" in chat_data
    assert "provider_used" in chat_data

    # User B cannot see User A's AI settings
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": "student_b@mindvault.edu", "password": "SecurePassword123!"}
    )
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    settings_b = client.get("/api/v1/ai/settings", headers=headers_b).json()
    assert settings_b["has_key"] is False
