from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# Base
class BaseConfig:
    from_attributes = True


class BrandCreateRequest(BaseModel):
    """Create brand (Admin only)"""
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    country: Optional[str] = Field(None, max_length=100)
    website_url: Optional[str] = Field(None, max_length=500)
    logo_url: Optional[str] = Field(None, max_length=500)

    class Config(BaseConfig):
        pass


class BrandUpdateRequest(BaseModel):
    """Update brand"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    country: Optional[str] = Field(None, max_length=100)
    website_url: Optional[str] = Field(None, max_length=500)
    logo_url: Optional[str] = Field(None, max_length=500)

    class Config(BaseConfig):
        pass


# ========== Response Schemas ==========
class BrandResponse(BaseModel):
    """Brand response"""
    id: str
    name: str
    slug: str
    description: Optional[str]
    country: Optional[str]
    website_url: Optional[str]
    logo_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Stats (optional, can be None if not joined)
    product_count: Optional[int] = 0

    class Config(BaseConfig):
        pass


class BrandListResponse(BaseModel):
    """List of brands"""
    success: bool
    message: str
    data: list[BrandResponse]
    total: int

    class Config(BaseConfig):
        pass


class BrandDetailResponse(BaseModel):
    """Single brand detail"""
    success: bool
    message: str
    data: BrandResponse

    class Config(BaseConfig):
        pass
