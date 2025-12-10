from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Base Config
class BaseConfig:
    from_attributes = True


# ========== Request Schemas ==========

class CategoryCreateRequest(BaseModel):
    """Create category"""
    parent_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: int = Field(0, ge=0)

    class Config(BaseConfig):
        pass


class CategoryUpdateRequest(BaseModel):
    """Update category"""
    parent_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = Field(None, ge=0)

    class Config(BaseConfig):
        pass


class CategoryMoveRequest(BaseModel):
    """Move category to different parent"""
    new_parent_id: Optional[str] = None

    class Config(BaseConfig):
        pass


# ========== Response Data Schemas ==========

class CategoryData(BaseModel):
    """Category data"""
    id: str
    parent_id: Optional[str]
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    product_count: Optional[int] = 0
    children_count: Optional[int] = 0

    class Config(BaseConfig):
        pass


class CategoryTreeNode(BaseModel):
    """Category tree node (hierarchical)"""
    id: str
    parent_id: Optional[str]
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    display_order: int
    is_active: bool
    product_count: int
    children: List['CategoryTreeNode'] = []

    class Config(BaseConfig):
        pass


class CategoryListData(BaseModel):
    """Category list data"""
    categories: List[CategoryData]
    total: int

    class Config(BaseConfig):
        pass


class CategoryStatsData(BaseModel):
    """Category statistics data"""
    total_categories: int
    active_categories: int
    parent_categories: int
    child_categories: int
    top_categories: List[dict]

    class Config(BaseConfig):
        pass


# ========== Response Schemas ==========

class CategoryResponse(BaseModel):
    """Single category response"""
    success: bool
    message: str
    data: CategoryData

    class Config(BaseConfig):
        pass


class CategoryListResponse(BaseModel):
    """Category list response"""
    success: bool
    message: str
    data: CategoryListData

    class Config(BaseConfig):
        pass


class CategoryTreeResponse(BaseModel):
    """Category tree response"""
    success: bool
    message: str
    data: List[CategoryTreeNode]

    class Config(BaseConfig):
        pass


class CategoryStatsResponse(BaseModel):
    """Category statistics response"""
    success: bool
    message: str
    data: CategoryStatsData

    class Config(BaseConfig):
        pass


class CategoryMessageResponse(BaseModel):
    """Category message response (for delete)"""
    success: bool
    message: str

    class Config(BaseConfig):
        pass
