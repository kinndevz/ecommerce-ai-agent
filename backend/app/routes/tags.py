from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.tag import TagService
from app.schemas.tags import (
    TagCreateRequest,
    TagUpdateRequest,
    TagResponse,
    TagListResponse,
    TagStatsResponse,
    MessageResponse
)

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=TagListResponse)
def get_all_tags(db: Session = Depends(get_db)):
    """
    Get all tags
    Public endpoint
    """
    return TagService.get_all_tags(db)


@router.get("/popular", response_model=TagListResponse)
def get_popular_tags(
    limit: int = Query(
        10, ge=1, le=50, description="Number of tags to return"),
    db: Session = Depends(get_db)
):
    """
    Get most used tags
    Public endpoint
    """
    return TagService.get_popular_tags(db, limit)


@router.get("/stats", response_model=TagStatsResponse)
def get_tag_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get tag statistics (Admin only)
    """
    return TagService.get_tag_stats(db)


@router.get("/slug/{slug}", response_model=TagResponse)
def get_tag_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get tag by slug
    Public endpoint
    """
    return TagService.get_tag_by_slug(db, slug)


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag_detail(
    tag_id: str,
    db: Session = Depends(get_db)
):
    """
    Get tag detail by ID
    Public endpoint
    """
    return TagService.get_tag_by_id(db, tag_id)


@router.post("", response_model=TagResponse, status_code=201)
def create_tag(
    data: TagCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Create new tag (Admin only)
    """
    return TagService.create_tag(db, data)


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: str,
    data: TagUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Update tag (Admin only)
    """
    return TagService.update_tag(db, tag_id, data)


@router.delete("/{tag_id}", response_model=MessageResponse)
def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Delete tag (Admin only)

    Note: Can only delete tags not used by any products
    """
    return TagService.delete_tag(db, tag_id)


@router.post("/merge", response_model=dict)
def merge_tags(
    source_tag_id: str = Query(..., description="Tag to merge from"),
    target_tag_id: str = Query(..., description="Tag to merge into"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Merge source tag into target tag (Admin only)

    Moves all products from source tag to target tag, then deletes source tag
    """
    return TagService.merge_tags(db, source_tag_id, target_tag_id)
