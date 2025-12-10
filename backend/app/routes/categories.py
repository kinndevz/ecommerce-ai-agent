from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.categories import CategoryService
from app.schemas.categories import *

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
def get_all_categories(
    include_inactive: bool = Query(
        False, description="Include inactive categories"),
    db: Session = Depends(get_db)
):
    """
    Get all categories as flat list (no pagination)
    Public endpoint
    """
    return CategoryService.get_all_categories(db, include_inactive)


@router.get("/tree")
def get_category_tree(
    include_inactive: bool = Query(
        False, description="Include inactive categories"),
    db: Session = Depends(get_db)
):
    """
    Get categories as hierarchical tree
    Public endpoint
    Returns nested structure with parent-child relationships
    """
    return CategoryService.get_category_tree(db, include_inactive)


@router.get("/stats")
def get_category_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get category statistics (Admin only)
    """
    return CategoryService.get_category_stats(db)


@router.get("/{category_id}")
def get_category_detail(
    category_id: str,
    db: Session = Depends(get_db)
):
    """
    Get category detail by ID
    Public endpoint
    """
    return CategoryService.get_category_by_id(db, category_id)


@router.post("")
def create_category(
    data: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Create new category (Admin only)
    Can create:
    - Root category (parent_id = null)
    - Child category (parent_id = existing category)
    """
    return CategoryService.create_category(db, data, current_user.id)


@router.put("/{category_id}")
def update_category(
    category_id: str,
    data: CategoryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Update category (Admin only)
    """
    return CategoryService.update_category(db, category_id, data, current_user.id)


@router.delete("/{category_id}")
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Delete category (Admin only)
    Note: Cannot delete category with products or subcategories
    """
    return CategoryService.delete_category(db, category_id, current_user.id)


@router.patch("/{category_id}/toggle-status")
def toggle_category_status(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Toggle category active/inactive status (Admin only)
    """
    return CategoryService.toggle_status(db, category_id, current_user.id)


@router.patch("/{category_id}/move")
def move_category(
    category_id: str,
    data: CategoryMoveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Move category to different parent (Admin only)
    Set new_parent_id = null to make it root category
    """
    return CategoryService.move_category(db, category_id, data.new_parent_id, current_user.id)
