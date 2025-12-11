from pydantic import BaseModel, Field
from typing import Optional


class BaseConfig:
    from_attributes = True


class TagCreateRequest(BaseModel):
    """Create tag - Only required fields"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)

    class Config(BaseConfig):
        pass


class TagUpdateRequest(BaseModel):
    """Update tag"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)

    class Config(BaseConfig):
        pass
