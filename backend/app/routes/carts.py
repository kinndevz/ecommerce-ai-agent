from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.carts import CartService
from app.schemas.carts import AddToCartRequest, UpdateCartItemRequest, CartResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=APIResponse[CartResponse])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's cart"""
    return CartService.get_cart(db, current_user.id)


@router.post("/items", response_model=APIResponse[CartResponse], status_code=201)
def add_to_cart(
    data: AddToCartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    return CartService.add_to_cart(
        db,
        current_user.id,
        data.product_id,
        data.variant_id,
        data.quantity
    )


@router.put("/items/{item_id}", response_model=APIResponse[CartResponse])
def update_cart_item(
    item_id: str,
    data: UpdateCartItemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update cart item quantity"""
    return CartService.update_cart_item(db, current_user.id, item_id, data.quantity)


@router.delete("/items/{item_id}", response_model=APIResponse[CartResponse])
def remove_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    return CartService.remove_cart_item(db, current_user.id, item_id)


@router.delete("", response_model=APIResponse[CartResponse])
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from cart"""
    return CartService.clear_cart(db, current_user.id)
