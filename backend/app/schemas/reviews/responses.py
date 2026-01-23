from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BaseConfig:
    from_attributes = True


class ReviewResponse(BaseModel):
    """Single review response"""
    id: str
    product_id: str
    user_id: str
    rating: int
    title: Optional[str]
    content: str
    verified_purchase: bool
    helpful_count: int
    skin_type: Optional[str]
    age_range: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Reviewer info
    user_name: Optional[str]
    user_avatar: Optional[str]

    class Config(BaseConfig):
        pass


class ProductRatingSummary(BaseModel):
    """Product rating summary"""
    average_rating: float
    review_count: int

    class Config(BaseConfig):
        pass
