from pydantic import BaseModel, Field
from typing import Optional


class BaseConfig:
    from_attributes = True


class AddToCartRequest(BaseModel):
    """Add item to cart"""
    product_id: str = Field(..., description="Product ID")
    variant_id: Optional[str] = Field(
        None, description="Variant ID (if applicable)")
    quantity: int = Field(1, ge=1, le=100, description="Quantity to add")

    class Config(BaseConfig):
        pass


class UpdateCartItemRequest(BaseModel):
    """Update cart item quantity"""
    quantity: int = Field(..., ge=1, le=100, description="New quantity")

    class Config(BaseConfig):
        pass
