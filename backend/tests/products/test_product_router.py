import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException


#  helpers

def make_id() -> str:
    return str(uuid.uuid4())


def list_resp(n: int = 1) -> dict:
    return {
        "success": True, "message": "Products list retrieved",
        "data": [],
        "meta": {"total": n, "page": 1, "limit": 20, "total_pages": 1}
    }


def product_resp(pid: str = None) -> dict:
    pid = pid or make_id()
    return {
        "success": True, "message": "Product retrieved successfully",
        "data": {
            "id": pid, "brand_id": make_id(), "category_id": make_id(),
            "name": "Test", "slug": "test", "sku": "SKU-001",
            "short_description": None, "description": None, "how_to_use": None,
            "price": 200000.0, "sale_price": None, "stock_quantity": 50,
            "is_available": True, "is_featured": False,
            "rating_average": 4.5, "review_count": 10, "views_count": 100,
            "skin_types": None, "concerns": None, "benefits": None,
            "ingredients": None,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
            "brand": {"id": make_id(), "name": "Brand", "slug": "brand"},
            "category": {"id": make_id(), "name": "Cat", "slug": "cat"},
            "images": [], "variants": [], "tags": []
        }
    }


def image_resp(image_id: str = None) -> dict:
    return {
        "success": True, "message": "Product image created successfully",
        "data": {
            "id": image_id or make_id(),
            "image_url": "https://x.com/img.jpg",
            "alt_text": None, "is_primary": False, "display_order": 0
        }
    }


def variant_resp(vid: str = None) -> dict:
    return {
        "success": True, "message": "Product variant created successfully",
        "data": {
            "id": vid or make_id(), "name": "50ml", "sku": "VAR-001",
            "price": 150000.0, "sale_price": None, "stock_quantity": 10,
            "is_available": True, "size": "50", "size_unit": "ml",
            "color": None, "shade_name": None
        }
    }


def not_found_exc() -> HTTPException:
    return HTTPException(404, detail={"success": False, "message": "Not found"})


def bad_request_exc(msg: str = "Bad request") -> HTTPException:
    return HTTPException(400, detail={"success": False, "message": msg})


def conflict_exc() -> HTTPException:
    return HTTPException(409, detail={"success": False, "message": "Conflict"})


def create_product_payload(**overrides) -> dict:
    base = {
        "brand_id": make_id(), "category_id": make_id(),
        "name": "Test Product", "slug": "test-product", "sku": "TEST-001",
        "price": 200000.0, "stock_quantity": 10
    }
    return {**base, **overrides}

# GET /products/search  (Public)


class TestSearchEndpoint:

    def test_returns_200(self, public_client):
        with patch("app.routes.products.ProductService.search_products_with_es",
                   return_value=list_resp()):
            res = public_client.get("/products/search?q=kem")
        assert res.status_code == 200

    def test_forwards_keyword(self, public_client):
        with patch("app.routes.products.ProductService.search_products_with_es",
                   return_value=list_resp()) as svc:
            public_client.get("/products/search?q=niacinamide")
            assert svc.call_args[1]["keyword"] == "niacinamide"

# GET /products  (Public)


class TestGetAllProductsEndpoint:

    def test_returns_200_with_list(self, public_client):
        with patch("app.routes.products.ProductService.get_all_products",
                   return_value=list_resp()):
            res = public_client.get("/products")
        assert res.status_code == 200

    def test_forwards_page_and_limit(self, public_client):
        with patch("app.routes.products.ProductService.get_all_products",
                   return_value=list_resp()) as svc:
            public_client.get("/products?page=2&limit=10")
            # page và limit được pop() trước khi truyền
            call_args = svc.call_args
            assert call_args[0][2] == 2   # page
            assert call_args[0][3] == 10  # limit

# GET /products/stats  (Admin)


class TestGetProductStatsEndpoint:

    def test_returns_200_with_stats(self, admin_client):
        mock_stats = {
            "success": True, "message": "Statistics retrieved",
            "data": {
                "total_products": 100, "available_products": 80,
                "out_of_stock": 5, "featured_products": 10,
                "average_price": 200000.0,
                "top_rated_products": [], "top_viewed_products": []
            }
        }
        with patch("app.routes.products.ProductService.get_product_stats",
                   return_value=mock_stats):
            res = admin_client.get("/products/stats")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/products/stats")
        assert res.status_code == 401

# GET /products/low-stock  (Admin)


class TestGetLowStockEndpoint:

    def test_returns_200(self, admin_client):
        with patch("app.routes.products.ProductStockService.get_low_stock",
                   return_value=list_resp()):
            res = admin_client.get("/products/low-stock")
        assert res.status_code == 200

    def test_forwards_threshold(self, admin_client):
        with patch("app.routes.products.ProductStockService.get_low_stock",
                   return_value=list_resp()) as svc:
            admin_client.get("/products/low-stock?threshold=5")
            assert svc.call_args[0][1] == 5

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/products/low-stock")
        assert res.status_code == 401

# GET /products/out-of-stock  (Admin)


class TestGetOutOfStockEndpoint:

    def test_returns_200(self, admin_client):
        with patch("app.routes.products.ProductStockService.get_out_of_stock",
                   return_value=list_resp()):
            res = admin_client.get("/products/out-of-stock")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/products/out-of-stock")
        assert res.status_code == 401

# Discovery endpoints (Public)


class TestDiscoveryEndpoints:

    def test_featured_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_featured",
                   return_value=list_resp()):
            res = public_client.get("/products/featured")
        assert res.status_code == 200

    def test_trending_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_trending",
                   return_value=list_resp()):
            res = public_client.get("/products/trending")
        assert res.status_code == 200

    def test_new_arrivals_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_new_arrivals",
                   return_value=list_resp()):
            res = public_client.get("/products/new-arrivals")
        assert res.status_code == 200

    def test_on_sale_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_on_sale",
                   return_value=list_resp()):
            res = public_client.get("/products/on-sale")
        assert res.status_code == 200

    def test_by_brand_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_by_brand",
                   return_value=list_resp()):
            res = public_client.get("/products/by-brand/the-ordinary")
        assert res.status_code == 200

    def test_by_brand_not_found_returns_404(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_by_brand",
                   side_effect=not_found_exc()):
            res = public_client.get("/products/by-brand/nonexistent")
        assert res.status_code == 404

    def test_by_category_returns_200(self, public_client):
        with patch("app.routes.products.ProductDiscoveryService.get_by_category",
                   return_value=list_resp()):
            res = public_client.get("/products/by-category/serum")
        assert res.status_code == 200

    def test_related_returns_200(self, public_client):
        pid = make_id()
        with patch("app.routes.products.ProductDiscoveryService.get_related",
                   return_value=list_resp()):
            res = public_client.get(f"/products/{pid}/related")
        assert res.status_code == 200

# GET /products/{product_id}  (Public)


class TestGetProductDetailEndpoint:

    def test_returns_200_with_detail(self, public_client):
        pid = make_id()
        with patch("app.routes.products.ProductService.get_product_by_id",
                   return_value=product_resp(pid)):
            res = public_client.get(f"/products/{pid}")
        assert res.status_code == 200

    def test_not_found_returns_404(self, public_client):
        with patch("app.routes.products.ProductService.get_product_by_id",
                   side_effect=not_found_exc()):
            res = public_client.get(f"/products/{make_id()}")
        assert res.status_code == 404

# GET /products/{slug}/slug  (Public)


class TestGetProductBySlugEndpoint:

    def test_returns_200(self, public_client):
        with patch("app.routes.products.ProductService.get_product_by_slug",
                   return_value=product_resp()):
            res = public_client.get("/products/niacinamide-10/slug")
        assert res.status_code == 200

# POST /products  (Admin)


class TestCreateProductEndpoint:

    def test_valid_payload_returns_201(self, admin_client, mock_admin_user):
        with patch("app.routes.products.ProductService.create_product",
                   return_value=product_resp()) as svc:
            res = admin_client.post("/products", json=create_product_payload())
            assert svc.call_args[0][2] == mock_admin_user.id
        assert res.status_code == 201

    def test_missing_name_returns_422(self, admin_client):
        payload = create_product_payload()
        del payload["name"]
        res = admin_client.post("/products", json=payload)
        assert res.status_code == 422

    def test_sale_price_gte_price_returns_422(self, admin_client):
        res = admin_client.post("/products", json=create_product_payload(
            price=100000.0, sale_price=150000.0))
        assert res.status_code == 422

    def test_duplicate_slug_returns_409(self, admin_client):
        with patch("app.routes.products.ProductService.create_product",
                   side_effect=conflict_exc()):
            res = admin_client.post("/products", json=create_product_payload())
        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/products", json=create_product_payload())
        assert res.status_code == 401

# PUT /products/{product_id}  (Admin)


class TestUpdateProductEndpoint:

    def test_valid_update_returns_200(self, admin_client, mock_admin_user):
        pid = make_id()
        with patch("app.routes.products.ProductService.update_product",
                   return_value=product_resp(pid)) as svc:
            res = admin_client.put(
                f"/products/{pid}", json={"name": "Updated"})
            assert svc.call_args[0][3] == mock_admin_user.id
        assert res.status_code == 200

    def test_not_found_returns_404(self, admin_client):
        with patch("app.routes.products.ProductService.update_product",
                   side_effect=not_found_exc()):
            res = admin_client.put(
                f"/products/{make_id()}", json={"name": "X"})
        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put(f"/products/{make_id()}", json={"name": "X"})
        assert res.status_code == 401

# DELETE /products/{product_id}  (Admin)


class TestDeleteProductEndpoint:

    def test_returns_200_on_success(self, admin_client):
        mock_res = {"success": True, "message": "Product deleted successfully"}
        with patch("app.routes.products.ProductService.delete_product",
                   return_value=mock_res):
            res = admin_client.delete(f"/products/{make_id()}")
        assert res.status_code == 200

    def test_not_found_returns_404(self, admin_client):
        with patch("app.routes.products.ProductService.delete_product",
                   side_effect=not_found_exc()):
            res = admin_client.delete(f"/products/{make_id()}")
        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(f"/products/{make_id()}")
        assert res.status_code == 401

# PATCH /products/{id}/toggle-availability  (Admin)


class TestToggleAvailabilityEndpoint:

    def test_returns_200(self, admin_client):
        with patch("app.routes.products.ProductService.toggle_availability",
                   return_value=product_resp()):
            res = admin_client.patch(
                f"/products/{make_id()}/toggle-availability")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(f"/products/{make_id()}/toggle-availability")
        assert res.status_code == 401

# PATCH /products/{id}/toggle-featured  (Admin)


class TestToggleFeaturedEndpoint:

    def test_returns_200(self, admin_client):
        with patch("app.routes.products.ProductService.toggle_featured",
                   return_value=product_resp()):
            res = admin_client.patch(f"/products/{make_id()}/toggle-featured")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(f"/products/{make_id()}/toggle-featured")
        assert res.status_code == 401

# PATCH /products/{id}/stock  (Admin)


class TestUpdateStockEndpoint:

    def test_valid_payload_returns_200(self, admin_client):
        with patch("app.routes.products.ProductService.update_stock",
                   return_value=product_resp()):
            res = admin_client.patch(
                f"/products/{make_id()}/stock", json={"quantity": 50})
        assert res.status_code == 200

    def test_negative_quantity_returns_422(self, admin_client):
        res = admin_client.patch(
            f"/products/{make_id()}/stock", json={"quantity": -1})
        assert res.status_code == 422

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(
            f"/products/{make_id()}/stock", json={"quantity": 10})
        assert res.status_code == 401

# POST /products/{id}/tags  (Admin)


class TestAddTagsEndpoint:

    def test_valid_returns_200(self, admin_client):
        with patch("app.routes.products.ProductService.add_tags",
                   return_value=product_resp()):
            res = admin_client.post(
                f"/products/{make_id()}/tags",
                json={"tag_ids": [make_id()]}
            )
        assert res.status_code == 200

    def test_empty_tag_ids_returns_422(self, admin_client):
        res = admin_client.post(
            f"/products/{make_id()}/tags", json={"tag_ids": []})
        assert res.status_code == 422

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            f"/products/{make_id()}/tags", json={"tag_ids": [make_id()]})
        assert res.status_code == 401

# DELETE /products/{id}/tags/{tag_id}  (Admin)


class TestRemoveTagEndpoint:

    def test_valid_returns_200(self, admin_client):
        with patch("app.routes.products.ProductService.remove_tag",
                   return_value=product_resp()):
            res = admin_client.delete(
                f"/products/{make_id()}/tags/{make_id()}")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(f"/products/{make_id()}/tags/{make_id()}")
        assert res.status_code == 401

# POST /products/{id}/images  (Admin)


class TestAddImageEndpoint:

    def test_valid_returns_201(self, admin_client):
        with patch("app.routes.products.ProductImageService.add_image",
                   return_value=image_resp()):
            res = admin_client.post(
                f"/products/{make_id()}/images",
                json={"image_url": "https://x.com/img.jpg",
                      "is_primary": False, "display_order": 0}
            )
        assert res.status_code == 201

    def test_missing_url_returns_422(self, admin_client):
        res = admin_client.post(
            f"/products/{make_id()}/images", json={"is_primary": False})
        assert res.status_code == 422

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            f"/products/{make_id()}/images",
            json={"image_url": "https://x.com/img.jpg"}
        )
        assert res.status_code == 401

# PATCH /products/{id}/images/{image_id}  (Admin)


class TestUpdateImageEndpoint:

    def test_valid_returns_200(self, admin_client):
        with patch("app.routes.products.ProductImageService.update_image",
                   return_value=image_resp()):
            res = admin_client.patch(
                f"/products/{make_id()}/images/{make_id()}",
                json={"alt_text": "New alt"}
            )
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(
            f"/products/{make_id()}/images/{make_id()}",
            json={"alt_text": "test"}
        )
        assert res.status_code == 401

# DELETE /products/{id}/images/{image_id}  (Admin)


class TestDeleteImageEndpoint:

    def test_valid_returns_200(self, admin_client):
        mock_res = {"success": True, "message": "Product image deleted"}
        with patch("app.routes.products.ProductImageService.delete_image",
                   return_value=mock_res):
            res = admin_client.delete(
                f"/products/{make_id()}/images/{make_id()}")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(
            f"/products/{make_id()}/images/{make_id()}")
        assert res.status_code == 401

# GET /products/{id}/variants  (Public)


class TestGetVariantsEndpoint:

    def test_returns_200(self, public_client):
        mock_res = {
            "success": True, "message": "Product variants retrieved successfully",
            "data": {"variants": [], "total": 0}
        }
        with patch("app.routes.products.ProductVariantService.get_all_variants",
                   return_value=mock_res):
            res = public_client.get(f"/products/{make_id()}/variants")
        assert res.status_code == 200

# POST /products/{id}/variants  (Admin)


class TestAddVariantEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {"name": "50ml", "sku": "VAR-NEW-001",
                "price": 150000.0, "stock_quantity": 10}
        return {**base, **overrides}

    def test_valid_returns_201(self, admin_client, mock_admin_user):
        with patch("app.routes.products.ProductVariantService.add_variant",
                   return_value=variant_resp()) as svc:
            res = admin_client.post(
                f"/products/{make_id()}/variants", json=self._payload())
            assert svc.call_args[0][3] == mock_admin_user.id
        assert res.status_code == 201

    def test_missing_price_returns_422(self, admin_client):
        payload = self._payload()
        del payload["price"]
        res = admin_client.post(
            f"/products/{make_id()}/variants", json=payload)
        assert res.status_code == 422

    def test_duplicate_sku_returns_409(self, admin_client):
        with patch("app.routes.products.ProductVariantService.add_variant",
                   side_effect=conflict_exc()):
            res = admin_client.post(
                f"/products/{make_id()}/variants", json=self._payload())
        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            f"/products/{make_id()}/variants", json=self._payload())
        assert res.status_code == 401


# PUT /products/{id}/variants/{variant_id}  (Admin)
class TestUpdateVariantEndpoint:

    def test_valid_returns_200(self, admin_client, mock_admin_user):
        pid, vid = make_id(), make_id()
        with patch("app.routes.products.ProductVariantService.update_variant",
                   return_value=variant_resp(vid)) as svc:
            res = admin_client.put(
                f"/products/{pid}/variants/{vid}",
                json={"stock_quantity": 20})
            assert svc.call_args[0][4] == mock_admin_user.id
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put(
            f"/products/{make_id()}/variants/{make_id()}",
            json={"stock_quantity": 20})
        assert res.status_code == 401


# DELETE /products/{id}/variants/{variant_id}  (Admin)
class TestDeleteVariantEndpoint:

    def test_valid_returns_200(self, admin_client):
        mock_res = {"success": True, "message": "Product variant deleted"}
        with patch("app.routes.products.ProductVariantService.delete_variant",
                   return_value=mock_res):
            res = admin_client.delete(
                f"/products/{make_id()}/variants/{make_id()}")
        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(
            f"/products/{make_id()}/variants/{make_id()}")
        assert res.status_code == 401
