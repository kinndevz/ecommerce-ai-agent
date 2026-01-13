from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BaseConfig:
    from_attributes = True


# ========== Nested Data ==========
class BrandSimple(BaseModel):
    id: str
    name: str
    slug: str

    class Config(BaseConfig):
        pass


class CategorySimple(BaseModel):
    id: str
    name: str
    slug: str

    class Config(BaseConfig):
        pass


class TagSimple(BaseModel):
    id: str
    name: str
    slug: str
    color: Optional[str] = None

    class Config(BaseConfig):
        pass


class ProductImageData(BaseModel):
    id: str
    image_url: str
    alt_text: Optional[str]
    is_primary: bool
    display_order: int

    class Config(BaseConfig):
        pass


class ProductVariantData(BaseModel):
    id: str
    name: str
    sku: str
    price: float
    sale_price: Optional[float]
    stock_quantity: int
    is_available: bool
    size: Optional[str]
    size_unit: Optional[str]
    color: Optional[str]
    shade_name: Optional[str]

    class Config(BaseConfig):
        pass


# ========== Product Data ==========
class ProductListItem(BaseModel):
    """Product list item (simplified)"""
    id: str
    name: str
    slug: str
    sku: str
    short_description: Optional[str]
    price: float
    sale_price: Optional[float]
    stock_quantity: int
    is_available: bool
    is_featured: bool
    rating_average: float
    review_count: int
    views_count: int

    brand: BrandSimple
    category: CategorySimple
    product_image: Optional[str]
    tags: List[TagSimple]

    class Config(BaseConfig):
        pass


class ProductDetail(BaseModel):
    """Product detail (full)"""
    id: str
    brand_id: str
    category_id: str
    name: str
    slug: str
    sku: str
    short_description: Optional[str]
    description: Optional[str]
    how_to_use: Optional[str]

    price: float
    sale_price: Optional[float]
    stock_quantity: int
    is_available: bool
    is_featured: bool

    rating_average: float
    review_count: int
    views_count: int

    skin_types: Optional[List[str]]
    concerns: Optional[List[str]]
    benefits: Optional[List[str]]
    ingredients: Optional[dict]

    created_at: datetime
    updated_at: datetime

    brand: BrandSimple
    category: CategorySimple
    images: List[ProductImageData]
    variants: List[ProductVariantData]
    tags: List[TagSimple]

    class Config(BaseConfig):
        pass


class ProductStats(BaseModel):
    """Product statistics"""
    total_products: int
    available_products: int
    out_of_stock: int
    featured_products: int
    average_price: float
    top_rated_products: List[dict]
    top_viewed_products: List[dict]

    class Config(BaseConfig):
        pass


# ========== Response Wrappers ==========
class ProductResponse(BaseModel):
    """Single product response"""
    success: bool
    message: str
    data: ProductDetail

    class Config(BaseConfig):
        pass


class ProductListResponse(BaseModel):
    """Product list response"""
    success: bool
    message: str
    # {products: List[ProductListItem], total, page, limit, total_pages}
    data: dict

    class Config(BaseConfig):
        pass


class ProductStatsResponse(BaseModel):
    """Statistics response"""
    success: bool
    message: str
    data: ProductStats

    class Config(BaseConfig):
        pass


class ProductImageResponse(BaseModel):
    """Image response"""
    success: bool
    message: str
    data: ProductImageData

    class Config(BaseConfig):
        pass


class ProductVariantResponse(BaseModel):
    """Variant response"""
    success: bool
    message: str
    data: ProductVariantData

    class Config(BaseConfig):
        pass


class MessageResponse(BaseModel):
    """Message only"""
    success: bool
    message: str

    class Config(BaseConfig):
        pass
