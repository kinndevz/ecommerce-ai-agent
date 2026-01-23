from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.wishlist import WishlistService
from app.schemas.common import APIResponse, MessageResponse
from app.schemas.wishlist import AddWishlistRequest, WishlistItemResponse

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=APIResponse[List[WishlistItemResponse]])
def list_wishlist(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return WishlistService.list_items(db, current_user.id, page, limit)


@router.post("", response_model=APIResponse[WishlistItemResponse], status_code=201)
def add_wishlist_item(
    data: AddWishlistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return WishlistService.add_item(db, current_user.id, data.product_id)


@router.delete("/{product_id}", response_model=MessageResponse)
def remove_wishlist_item(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return WishlistService.remove_item(db, current_user.id, product_id)
