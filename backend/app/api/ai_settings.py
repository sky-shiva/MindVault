from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ai_setting import UserAISetting
from app.models.note import Note
from app.schemas.ai_setting import (
    AISettingResponse, AISettingUpdate,
    AITestConnectionRequest, AITestConnectionResponse,
    AIChatRequest, AIChatResponse, SUPPORTED_AI_MODELS
)
from app.core.encryption import encrypt_secret, decrypt_secret, mask_api_key
from app.services.ai_provider import ai_service
from app.services.rag_service import tokenize, chunk_text

router = APIRouter(prefix="/ai", tags=["AI Settings & Assistant"])

def get_or_create_user_ai_setting(db: Session, user_id: str) -> UserAISetting:
    setting = db.query(UserAISetting).filter(UserAISetting.user_id == user_id).first()
    if not setting:
        setting = UserAISetting(
            user_id=user_id,
            provider="gemini",
            model_name="gemini-1.5-flash",
            encrypted_api_key=None,
            is_valid=None
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.get("/settings", response_model=AISettingResponse)
def get_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns current user's AI configuration.
    API keys are NEVER returned plaintext.
    """
    setting = get_or_create_user_ai_setting(db, current_user.id)
    raw_key = decrypt_secret(setting.encrypted_api_key) if setting.encrypted_api_key else ""
    
    return AISettingResponse(
        provider=setting.provider,
        model_name=setting.model_name,
        has_key=bool(raw_key),
        masked_key=mask_api_key(raw_key) if raw_key else None,
        is_valid=setting.is_valid,
        last_tested_at=setting.last_tested_at,
        validation_message=setting.validation_message,
        available_providers=["gemini", "openai"],
        supported_models=SUPPORTED_AI_MODELS
    )

@router.post("/settings", response_model=AISettingResponse)
def update_ai_settings(
    update_in: AISettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the user's provider and model choice.
    If an API key is provided, it is encrypted with Fernet AES-128-CBC before database storage.
    """
    setting = get_or_create_user_ai_setting(db, current_user.id)
    
    # Validate provider
    prov = update_in.provider.lower().strip()
    if prov not in ["gemini", "openai"]:
        raise HTTPException(status_code=400, detail="Invalid provider. Must be 'gemini' or 'openai'.")
        
    setting.provider = prov
    
    # Model validation
    if update_in.model_name:
        setting.model_name = update_in.model_name.strip()
    else:
        setting.model_name = "gemini-1.5-flash" if prov == "gemini" else "gpt-4o-mini"
        
    # Update key if provided
    if update_in.api_key is not None:
        clean_key = update_in.api_key.strip()
        if clean_key:
            setting.encrypted_api_key = encrypt_secret(clean_key)
            # Reset verification status until re-tested
            setting.is_valid = None
            setting.validation_message = "Key updated. Run 'Test Connection' to verify."
        else:
            setting.encrypted_api_key = None
            setting.is_valid = None
            setting.validation_message = None

    db.commit()
    db.refresh(setting)
    
    raw_key = decrypt_secret(setting.encrypted_api_key) if setting.encrypted_api_key else ""
    return AISettingResponse(
        provider=setting.provider,
        model_name=setting.model_name,
        has_key=bool(raw_key),
        masked_key=mask_api_key(raw_key) if raw_key else None,
        is_valid=setting.is_valid,
        last_tested_at=setting.last_tested_at,
        validation_message=setting.validation_message,
        available_providers=["gemini", "openai"],
        supported_models=SUPPORTED_AI_MODELS
    )

@router.post("/settings/test", response_model=AITestConnectionResponse)
async def test_ai_connection(
    test_in: AITestConnectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tests live connectivity to Google Gemini or OpenAI.
    Can test an unsaved key from the input form or test the currently stored key.
    """
    setting = get_or_create_user_ai_setting(db, current_user.id)
    
    # Determine which key to test
    if test_in.api_key and test_in.api_key.strip():
        candidate_key = test_in.api_key.strip()
    else:
        candidate_key = decrypt_secret(setting.encrypted_api_key)
        
    if not candidate_key:
        raise HTTPException(
            status_code=400,
            detail="No API key supplied or saved to test. Enter an API key first."
        )

    provider = test_in.provider.lower().strip()
    model = test_in.model_name or setting.model_name
    
    success, message = await ai_service.test_connection(provider, candidate_key, model)
    
    # If testing saved key, persist test result
    if not test_in.api_key or test_in.api_key.strip() == decrypt_secret(setting.encrypted_api_key):
        setting.is_valid = success
        setting.last_tested_at = datetime.now(timezone.utc)
        setting.validation_message = message
        db.commit()
        
    return AITestConnectionResponse(
        success=success,
        message=message,
        provider=provider,
        model_name=model
    )

@router.delete("/settings/key")
def delete_ai_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently deletes the user's saved API key from the database.
    """
    setting = get_or_create_user_ai_setting(db, current_user.id)
    setting.encrypted_api_key = None
    setting.is_valid = None
    setting.last_tested_at = None
    setting.validation_message = None
    db.commit()
    return {"message": "API key deleted successfully."}

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Interactive AI learning companion chat endpoint.
    Context-aware: extracts relevant passages from the user's private notes.
    Uses the user's configured provider & key.
    """
    setting = get_or_create_user_ai_setting(db, current_user.id)
    user_api_key = decrypt_secret(setting.encrypted_api_key) if setting.encrypted_api_key else None
    
    # Extract relevant user notes for context
    notes_query = db.query(Note).filter(Note.user_id == current_user.id, Note.is_archived == False)
    if req.context_note_ids:
        notes_query = notes_query.filter(Note.id.in_(req.context_note_ids))
    notes = notes_query.all()
    
    # Retrieve top matched note snippets
    query_tokens = tokenize(req.message)
    scored_snippets = []
    citations = []
    
    for n in notes:
        text = (n.title or "") + "\n" + (n.content or "")
        if n.structured_content:
            text += "\n" + "\n".join(f"{k}: {v}" for k, v in n.structured_content.items() if v)
        chunks = chunk_text(text)
        for ch in chunks:
            ch_tokens = tokenize(ch)
            overlap = query_tokens.intersection(ch_tokens)
            if overlap:
                score = len(overlap) / (len(query_tokens) + 0.1)
                scored_snippets.append({"score": score, "note_title": n.title, "note_id": n.id, "chunk": ch})
                
    scored_snippets.sort(key=lambda x: x["score"], reverse=True)
    top_snippets = scored_snippets[:2]
    
    notes_context_str = ""
    for snip in top_snippets:
        notes_context_str += f"- Note '{snip['note_title']}': {snip['chunk'][:250]}...\n"
        citations.append({
            "note_id": snip["note_id"],
            "note_title": snip["note_title"],
            "snippet": snip["chunk"][:120] + "..."
        })

    # Prepare history for AI
    hist_payload = [{"role": m.role, "content": m.content} for m in (req.history or [])]
    
    chat_result = await ai_service.chat(
        message=req.message,
        history=hist_payload,
        provider=setting.provider,
        api_key=user_api_key,
        model_name=setting.model_name,
        notes_context=notes_context_str if notes_context_str else None
    )
    
    return AIChatResponse(
        reply=chat_result["reply"],
        citations=citations,
        provider_used=chat_result["provider_used"],
        model_used=chat_result["model_used"],
        is_real_ai=chat_result["is_real_ai"]
    )
