from pydantic import BaseModel, Field
from typing import Optional, List
from app.core.enums import NotificationType


class BaseConfig:
    from_attributes = True


class NotificationCreateRequest(BaseModel):
    user_id: str
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    data: Optional[str] = None
    action_url: Optional[str] = Field(None, max_length=500)

    class Config(BaseConfig):
        pass


class BroadcastNotificationRequest(BaseModel):
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    action_url: Optional[str] = Field(None, max_length=500)

    class Config(BaseConfig):
        pass


class MarkAsReadRequest(BaseModel):
    notification_ids: List[str] = Field(..., min_items=1)

    class Config(BaseConfig):
        pass
