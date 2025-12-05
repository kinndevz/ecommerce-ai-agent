from pydantic import BaseModel
from typing import List
from enum import Enum


# ========== Enums ==========
class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class HTTPMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


# ========== Permission Schema ==========
class PermissionOut(BaseModel):
    """Permission output schema"""
    id: str
    name: str
    description: str
    path: str
    method: HTTPMethod
    module: str

    class Config:
        from_attributes = True


# ========== Role Schema ==========

class RoleOut(BaseModel):
    """Role output with permissions"""
    id: str
    name: str
    description: str
    is_active: bool
    permissions: List[PermissionOut] = []

    class Config:
        from_attributes = True
