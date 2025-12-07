from fastapi import APIRouter, Depends, Query, Path
from app.db.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session
from typing import Optional
from app.schemas.users import UserListResponse, UserDetailResponse, UserCreateRequest, UserUpdateRequest, MessageResponse
from app.services.users import UserService
from app.utils.deps import require_permission
router = APIRouter(prefix="/users", tags=["Users"])

# (Admin only)


@router.get("", response_model=UserListResponse)
def get_all_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by email or name"),
    role: Optional[str] = Query(None, description="Filter by role name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
   Get list of users with pagination and filters
   """
    return UserService.get_all_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
        role=role,
        status=status)


@router.get("/stats")
def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get user statistics
    """
    return UserService.get_user_stats(db)


@router.get("/{user_id}", response_model=UserDetailResponse)
def get_user_by_id(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get user details by ID
    """
    return UserService.get_user(db, user_id)


@router.post("", response_model=UserDetailResponse)
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Create new user
    """
    return UserService.create_user(db, data, current_user.id)


@router.put("/{user_id}", response_model=UserDetailResponse)
def update_user(
    data: UserUpdateRequest,
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Update user information"""
    return UserService.update_user(db, user_id, data, current_user.id)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Delete User (soft)"""
    return UserService.delete_user(db, user_id, current_user.id)


@router.put("/{user_id}/toggle-status", response_model=UserDetailResponse)
def toggle_user_status(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Toggle user status (ACTIVE <-> INACTIVE)
    """
    return UserService.toggle_status(db, user_id, current_user.id)
