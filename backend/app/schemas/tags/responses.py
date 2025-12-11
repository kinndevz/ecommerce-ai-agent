from pydantic import BaseModel
from typing import List
from datetime import datetime


class BaseConfig:
    from_attributes = True


# ========== Tag Data ==========

class TagData(BaseModel):
    """Tag data - Only fields that exist in DB"""
    id: str
    name: str
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


class TagStats(BaseModel):
    """Tag statistics"""
    total_tags: int
    most_used_tags: List[dict]
    unused_tags_count: int

    class Config(BaseConfig):
        pass


# ========== Response Wrappers ==========

class TagResponse(BaseModel):
    """Single tag response"""
    success: bool
    message: str
    data: TagData

    class Config(BaseConfig):
        pass


class TagListResponse(BaseModel):
    """Tag list response"""
    success: bool
    message: str
    data: dict  # {tags: List[TagData], total}

    class Config(BaseConfig):
        pass


class TagStatsResponse(BaseModel):
    """Statistics response"""
    success: bool
    message: str
    data: TagStats

    class Config(BaseConfig):
        pass


class MessageResponse(BaseModel):
    """Message only"""
    success: bool
    message: str

    class Config(BaseConfig):
        pass
