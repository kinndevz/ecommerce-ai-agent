from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.brands import BrandService
from app.schemas.brands import *

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("")
def get_all_brands(
    include_inactive: bool = Query(
        False, description="Include inactive brands"),
    db: Session = Depends(get_db)
):
    """
    Get all brands
    Public endpoint
    """
    return BrandService.get_all_brands(db, include_inactive)


@router.get("/stats")
def get_brand_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get brand statistics (Admin only)

    Returns:
    - Total brands
    - Active/Inactive count
    - Top brands by product count
    """
    return BrandService.get_brand_stats(db)


@router.get("/{brand_id}")
def get_brand_detail(
    brand_id: str,
    db: Session = Depends(get_db)
):
    """
    Get brand detail by ID
    Public endpoint
    """
    return BrandService.get_brand_by_id(db, brand_id)


@router.post("")
def create_brand(
    data: BrandCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Create new brand (Admin only)
    """
    return BrandService.create_brand(db, data, current_user.id)


@router.put("/{brand_id}")
def update_brand(
    brand_id: str,
    data: BrandUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Update brand (Admin only)
    """
    return BrandService.update_brand(db, brand_id, data, current_user.id)


@router.delete("/{brand_id}")
def delete_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Delete brand (Admin only)
    Note: Cannot delete brand with products
    """
    return BrandService.delete_brand(db, brand_id, current_user.id)


@router.patch("/{brand_id}/toggle-status")
def toggle_brand_status(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Toggle brand active/inactive status (Admin only)
    """
    return BrandService.toggle_status(db, brand_id, current_user.id)
