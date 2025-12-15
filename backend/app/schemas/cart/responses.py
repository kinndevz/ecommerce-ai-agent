from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class BaseConfig:
    from_attributes = True


class CartItemResponse(BaseModel):
    """Cart item response"""
    id: str
    product_id: str
    variant_id: Optional[str]
    quantity: int
    price: Decimal

    # Product details
    product_name: str
    product_slug: str
    product_image: Optional[str]
    variant_name: Optional[str]

    # Computed
    subtotal: Decimal

    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


class CartResponse(BaseModel):
    """Cart response with items"""
    id: str
    user_id: str
    items: List[CartItemResponse]

    # Summary
    total_items: int
    subtotal: Decimal

    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass
