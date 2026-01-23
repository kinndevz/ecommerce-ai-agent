from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user, require_permission
from app.services.oders import OrderService
from app.schemas.orders import (
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    OrderResponse,
    OrderListResponse,
    OrderStatsResponse, OrderListItemResponse
)
from app.schemas.common import APIResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=APIResponse[OrderResponse], status_code=201)
def create_order(
    data: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create order from cart

    Customer endpoint - Creates order and clears cart
    """
    return OrderService.create_order(
        db,
        current_user.id,
        data.shipping_address.model_dump(),
        data.payment_method,
        data.notes
    )


@router.get("", response_model=APIResponse[List[OrderListItemResponse]])
def get_my_orders(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get my orders

    Customer endpoint - Returns user's orders with pagination
    """
    return OrderService.get_user_orders(db, current_user.id, page, limit)


@router.get("/all", response_model=APIResponse[List[OrderListItemResponse]])
def get_all_orders_admin(
    status: str = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get all orders (Admin)

    Admin endpoint - Returns all orders with optional status filter
    """
    return OrderService.get_all_orders(db, status, page, limit)


@router.get("/stats", response_model=APIResponse[OrderStatsResponse])
def get_order_stats_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get order statistics (Admin)

    Admin endpoint - Returns order counts by status and total revenue
    """
    return OrderService.get_order_stats(db)


@router.get("/{order_id}", response_model=APIResponse[OrderResponse])
def get_order_detail(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get order detail

    Customer endpoint - Returns full order information
    """
    return OrderService.get_order_detail(db, current_user.id, order_id)


@router.get("/admin/{order_id}", response_model=APIResponse[OrderResponse])
def get_order_detail_admin(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Get order detail (Admin)

    Admin endpoint - Returns full order information
    """
    return OrderService.get_order_detail_admin(db, order_id)


@router.patch("/{order_id}/cancel", response_model=APIResponse[OrderResponse])
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel order

    Customer endpoint - Only works for pending/processing orders
    """
    return OrderService.cancel_order(db, current_user.id, order_id)


@router.patch("/{order_id}/status", response_model=APIResponse[OrderResponse])
def update_order_status_admin(
    order_id: str,
    data: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """
    Update order status (Admin)

    Admin endpoint - Update order status
    """
    return OrderService.update_order_status(db, order_id, data.status, current_user.id)
