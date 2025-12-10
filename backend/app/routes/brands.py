from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.brands import BrandService
from app.schemas.brands import (
    BrandCreateRequest,
    BrandUpdateRequest,
    BrandResponse,
    BrandListResponse,
    BrandStatsResponse,
    BrandMessageResponse
)

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=BrandListResponse)
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


@router.get("/stats", response_model=BrandStatsResponse)
def get_brand_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get brand statistics (Admin only)
    """
    return BrandService.get_brand_stats(db)


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand_detail(
    brand_id: str,
    db: Session = Depends(get_db)
):
    """
    Get brand detail by ID
    Public endpoint
    """
    return BrandService.get_brand_by_id(db, brand_id)


@router.post("", response_model=BrandResponse, status_code=201)
def create_brand(
    data: BrandCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Create new brand (Admin only)
    """
    return BrandService.create_brand(db, data, current_user.id)


@router.put("/{brand_id}", response_model=BrandResponse)
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


@router.delete("/{brand_id}", response_model=BrandMessageResponse)
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


@router.patch("/{brand_id}/toggle-status", response_model=BrandResponse)
def toggle_brand_status(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Toggle brand active/inactive status (Admin only)
    """
    return BrandService.toggle_status(db, brand_id, current_user.id)
