from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

SUPPORTED_AI_MODELS: Dict[str, List[Dict[str, str]]] = {
    "gemini": [
        {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash (Recommended - Fast & Versatile)"},
        {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro (Deep Conceptual Reasoning)"},
        {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash (Next-Gen Speed)"},
    ],
    "openai": [
        {"id": "gpt-4o-mini", "name": "GPT-4o Mini (Recommended - Efficient & Accurate)"},
        {"id": "gpt-4o", "name": "GPT-4o (Flagship Multimodal Intelligence)"},
        {"id": "gpt-4-turbo", "name": "GPT-4 Turbo (High Capacity)"},
    ],
}

class AISettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    provider: str = "gemini"
    model_name: str = "gemini-1.5-flash"
    has_key: bool = False
    masked_key: Optional[str] = None
    is_valid: Optional[bool] = None
    last_tested_at: Optional[datetime] = None
    validation_message: Optional[str] = None
    available_providers: List[str] = ["gemini", "openai"]
    supported_models: Dict[str, List[Dict[str, str]]] = Field(default_factory=lambda: SUPPORTED_AI_MODELS)

class AISettingUpdate(BaseModel):
    provider: str = "gemini"
    model_name: Optional[str] = None
    api_key: Optional[str] = None  # If provided, encrypts and updates

class AITestConnectionRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None  # Optional: test candidate key or currently stored key
    model_name: Optional[str] = None

class AITestConnectionResponse(BaseModel):
    success: bool
    message: str
    provider: str
    model_name: str

class AIChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[AIChatMessage]] = Field(default_factory=list)
    context_note_ids: Optional[List[str]] = Field(default_factory=list)

class AIChatResponse(BaseModel):
    reply: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    provider_used: str
    model_used: str
    is_real_ai: bool
