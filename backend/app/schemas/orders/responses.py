from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class BaseConfig:
    from_attributes = True


class OrderItemResponse(BaseModel):
    """Order item response"""
    id: str
    product_id: str
    variant_id: Optional[str]
    product_name: str
    variant_name: Optional[str]
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config(BaseConfig):
        pass


class OrderResponse(BaseModel):
    """Order detail response"""
    id: str
    order_number: str
    user_id: str

    # Status
    status: str
    payment_status: str
    payment_method: Optional[str]

    # Pricing
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    total: Decimal

    # Shipping
    shipping_address: dict
    notes: Optional[str]

    # Items
    items: List[OrderItemResponse]

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


class OrderListItemResponse(BaseModel):
    """Order list item (summary)"""
    id: str
    order_number: str
    status: str
    payment_status: str
    total: Decimal
    total_items: int
    created_at: datetime

    class Config(BaseConfig):
        pass


class OrderListResponse(BaseModel):
    """Order list response with pagination"""
    orders: List[OrderListItemResponse]

    class Config(BaseConfig):
        pass


class OrderStatsResponse(BaseModel):
    """Order statistics (Admin)"""
    total_orders: int
    pending_orders: int
    processing_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: Decimal

    class Config(BaseConfig):
        pass
