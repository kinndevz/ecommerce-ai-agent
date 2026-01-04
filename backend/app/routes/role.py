from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import Optional, Union
from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.role import RoleService, PermissionService
from app.schemas.roles import (
    RoleCreateRequest,
    RoleUpdateRequest,
    AssignPermissionsRequest,
    RemovePermissionsRequest,
    PermissionCreateRequest,
    PermissionUpdateRequest,
    RoleResponse,
    RoleListResponse,
    RoleListWithPermissionsResponse,
    RoleStatsResponse,
    PermissionResponse,
    PermissionListResponse,
    MessageResponse
)

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])


# ROLE ENDPOINTS
@router.get("", response_model=Union[RoleListResponse, RoleListWithPermissionsResponse])
def get_all_roles(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by role name"),
    is_active: Optional[bool] = Query(
        None, description="Filter by active status"),
    include_permissions: bool = Query(
        False, description="Include permissions in response"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.get_all_roles(
        db=db,
        page=page,
        limit=limit,
        search=search,
        is_active=is_active,
        include_permissions=include_permissions
    )


@router.get("/stats", response_model=RoleStatsResponse)
def get_role_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.get_role_stats(db)


@router.get("/{role_id}", response_model=RoleResponse)
def get_role_by_id(
    role_id: str = Path(..., description="Role ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.get_role_by_id(db, role_id)


@router.post("", response_model=RoleResponse, status_code=201)
def create_role(
    data: RoleCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.create_role(db, data, current_user.id)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: str = Path(..., description="Role ID"),
    data: RoleUpdateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.update_role(db, role_id, data, current_user.id)


@router.delete("/{role_id}", response_model=MessageResponse)
def delete_role(
    role_id: str = Path(..., description="Role ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.delete_role(db, role_id, current_user.id)


@router.post("/{role_id}/permissions/assign", response_model=RoleResponse)
def assign_permissions_to_role(
    role_id: str = Path(..., description="Role ID"),
    data: AssignPermissionsRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.assign_permissions(db, role_id, data, current_user.id)


@router.post("/{role_id}/permissions/remove", response_model=RoleResponse)
def remove_permissions_from_role(
    role_id: str = Path(..., description="Role ID"),
    data: RemovePermissionsRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return RoleService.remove_permissions(db, role_id, data, current_user.id)


# PERMISSION ENDPOINTS
@router.get("/permissions/all", response_model=PermissionListResponse)
def get_all_permissions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=200, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or path"),
    module: Optional[str] = Query(None, description="Filter by module"),
    method: Optional[str] = Query(
        None, description="Filter by HTTP method (GET, POST, PUT, DELETE, PATCH)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.get_all_permissions(
        db=db,
        page=page,
        limit=limit,
        search=search,
        module=module,
        method=method
    )


@router.get("/permissions/grouped")
def get_permissions_by_module(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.get_permissions_by_module(db)


@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
def get_permission_by_id(
    permission_id: str = Path(..., description="Permission ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.get_permission_by_id(db, permission_id)


@router.post("/permissions", response_model=PermissionResponse, status_code=201)
def create_permission(
    data: PermissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.create_permission(db, data, current_user.id)


@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
def update_permission(
    permission_id: str = Path(..., description="Permission ID"),
    data: PermissionUpdateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.update_permission(db, permission_id, data, current_user.id)


@router.delete("/permissions/{permission_id}", response_model=MessageResponse)
def delete_permission(
    permission_id: str = Path(..., description="Permission ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return PermissionService.delete_permission(db, permission_id, current_user.id)
