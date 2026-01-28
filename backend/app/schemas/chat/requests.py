from pydantic import BaseModel, Field
from typing import Optional


class BaseConfig:
    from_attributes = True


class ChatRequest(BaseModel):
    """Chat message request"""
    message: str = Field(..., min_length=1, max_length=2000,
                         description="User message")
    conversation_id: Optional[str] = Field(
        None, description="Existing conversation ID (optional for new conversation)")
    is_active: bool = Field(
        True, description="If False, message will be hidden from UI (used for system-triggered prompts)")

    class Config(BaseConfig):
        pass
