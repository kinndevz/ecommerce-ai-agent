from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.enums import HTTPMethod


class BaseConfig:
    from_attributes = True


# Permission Schemas

class PermissionData(BaseModel):
    """Permission data structure"""
    id: str
    name: str
    description: str
    path: str
    method: HTTPMethod
    module: str
    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


class PermissionResponse(BaseModel):
    """Single permission response"""
    success: bool
    message: str
    data: PermissionData

    class Config(BaseConfig):
        pass


class PermissionListResponse(BaseModel):
    """Permission list response with pagination"""
    success: bool
    message: str
    data: List[PermissionData]
    meta: dict

    class Config(BaseConfig):
        pass


# Role Schemas

class RoleData(BaseModel):
    """Role data without permissions"""
    id: str
    name: str
    description: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[str]
    updated_by_id: Optional[str]

    class Config(BaseConfig):
        fields = {"permissions": {"exclude": True}}


class RoleDetailData(BaseModel):
    """Role data with permissions"""
    id: str
    name: str
    description: str
    is_active: bool
    permissions: List[PermissionData]
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[str]
    updated_by_id: Optional[str]

    class Config(BaseConfig):
        pass


class RoleResponse(BaseModel):
    """Single role response"""
    success: bool
    message: str
    data: RoleDetailData

    class Config(BaseConfig):
        pass


class RoleListResponse(BaseModel):
    """Role list response (without permissions)"""
    success: bool
    message: str
    data: List[RoleData]
    meta: Optional[dict] = None

    class Config(BaseConfig):
        pass


class RoleListWithPermissionsResponse(BaseModel):
    """Role list response (with permissions)"""
    success: bool
    message: str
    data: List[RoleDetailData]
    meta: Optional[dict] = None

    class Config(BaseConfig):
        pass


class RoleStatsResponse(BaseModel):
    """Role statistics response"""
    success: bool
    message: str
    data: dict

    class Config(BaseConfig):
        pass


class MessageResponse(BaseModel):
    """Generic message response"""
    success: bool
    message: str
    data: Optional[dict] = None

    class Config(BaseConfig):
        pass
