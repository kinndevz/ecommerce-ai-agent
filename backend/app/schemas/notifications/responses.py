from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.core.enums import NotificationType


class BaseConfig:
    from_attributes = True


class NotificationData(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[str]
    action_url: Optional[str]
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime

    class Config(BaseConfig):
        pass


class NotificationResponse(BaseModel):
    success: bool
    message: str
    data: NotificationData

    class Config(BaseConfig):
        pass


class NotificationListResponse(BaseModel):
    success: bool
    message: str
    data: List[NotificationData]
    meta: dict

    class Config(BaseConfig):
        pass


class NotificationStatsResponse(BaseModel):
    success: bool
    message: str
    data: dict

    class Config(BaseConfig):
        pass


class MessageResponse(BaseModel):
    success: bool
    message: str

    class Config(BaseConfig):
        pass
