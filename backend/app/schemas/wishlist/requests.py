from pydantic import BaseModel, Field


class BaseConfig:
    from_attributes = True


class AddWishlistRequest(BaseModel):
    """Add product to wishlist"""
    product_id: str = Field(..., min_length=1)

    class Config(BaseConfig):
        pass
