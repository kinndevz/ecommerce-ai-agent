from pydantic import BaseModel, Field
from typing import Optional, List


class BaseConfig:
    from_attributes = True


# Role Requests
class RoleCreateRequest(BaseModel):
    """Create role request"""
    name: str = Field(..., min_length=1, max_length=100,
                      description="Role name (e.g., ADMIN, CUSTOMER)")
    description: str = Field(default="", max_length=500,
                             description="Role description")
    is_active: bool = Field(default=True, description="Role active status")
    permission_ids: List[str] = Field(
        default=[], description="List of permission IDs to assign")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "name": "MANAGER",
                "description": "Store manager role",
                "is_active": True,
                "permission_ids": ["perm-id-1", "perm-id-2"]
            }
        }


class RoleUpdateRequest(BaseModel):
    """Update role request"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    permission_ids: Optional[List[str]] = Field(
        None, description="Replace all permissions")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "name": "MANAGER_UPDATED",
                "description": "Updated description",
                "is_active": False
            }
        }


class AssignPermissionsRequest(BaseModel):
    """Assign permissions to role"""
    permission_ids: List[str] = Field(..., min_items=1,
                                      description="Permission IDs to assign")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "permission_ids": ["perm-id-1", "perm-id-2", "perm-id-3"]
            }
        }


class RemovePermissionsRequest(BaseModel):
    """Remove permissions from role"""
    permission_ids: List[str] = Field(..., min_items=1,
                                      description="Permission IDs to remove")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "permission_ids": ["perm-id-1", "perm-id-2"]
            }
        }


# Permission Requests
class PermissionCreateRequest(BaseModel):
    """Create permission request (Manual creation - usually auto-synced)"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=500)
    path: str = Field(..., description="API path (e.g., /api/v1/users)")
    method: str = Field(...,
                        description="HTTP method: GET, POST, PUT, DELETE, PATCH")
    module: str = Field(default="", max_length=100,
                        description="Module name (e.g., Users, Products)")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "name": "Create Product",
                "description": "Permission to create new products",
                "path": "/api/v1/products",
                "method": "POST",
                "module": "Products"
            }
        }


class PermissionUpdateRequest(BaseModel):
    """Update permission request"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    module: Optional[str] = Field(None, max_length=100)

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "name": "Create Product (Updated)",
                "description": "Updated permission description"
            }
        }
