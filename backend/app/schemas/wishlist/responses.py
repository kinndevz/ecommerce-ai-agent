from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BaseConfig:
    from_attributes = True


class WishlistItemResponse(BaseModel):
    """Wishlist item response"""
    id: str
    user_id: str
    product_id: str

    # Product details
    product_name: str
    product_slug: str
    product_image: Optional[str]
    price: float
    sale_price: Optional[float]

    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass
