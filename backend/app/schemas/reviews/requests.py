from pydantic import BaseModel, Field
from typing import Optional
from app.core.constant import ProductConstants


class BaseConfig:
    from_attributes = True


class CreateReviewRequest(BaseModel):
    """Create product review"""
    rating: int = Field(..., ge=ProductConstants.MIN_RATING,
                        le=ProductConstants.MAX_RATING)
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=1)
    skin_type: Optional[str] = Field(None, max_length=50)
    age_range: Optional[str] = Field(None, max_length=20)

    class Config(BaseConfig):
        pass


class UpdateReviewRequest(BaseModel):
    """Update product review"""
    rating: Optional[int] = Field(
        None, ge=ProductConstants.MIN_RATING, le=ProductConstants.MAX_RATING)
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    skin_type: Optional[str] = Field(None, max_length=50)
    age_range: Optional[str] = Field(None, max_length=20)

    class Config(BaseConfig):
        pass
