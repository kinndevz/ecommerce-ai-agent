from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from decimal import Decimal
from fastapi import Query
from app.core.enums import SkinType, SkinConcern, ProductBenefit


class BaseConfig:
    from_attributes = True


# ========== Product Filters ==========
def get_product_filters(
    search: Optional[str] = Query(None, description="Search by name"),
    brand_id: Optional[str] = Query(None, description="Filter by brand"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[Decimal] = Query(
        None, ge=0, description="Minimum price"),
    max_price: Optional[Decimal] = Query(
        None, ge=0, description="Maximum price"),
    skin_types: Optional[List[str]] = Query(
        None, description="Filter by skin types"),
    concerns: Optional[List[str]] = Query(
        None, description="Filter by concerns"),
    benefits: Optional[List[str]] = Query(
        None, description="Filter by benefits"),
    tags: Optional[List[str]] = Query(None, description="Filter by tag slugs"),
    is_featured: Optional[bool] = Query(
        None, description="Featured products only"),
    is_available: Optional[bool] = Query(
        None, description="Available products only"),
    sort_by: str = Query(
        "created_at", description="Sort by: created_at, price, rating, popularity, name"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
) -> dict:
    """Dependency to extract product filters from query params"""

    # Validate sort_by
    allowed_sort = ['created_at', 'price', 'rating', 'popularity', 'name']
    if sort_by not in allowed_sort:
        sort_by = 'created_at'

    # Validate sort_order
    if sort_order not in ['asc', 'desc']:
        sort_order = 'desc'

    return {
        "search": search,
        "brand_id": brand_id,
        "category_id": category_id,
        "min_price": min_price,
        "max_price": max_price,
        "skin_types": skin_types,
        "concerns": concerns,
        "benefits": benefits,
        "tags": tags,
        "is_featured": is_featured,
        "is_available": is_available,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "page": page,
        "limit": limit
    }


# ========== Product CRUD ==========
class ProductImageInput(BaseModel):
    """Image data for product creation"""
    image_url: str = Field(..., max_length=500)
    alt_text: Optional[str] = Field(None, max_length=200)
    is_primary: bool = False
    display_order: int = Field(0, ge=0)

    class Config(BaseConfig):
        pass


class ProductVariantInput(BaseModel):
    """Variant data for product creation"""
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)

    size: Optional[str] = Field(None, max_length=50)
    size_unit: Optional[str] = Field(None, max_length=20)
    color: Optional[str] = Field(None, max_length=50)
    shade_name: Optional[str] = Field(None, max_length=100)

    class Config(BaseConfig):
        pass


class ProductCreateRequest(BaseModel):
    """Create product"""
    brand_id: str
    category_id: str
    name: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    sku: str = Field(..., min_length=1, max_length=100)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    how_to_use: Optional[str] = None

    price: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)

    is_featured: bool = False

    skin_types: Optional[List[SkinType]] = None
    concerns: Optional[List[SkinConcern]] = None
    benefits: Optional[List[ProductBenefit]] = None
    ingredients: Optional[dict] = None

    tag_ids: Optional[List[str]] = None

    images: Optional[List[ProductImageInput]] = Field(None, max_items=10)
    variants: Optional[List[ProductVariantInput]] = Field(None, max_items=50)

    @model_validator(mode='after')
    def validate_sale_price(self):
        """Validate that sale_price is less than price"""
        if self.sale_price is not None and self.sale_price >= self.price:
            raise ValueError('sale_price must be less than price')
        return self

    @model_validator(mode='after')
    def validate_primary_image(self):
        """Ensure only one primary image"""
        if self.images:
            primary_count = sum(1 for img in self.images if img.is_primary)
            if primary_count > 1:
                raise ValueError('Only one image can be primary')
        return self

    @model_validator(mode='after')
    def validate_variant_skus(self):
        """Ensure unique SKUs in variants"""
        if self.variants:
            skus = [v.sku for v in self.variants]
            if len(skus) != len(set(skus)):
                raise ValueError('Variant SKUs must be unique')
        return self

    class Config(BaseConfig):
        pass


class ProductUpdateRequest(BaseModel):
    """Update product"""
    brand_id: Optional[str] = None
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    slug: Optional[str] = Field(None, min_length=1, max_length=500)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    how_to_use: Optional[str] = None

    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)

    is_featured: Optional[bool] = None

    skin_types: Optional[List[SkinType]] = None
    concerns: Optional[List[SkinConcern]] = None
    benefits: Optional[List[ProductBenefit]] = None
    ingredients: Optional[dict] = None

    tag_ids: Optional[List[str]] = None

    class Config(BaseConfig):
        pass


# ========== Product Tags ==========

class AddTagsRequest(BaseModel):
    """Add tags to product"""
    tag_ids: List[str] = Field(..., min_items=1)

    class Config(BaseConfig):
        pass


# ========== Product Stock ==========
class UpdateStockRequest(BaseModel):
    """Update stock quantity"""
    quantity: int = Field(..., ge=0)

    class Config(BaseConfig):
        pass


# ========== Product Images ==========
class ProductImageCreateRequest(BaseModel):
    """Add product image"""
    image_url: str = Field(..., max_length=500)
    alt_text: Optional[str] = Field(None, max_length=200)
    is_primary: bool = False
    display_order: int = Field(0, ge=0)

    class Config(BaseConfig):
        pass


class ProductImageUpdateRequest(BaseModel):
    """Update product image"""
    alt_text: Optional[str] = Field(None, max_length=200)
    is_primary: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)

    class Config(BaseConfig):
        pass


# ========== Product Variants ==========
class ProductVariantCreateRequest(BaseModel):
    """Create variant"""
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)

    size: Optional[str] = Field(None, max_length=50)
    size_unit: Optional[str] = Field(None, max_length=20)
    color: Optional[str] = Field(None, max_length=50)
    shade_name: Optional[str] = Field(None, max_length=100)

    class Config(BaseConfig):
        pass


class ProductVariantUpdateRequest(BaseModel):
    """Update variant"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None

    size: Optional[str] = None
    size_unit: Optional[str] = None
    color: Optional[str] = None
    shade_name: Optional[str] = None

    class Config(BaseConfig):
        pass
