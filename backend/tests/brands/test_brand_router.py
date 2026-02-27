import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException


# HELPERS
def make_id() -> str:
    return str(uuid.uuid4())


def make_brand_data(brand_id: str = None) -> dict:
    return {
        "id": brand_id or make_id(),
        "name": "CeraVe",
        "slug": "cerave",
        "description": "Dermatologist developed",
        "country": "USA",
        "website_url": "https://cerave.com",
        "logo_url": "https://cerave.com/logo.png",
        "is_active": True,
        "product_count": 5,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }


def brand_response(brand_id: str = None, message: str = "Brand retrieved successfully") -> dict:
    return {"success": True, "message": message, "data": make_brand_data(brand_id)}


def brand_list_response(count: int = 2) -> dict:
    return {
        "success": True,
        "message": "Brands retrieved successfully",
        "data": {
            "brands": [make_brand_data() for _ in range(count)],
            "total": count
        }
    }


def not_found_exc(brand_id: str = "x") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False,
                "message": f"Brand with id '{brand_id}' not found"}
    )


# GET /brands  (PUBLIC)
class TestGetAllBrandsEndpoint:

    def test_public_endpoint_returns_200_without_auth(self, public_client):
        """GET /brands là public → không cần token vẫn trả về 200."""
        with patch("app.routes.brands.BrandService.get_all_brands",
                   return_value=brand_list_response()):
            res = public_client.get("/brands")

        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "brands" in body["data"]
        assert "total" in body["data"]

    def test_forwards_include_inactive_param(self, public_client):
        """include_inactive param phải được forward đúng."""
        with patch("app.routes.brands.BrandService.get_all_brands",
                   return_value=brand_list_response()) as svc:
            public_client.get("/brands?include_inactive=true")
            assert svc.call_args[0][1] is True

    def test_include_inactive_defaults_to_false(self, public_client):
        """Không truyền include_inactive → mặc định False."""
        with patch("app.routes.brands.BrandService.get_all_brands",
                   return_value=brand_list_response()) as svc:
            public_client.get("/brands")
            assert svc.call_args[0][1] is False


# GET /brands/stats  (PROTECTED)
class TestGetBrandStatsEndpoint:

    def test_returns_200_with_stats(self, client):
        mock_stats = {
            "success": True,
            "message": "Brand statistics retrieved",
            "data": {
                "total_brands": 10, "active_brands": 8,
                "inactive_brands": 2,
                "top_brands": [{"name": "CeraVe", "product_count": 20}]
            }
        }

        with patch("app.routes.brands.BrandService.get_brand_stats",
                   return_value=mock_stats):
            res = client.get("/brands/stats")

        assert res.status_code == 200
        assert res.json()["data"]["total_brands"] == 10

    def test_protected_endpoint_without_auth_returns_401(self, public_client):
        """GET /brands/stats không có token → 401."""
        res = public_client.get("/brands/stats")
        assert res.status_code == 401


# GET /brands/{brand_id}  (PUBLIC)
class TestGetBrandDetailEndpoint:

    def test_existing_brand_returns_200(self, public_client):
        """GET /brands/{id} là public → 200."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.get_brand_by_id",
                   return_value=brand_response(bid)) as svc:
            res = public_client.get(f"/brands/{bid}")
            assert svc.call_args[0][1] == bid  # brand_id được forward đúng

        assert res.status_code == 200

    def test_not_found_returns_404(self, public_client):
        """Brand không tồn tại → 404."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.get_brand_by_id",
                   side_effect=not_found_exc(bid)):
            res = public_client.get(f"/brands/{bid}")

        assert res.status_code == 404
        assert res.json()["detail"]["success"] is False


# POST /brands  (PROTECTED)
class TestCreateBrandEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "name": "The Ordinary",
            "slug": "the-ordinary",
            "description": "Science-backed skincare",
            "country": "Canada",
            "website_url": "https://theordinary.com",
            "logo_url": "https://theordinary.com/logo.png",
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, client, mock_current_user):
        """POST /brands với payload hợp lệ → 201 Created."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.create_brand",
                   return_value=brand_response(bid, "Brand created successfully")) as svc:
            res = client.post("/brands", json=self._payload())
            # current_user.id phải được forward
            assert svc.call_args[0][2] == mock_current_user.id

        assert res.status_code == 201

    def test_missing_name_returns_422(self, client):
        """Thiếu name → Pydantic validation → 422."""
        payload = self._payload()
        del payload["name"]
        res = client.post("/brands", json=payload)
        assert res.status_code == 422

    def test_missing_slug_returns_422(self, client):
        """Thiếu slug → 422."""
        payload = self._payload()
        del payload["slug"]
        res = client.post("/brands", json=payload)
        assert res.status_code == 422

    def test_name_too_long_returns_422(self, client):
        """name > 200 ký tự → Field(max_length=200) → 422."""
        res = client.post("/brands", json=self._payload(name="x" * 201))
        assert res.status_code == 422

    def test_duplicate_slug_returns_409(self, client):
        """Slug đã tồn tại → service raise 409."""
        with patch("app.routes.brands.BrandService.create_brand",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "Brand with this slug already exists"}
                   )):
            res = client.post("/brands", json=self._payload())

        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.post("/brands", json=self._payload())
        assert res.status_code == 401


# PUT /brands/{brand_id}  (PROTECTED)
class TestUpdateBrandEndpoint:

    def test_valid_payload_returns_200(self, client, mock_current_user):
        """PUT /brands/{id} hợp lệ → 200."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.update_brand",
                   return_value=brand_response(bid, "Brand updated successfully")) as svc:
            res = client.put(f"/brands/{bid}", json={"name": "CeraVe Pro"})
            args = svc.call_args[0]
            assert args[1] == bid                    # brand_id đúng
            assert args[3] == mock_current_user.id   # updated_by_id đúng

        assert res.status_code == 200

    def test_empty_name_returns_422(self, client):
        """name = '' vi phạm Field(min_length=1) → 422."""
        bid = make_id()
        res = client.put(f"/brands/{bid}", json={"name": ""})
        assert res.status_code == 422

    def test_not_found_returns_404(self, client):
        """Brand không tồn tại → 404."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.update_brand",
                   side_effect=not_found_exc(bid)):
            res = client.put(f"/brands/{bid}", json={"name": "X"})

        assert res.status_code == 404

    def test_duplicate_slug_returns_409(self, client):
        """Slug trùng với brand khác → 409."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.update_brand",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "Brand with this slug already exists"}
                   )):
            res = client.put(f"/brands/{bid}", json={"slug": "existing-slug"})

        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        bid = make_id()
        res = public_client.put(f"/brands/{bid}", json={"name": "X"})
        assert res.status_code == 401


# DELETE /brands/{brand_id}  (PROTECTED)
class TestDeleteBrandEndpoint:

    def test_delete_returns_200(self, client, mock_current_user):
        """DELETE /brands/{id} → 200."""
        bid = make_id()
        mock_res = {"success": True, "message": "Brand deleted successfully"}

        with patch("app.routes.brands.BrandService.delete_brand",
                   return_value=mock_res) as svc:
            res = client.delete(f"/brands/{bid}")
            args = svc.call_args[0]
            assert args[1] == bid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        """Brand không tồn tại → 404."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.delete_brand",
                   side_effect=not_found_exc(bid)):
            res = client.delete(f"/brands/{bid}")

        assert res.status_code == 404

    def test_brand_with_products_returns_400(self, client):
        """Brand có products → service raise 400."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.delete_brand",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={
                           "success": False, "message": "Cannot delete brand. It has 5 products."}
                   )):
            res = client.delete(f"/brands/{bid}")

        assert res.status_code == 400
        assert "products" in res.json()["detail"]["message"]

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.delete(f"/brands/{make_id()}")
        assert res.status_code == 401


# PATCH /brands/{brand_id}/toggle-status  (PROTECTED)
class TestToggleBrandStatusEndpoint:

    def test_returns_200_with_updated_brand(self, client, mock_current_user):
        """PATCH /brands/{id}/toggle-status → 200."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.toggle_status",
                   return_value=brand_response(bid, "Brand status changed to inactive")) as svc:
            res = client.patch(f"/brands/{bid}/toggle-status")
            args = svc.call_args[0]
            assert args[1] == bid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        """Brand không tồn tại → 404."""
        bid = make_id()
        with patch("app.routes.brands.BrandService.toggle_status",
                   side_effect=not_found_exc(bid)):
            res = client.patch(f"/brands/{bid}/toggle-status")

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.patch(f"/brands/{make_id()}/toggle-status")
        assert res.status_code == 401
