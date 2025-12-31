"""
Streaming event schemas
"""
from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


class StreamEventType(str, Enum):
    """Streaming event types"""
    STATUS = "status"
    CONTENT = "content"
    DONE = "done"
    ERROR = "error"


class BaseStreamEvent(BaseModel):
    """Base streaming event"""
    type: StreamEventType

    class Config:
        use_enum_values = True


class StatusEvent(BaseStreamEvent):
    """Processing status event"""
    type: Literal["status"] = "status"
    message: str = Field(..., description="Status message")
    stage: Optional[str] = Field(None, description="Processing stage")


class ContentEvent(BaseStreamEvent):
    """Content chunk event"""
    type: Literal["content"] = "content"
    chunk: str = Field(..., description="Content chunk")


class DoneEvent(BaseStreamEvent):
    """Completion event"""
    type: Literal["done"] = "done"
    message: str = Field(default="complete", description="Completion message")
    message_id: Optional[str] = Field(None, description="Created message ID")
    total_length: Optional[int] = Field(
        None, description="Total content length")


class ErrorEvent(BaseStreamEvent):
    """Error event"""
    type: Literal["error"] = "error"
    message: str = Field(..., description="Error message")
