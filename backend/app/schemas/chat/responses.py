from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BaseConfig:
    from_attributes = True


class MessageResponse(BaseModel):
    """Single message response"""
    id: str
    role: str  # user, assistant, system
    content: str
    message_metadata: Optional[dict] = None
    created_at: datetime

    class Config(BaseConfig):
        pass


class ConversationResponse(BaseModel):
    """Conversation detail response"""
    id: str
    thread_id: str
    title: Optional[str]
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


class ChatResponse(BaseModel):
    """Chat response with AI reply"""
    conversation_id: str
    thread_id: str
    message: MessageResponse  # AI's response

    class Config(BaseConfig):
        pass
