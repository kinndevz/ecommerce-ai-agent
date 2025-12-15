from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Dict

T = TypeVar('T')


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: Optional[T] = None
    meta: Optional[Dict] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Simple message response (for delete, etc.)"""
    success: bool
    message: str

    class Config:
        from_attributes = True
