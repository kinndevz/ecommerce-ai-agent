from pydantic import BaseModel
from typing import List, Optional


class BaseConfig:
    from_attributes = True


class UserPreferenceOut(BaseModel):
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    favorite_brands: Optional[List[str]] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    preferred_categories: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

    class Config(BaseConfig):
        pass


class UpdateUserPreferenceRequest(BaseModel):
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    favorite_brands: Optional[List[str]] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    preferred_categories: Optional[List[str]] = None
    allergies: Optional[List[str]] = None


class UserPreferenceResponse(BaseModel):
    success: bool
    message: str
    data: Optional[UserPreferenceOut] = None
