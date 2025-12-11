from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import require_permission
from app.services.products import (
    ProductService,
    ProductDiscoveryService,
    ProductStockService,
    ProductImageService,
    ProductVariantService
)
from app.schemas.products import (
    get_product_filters,
    ProductCreateRequest,
    ProductUpdateRequest,
    AddTagsRequest,
    UpdateStockRequest,
    ProductImageCreateRequest,
    ProductImageUpdateRequest,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest,
    ProductResponse,
    ProductListResponse,
    ProductStatsResponse,
    ProductImageResponse,
    ProductVariantResponse,
    MessageResponse
)

router = APIRouter(prefix="/products", tags=["Products"])


# ========== Main Product CRUD ==========
@router.get("", response_model=ProductListResponse)
def get_all_products(
    filters: dict = Depends(get_product_filters),
    db: Session = Depends(get_db)
):
    """
    Get all products with filters and pagination
    Public endpoint
    """
    page = filters.pop('page')
    limit = filters.pop('limit')

    return ProductService.get_all_products(db, filters, page, limit)


@router.get("/stats", response_model=ProductStatsResponse)
def get_product_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Get product statistics (Admin only)"""
    return ProductService.get_product_stats(db)


# ========== Product Discovery ==========
@router.get("/featured", response_model=ProductListResponse)
def get_featured_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products - Public endpoint"""
    return ProductDiscoveryService.get_featured(db, limit)


@router.get("/trending", response_model=ProductListResponse)
def get_trending_products(
    days: int = Query(7, ge=1, le=90),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get trending products - Public endpoint"""
    return ProductDiscoveryService.get_trending(db, days, limit)


@router.get("/new-arrivals", response_model=ProductListResponse)
def get_new_arrivals(
    days: int = Query(30, ge=1, le=90),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get new arrival products - Public endpoint"""
    return ProductDiscoveryService.get_new_arrivals(db, days, limit)


@router.get("/on-sale", response_model=ProductListResponse)
def get_products_on_sale(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get products on sale - Public endpoint"""
    return ProductDiscoveryService.get_on_sale(db, limit)


@router.get("/by-brand/{brand_slug}", response_model=ProductListResponse)
def get_products_by_brand(
    brand_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get products by brand slug - Public endpoint"""
    return ProductDiscoveryService.get_by_brand(db, brand_slug, page, limit)


@router.get("/by-category/{category_slug}", response_model=ProductListResponse)
def get_products_by_category(
    category_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get products by category slug - Public endpoint"""
    return ProductDiscoveryService.get_by_category(db, category_slug, page, limit)


@router.get("/{product_id}/related", response_model=ProductListResponse)
def get_related_products(
    product_id: str,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get related/similar products - Public endpoint"""
    return ProductDiscoveryService.get_related(db, product_id, limit)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get product detail by ID - Public endpoint"""
    return ProductService.get_product_by_id(db, product_id)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Create new product (Admin only)"""
    return ProductService.create_product(db, data, current_user.id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Update product (Admin only)"""
    return ProductService.update_product(db, product_id, data, current_user.id)


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Delete product (Admin only)"""
    return ProductService.delete_product(db, product_id, current_user.id)


@router.patch("/{product_id}/toggle-availability", response_model=ProductResponse)
def toggle_product_availability(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Toggle product availability (Admin only)"""
    return ProductService.toggle_availability(db, product_id, current_user.id)


@router.patch("/{product_id}/toggle-featured", response_model=ProductResponse)
def toggle_product_featured(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Toggle product featured status (Admin only)"""
    return ProductService.toggle_featured(db, product_id, current_user.id)


# ========== Product Stock Management ==========
@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_product_stock(
    product_id: str,
    data: UpdateStockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Update product stock quantity (Admin only)"""
    return ProductService.update_stock(db, product_id, data, current_user.id)


@router.get("/low-stock", response_model=ProductListResponse)
def get_low_stock_products(
    threshold: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Get products with low stock (Admin only)"""
    return ProductStockService.get_low_stock(db, threshold)


@router.get("/out-of-stock", response_model=ProductListResponse)
def get_out_of_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Get out of stock products (Admin only)"""
    return ProductStockService.get_out_of_stock(db)


# ========== Product Tags Management ==========
@router.post("/{product_id}/tags", response_model=ProductResponse)
def add_tags_to_product(
    product_id: str,
    data: AddTagsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Add tags to product (Admin only)"""
    return ProductService.add_tags(db, product_id, data)


@router.delete("/{product_id}/tags/{tag_id}", response_model=ProductResponse)
def remove_tag_from_product(
    product_id: str,
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Remove tag from product (Admin only)"""
    return ProductService.remove_tag(db, product_id, tag_id)


# ========== Product Images ==========
@router.post("/{product_id}/images", response_model=ProductImageResponse, status_code=201)
def add_product_image(
    product_id: str,
    data: ProductImageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Add image to product (Admin only)"""
    return ProductImageService.add_image(db, product_id, data)


@router.patch("/{product_id}/images/{image_id}", response_model=ProductImageResponse)
def update_product_image(
    product_id: str,
    image_id: str,
    data: ProductImageUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Update product image (Admin only)"""
    return ProductImageService.update_image(db, product_id, image_id, data)


@router.delete("/{product_id}/images/{image_id}", response_model=MessageResponse)
def delete_product_image(
    product_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Delete product image (Admin only)"""
    return ProductImageService.delete_image(db, product_id, image_id)


# ========== Product Variants ==========
@router.get("/{product_id}/variants", response_model=dict)
def get_product_variants(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get all variants of a product - Public endpoint"""
    return ProductVariantService.get_all_variants(db, product_id)


@router.post("/{product_id}/variants", response_model=ProductVariantResponse, status_code=201)
def add_product_variant(
    product_id: str,
    data: ProductVariantCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Add variant to product (Admin only)"""
    return ProductVariantService.add_variant(db, product_id, data, current_user.id)


@router.put("/{product_id}/variants/{variant_id}", response_model=ProductVariantResponse)
def update_product_variant(
    product_id: str,
    variant_id: str,
    data: ProductVariantUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Update product variant (Admin only)"""
    return ProductVariantService.update_variant(db, product_id, variant_id, data, current_user.id)


@router.delete("/{product_id}/variants/{variant_id}", response_model=MessageResponse)
def delete_product_variant(
    product_id: str,
    variant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    """Delete product variant (Admin only)"""
    return ProductVariantService.delete_variant(db, product_id, variant_id, current_user.id)
