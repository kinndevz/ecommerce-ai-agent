from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Base Config
class BaseConfig:
    from_attributes = True


# ========== Request Schemas ==========

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


# ========== Response Data Schemas ==========

class BrandData(BaseModel):
    """Brand data"""
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
    product_count: Optional[int] = 0

    class Config(BaseConfig):
        pass


class BrandListData(BaseModel):
    """Brand list data"""
    brands: List[BrandData]
    total: int

    class Config(BaseConfig):
        pass


class BrandStatsData(BaseModel):
    """Brand statistics data"""
    total_brands: int
    active_brands: int
    inactive_brands: int
    top_brands: List[dict]

    class Config(BaseConfig):
        pass


# ========== Response Schemas ==========

class BrandResponse(BaseModel):
    """Single brand response"""
    success: bool
    message: str
    data: BrandData

    class Config(BaseConfig):
        pass


class BrandListResponse(BaseModel):
    """Brand list response"""
    success: bool
    message: str
    data: BrandListData

    class Config(BaseConfig):
        pass


class BrandStatsResponse(BaseModel):
    """Brand statistics response"""
    success: bool
    message: str
    data: BrandStatsData

    class Config(BaseConfig):
        pass


class BrandMessageResponse(BaseModel):
    """Brand message response (for delete)"""
    success: bool
    message: str

    class Config(BaseConfig):
        pass
