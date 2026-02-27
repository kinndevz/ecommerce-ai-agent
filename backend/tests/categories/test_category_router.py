import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException


# HELPERS
def make_id() -> str:
    return str(uuid.uuid4())


def make_category_data(category_id: str = None) -> dict:
    return {
        "id": category_id or make_id(),
        "parent_id": None,
        "name": "Skincare",
        "slug": "skincare",
        "description": "Skincare products",
        "image_url": None,
        "display_order": 0,
        "is_active": True,
        "product_count": 5,
        "children_count": 2,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }


def category_response(
    category_id: str = None,
    message: str = "Category retrieved successfully"
) -> dict:
    return {
        "success": True,
        "message": message,
        "data": make_category_data(category_id)
    }


def category_list_response(count: int = 2) -> dict:
    return {
        "success": True,
        "message": "Categories retrieved successfully",
        "data": {
            "categories": [make_category_data() for _ in range(count)],
            "total": count
        }
    }


def category_tree_response() -> dict:
    return {
        "success": True,
        "message": "Category tree retrieved successfully",
        "data": [
            {
                **make_category_data(),
                "children": []
            }
        ]
    }


def not_found_exc(cid: str = "x") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False,
                "message": f"Category with id '{cid}' not found"}
    )


# GET /categories  (PUBLIC)

class TestGetAllCategoriesEndpoint:

    def test_public_endpoint_returns_200_without_auth(self, public_client):
        """GET /categories là public → không cần token."""
        with patch("app.routes.categories.CategoryService.get_all_categories",
                   return_value=category_list_response()):
            res = public_client.get("/categories")

        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "categories" in body["data"]
        assert "total" in body["data"]

    def test_forwards_include_inactive_param(self, public_client):
        """include_inactive=true phải được forward đúng."""
        with patch("app.routes.categories.CategoryService.get_all_categories",
                   return_value=category_list_response()) as svc:
            public_client.get("/categories?include_inactive=true")
            assert svc.call_args[0][1] is True

    def test_include_inactive_defaults_to_false(self, public_client):
        """Không truyền include_inactive → mặc định False."""
        with patch("app.routes.categories.CategoryService.get_all_categories",
                   return_value=category_list_response()) as svc:
            public_client.get("/categories")
            assert svc.call_args[0][1] is False


# GET /categories/tree  (PUBLIC)

class TestGetCategoryTreeEndpoint:

    def test_public_endpoint_returns_200_without_auth(self, public_client):
        """GET /categories/tree là public → không cần token."""
        with patch("app.routes.categories.CategoryService.get_category_tree",
                   return_value=category_tree_response()):
            res = public_client.get("/categories/tree")

        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_forwards_include_inactive_param(self, public_client):
        """include_inactive=true phải được forward đúng."""
        with patch("app.routes.categories.CategoryService.get_category_tree",
                   return_value=category_tree_response()) as svc:
            public_client.get("/categories/tree?include_inactive=true")
            assert svc.call_args[0][1] is True

    def test_include_inactive_defaults_to_false(self, public_client):
        """Không truyền include_inactive → mặc định False."""
        with patch("app.routes.categories.CategoryService.get_category_tree",
                   return_value=category_tree_response()) as svc:
            public_client.get("/categories/tree")
            assert svc.call_args[0][1] is False


# GET /categories/stats  (PROTECTED)

class TestGetCategoryStatsEndpoint:

    def test_returns_200_with_stats(self, client):
        mock_stats = {
            "success": True,
            "message": "Category statistics retrieved",
            "data": {
                "total_categories": 20,
                "active_categories": 15,
                "parent_categories": 5,
                "child_categories": 15,
                "top_categories": [{"name": "Skincare", "product_count": 30}]
            }
        }

        with patch("app.routes.categories.CategoryService.get_category_stats",
                   return_value=mock_stats):
            res = client.get("/categories/stats")

        assert res.status_code == 200
        assert res.json()["data"]["total_categories"] == 20

    def test_without_auth_returns_401(self, public_client):
        """GET /categories/stats không có token → 401."""
        res = public_client.get("/categories/stats")
        assert res.status_code == 401


# GET /categories/{category_id}  (PUBLIC)

class TestGetCategoryDetailEndpoint:

    def test_existing_category_returns_200(self, public_client):
        """GET /categories/{id} là public → 200."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.get_category_by_id",
                   return_value=category_response(cid)) as svc:
            res = public_client.get(f"/categories/{cid}")
            assert svc.call_args[0][1] == cid

        assert res.status_code == 200

    def test_not_found_returns_404(self, public_client):
        """Category không tồn tại → 404."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.get_category_by_id",
                   side_effect=not_found_exc(cid)):
            res = public_client.get(f"/categories/{cid}")

        assert res.status_code == 404
        assert res.json()["detail"]["success"] is False


# POST /categories  (PROTECTED)

class TestCreateCategoryEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "name": "Cleanser",
            "slug": "cleanser",
            "description": "Face cleansers",
            "parent_id": None,
            "image_url": None,
            "display_order": 0,
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, client, mock_current_user):
        """POST /categories hợp lệ → 201."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.create_category",
                   return_value=category_response(cid, "Category created successfully")) as svc:
            res = client.post("/categories", json=self._payload())
            assert svc.call_args[0][2] == mock_current_user.id

        assert res.status_code == 201

    def test_missing_name_returns_422(self, client):
        """Thiếu name → 422."""
        payload = self._payload()
        del payload["name"]
        res = client.post("/categories", json=payload)
        assert res.status_code == 422

    def test_missing_slug_returns_422(self, client):
        """Thiếu slug → 422."""
        payload = self._payload()
        del payload["slug"]
        res = client.post("/categories", json=payload)
        assert res.status_code == 422

    def test_name_too_long_returns_422(self, client):
        """name > 200 ký tự → 422."""
        res = client.post("/categories", json=self._payload(name="x" * 201))
        assert res.status_code == 422

    def test_display_order_negative_returns_422(self, client):
        """display_order < 0 → vi phạm Field(ge=0) → 422."""
        res = client.post("/categories", json=self._payload(display_order=-1))
        assert res.status_code == 422

    def test_duplicate_slug_returns_409(self, client):
        """Service raise 409 → 409."""
        with patch("app.routes.categories.CategoryService.create_category",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "Category with this slug already exists"}
                   )):
            res = client.post("/categories", json=self._payload())

        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.post("/categories", json=self._payload())
        assert res.status_code == 401


# PUT /categories/{category_id}  (PROTECTED)

class TestUpdateCategoryEndpoint:

    def test_valid_payload_returns_200(self, client, mock_current_user):
        """PUT /categories/{id} hợp lệ → 200."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.update_category",
                   return_value=category_response(cid, "Category updated successfully")) as svc:
            res = client.put(
                f"/categories/{cid}", json={"name": "Updated Skincare"})
            args = svc.call_args[0]
            assert args[1] == cid
            assert args[3] == mock_current_user.id

        assert res.status_code == 200

    def test_empty_name_returns_422(self, client):
        """name='' → vi phạm Field(min_length=1) → 422."""
        cid = make_id()
        res = client.put(f"/categories/{cid}", json={"name": ""})
        assert res.status_code == 422

    def test_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.update_category",
                   side_effect=not_found_exc(cid)):
            res = client.put(f"/categories/{cid}", json={"name": "X"})

        assert res.status_code == 404

    def test_self_parent_returns_400(self, client):
        """Service raise 400 → 400."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.update_category",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Category cannot be its own parent"}
                   )):
            res = client.put(f"/categories/{cid}", json={"parent_id": cid})

        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.put(f"/categories/{make_id()}", json={"name": "X"})
        assert res.status_code == 401


# DELETE /categories/{category_id}  (PROTECTED)

class TestDeleteCategoryEndpoint:

    def test_delete_returns_200(self, client, mock_current_user):
        """DELETE /categories/{id} hợp lệ → 200."""
        cid = make_id()
        mock_res = {"success": True,
                    "message": "Category deleted successfully"}

        with patch("app.routes.categories.CategoryService.delete_category",
                   return_value=mock_res) as svc:
            res = client.delete(f"/categories/{cid}")
            args = svc.call_args[0]
            assert args[1] == cid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.delete_category",
                   side_effect=not_found_exc(cid)):
            res = client.delete(f"/categories/{cid}")

        assert res.status_code == 404

    def test_category_with_products_returns_400(self, client):
        """Service raise 400 (có products) → 400."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.delete_category",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Cannot delete category. It has 5 products."}
                   )):
            res = client.delete(f"/categories/{cid}")

        assert res.status_code == 400
        assert "products" in res.json()["detail"]["message"]

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.delete(f"/categories/{make_id()}")
        assert res.status_code == 401


# PATCH /categories/{category_id}/toggle-status  (PROTECTED)

class TestToggleCategoryStatusEndpoint:

    def test_returns_200_with_updated_category(self, client, mock_current_user):
        """PATCH /categories/{id}/toggle-status → 200."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.toggle_status",
                   return_value=category_response(cid, "Category status changed to inactive")) as svc:
            res = client.patch(f"/categories/{cid}/toggle-status")
            args = svc.call_args[0]
            assert args[1] == cid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.toggle_status",
                   side_effect=not_found_exc(cid)):
            res = client.patch(f"/categories/{cid}/toggle-status")

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.patch(f"/categories/{make_id()}/toggle-status")
        assert res.status_code == 401


# PATCH /categories/{category_id}/move  (PROTECTED)

class TestMoveCategoryEndpoint:

    def test_move_to_new_parent_returns_200(self, client, mock_current_user):
        """PATCH /categories/{id}/move với new_parent_id hợp lệ → 200."""
        cid = make_id()
        new_parent = make_id()
        with patch("app.routes.categories.CategoryService.move_category",
                   return_value=category_response(cid, "Category moved successfully")) as svc:
            res = client.patch(
                f"/categories/{cid}/move",
                json={"new_parent_id": new_parent}
            )
            args = svc.call_args[0]
            assert args[1] == cid
            assert args[2] == new_parent
            assert args[3] == mock_current_user.id

        assert res.status_code == 200

    def test_move_to_root_returns_200(self, client, mock_current_user):
        """new_parent_id=null → move thành root → 200."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.move_category",
                   return_value=category_response(cid, "Category moved successfully")) as svc:
            res = client.patch(
                f"/categories/{cid}/move",
                json={"new_parent_id": None}
            )
            args = svc.call_args[0]
            assert args[2] is None

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.move_category",
                   side_effect=not_found_exc(cid)):
            res = client.patch(
                f"/categories/{cid}/move",
                json={"new_parent_id": make_id()}
            )

        assert res.status_code == 404

    def test_self_parent_returns_400(self, client):
        """Service raise 400 (move to self) → 400."""
        cid = make_id()
        with patch("app.routes.categories.CategoryService.move_category",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Category cannot be its own parent"}
                   )):
            res = client.patch(
                f"/categories/{cid}/move",
                json={"new_parent_id": cid}
            )

        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        """Không có token → 401."""
        res = public_client.patch(
            f"/categories/{make_id()}/move",
            json={"new_parent_id": None}
        )
        assert res.status_code == 401
