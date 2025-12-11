from .requests import (
    get_product_filters,
    ProductCreateRequest,
    ProductUpdateRequest,
    AddTagsRequest,
    UpdateStockRequest,
    ProductImageCreateRequest,
    ProductImageUpdateRequest,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest
)

from .responses import (
    ProductResponse,
    ProductListResponse,
    ProductStatsResponse,
    ProductImageResponse,
    ProductVariantResponse,
    MessageResponse,
    ProductDetail,
    ProductListItem
)

__all__ = [
    # Requests
    "get_product_filters",
    "ProductCreateRequest",
    "ProductUpdateRequest",
    "AddTagsRequest",
    "UpdateStockRequest",
    "ProductImageCreateRequest",
    "ProductImageUpdateRequest",
    "ProductVariantCreateRequest",
    "ProductVariantUpdateRequest",

    # Responses
    "ProductResponse",
    "ProductListResponse",
    "ProductStatsResponse",
    "ProductImageResponse",
    "ProductVariantResponse",
    "MessageResponse",
    "ProductDetail",
    "ProductListItem"
]
