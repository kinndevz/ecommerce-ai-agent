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


# ========== Response Schemas ==========

class CategoryResponse(BaseModel):
    """Category response"""
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
