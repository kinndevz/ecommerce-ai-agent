from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from app.core.constant import HTTPMethod, UserStatus
from datetime import datetime


# Base
class BaseConfig:
    from_attributes = True


# ========== Permission Schema ==========
class PermissionOut(BaseModel):
    """Permission output schema"""
    id: str
    name: str
    description: str
    path: str
    method: HTTPMethod
    module: str

    class Config(BaseConfig):
        pass


# ========== Role Schema ==========

class RoleOut(BaseModel):
    """Role output with permissions"""
    id: str
    name: str
    description: str
    is_active: bool
    permissions: List[PermissionOut] = []

    class Config(BaseConfig):
        pass


class RoleResponse(BaseModel):
    """Role information in user response"""
    id: str
    name: str
    description: str

    class Config(BaseConfig):
        pass


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: Optional[str]
    avatar: Optional[str]
    status: UserStatus
    is_2fa_enabled: bool
    role: RoleResponse
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[str]
    updated_by_id: Optional[str]

    class Config(BaseConfig):
        pass


class UserCreateRequest(BaseModel):
    """Admin can create user directly without OTP"""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=15)
    role_id: str
    status: UserStatus = UserStatus.ACTIVE

    class Config(BaseConfig):
        pass


class UserUpdateRequest(BaseModel):
    """Update user information"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=15)
    avatar: Optional[str] = None
    role_id: Optional[str] = None

    class Config(BaseConfig):
        pass


class UserListResponse(BaseModel):
    """User list with pagination"""
    success: bool
    message: str
    data: list[UserResponse]
    meta: dict

    class Config(BaseConfig):
        pass


class UserDetailResponse(BaseModel):
    """Detailed user response"""
    success: bool
    message: str
    data: UserResponse

    class Config(BaseConfig):
        pass


class MessageResponse(BaseModel):
    """Generic message response"""
    success: bool
    message: str
    data: Optional[dict] = None
