import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException
from decimal import Decimal

# HELPERS


def make_id() -> str:
    return str(uuid.uuid4())


def make_cart_response(user_id: str = None) -> dict:
    return {
        "success": True,
        "message": "Cart retrieved successfully!",
        "data": {
            "id": make_id(),
            "user_id": user_id or make_id(),
            "items": [],
            "total_items": 0,
            "subtotal": 0.0,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
    }


def make_cart_with_item(user_id: str = None) -> dict:
    return {
        "success": True,
        "message": "Cart retrieved successfully!",
        "data": {
            "id": make_id(),
            "user_id": user_id or make_id(),
            "items": [
                {
                    "id": make_id(),
                    "product_id": make_id(),
                    "variant_id": None,
                    "quantity": 2,
                    "price": 100.0,
                    "product_name": "Test Product",
                    "product_slug": "test-product",
                    "product_image": "https://example.com/img.jpg",
                    "variant_name": None,
                    "subtotal": 200.0,
                    "created_at": "2024-01-01T00:00:00",
                    "updated_at": "2024-01-01T00:00:00",
                }
            ],
            "total_items": 1,
            "subtotal": 200.0,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
    }


def not_found_exc(resource: str = "Cart item", rid: str = "x") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False,
                "message": f"{resource} with id '{rid}' not found"}
    )

# GET /cart


class TestGetCartEndpoint:

    def test_returns_200_with_cart_data(self, client, mock_current_user):
        """GET /cart → 200, body có data.id, data.items, data.subtotal."""
        mock_res = make_cart_response(mock_current_user.id)

        with patch("app.routes.carts.CartService.get_cart",
                   return_value=mock_res) as svc:
            res = client.get("/cart")
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "id" in body["data"]
        assert "items" in body["data"]
        assert "subtotal" in body["data"]

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/cart")
        assert res.status_code == 401

# POST /cart/items


class TestAddToCartEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "product_id": make_id(),
            "variant_id": None,
            "quantity": 1,
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, client, mock_current_user):
        """POST /cart/items → 201, service nhận đúng user_id và product_id."""
        pid = make_id()
        mock_res = make_cart_with_item(mock_current_user.id)
        mock_res["message"] = "Item added to cart"

        with patch("app.routes.carts.CartService.add_to_cart",
                   return_value=mock_res) as svc:
            res = client.post(
                "/cart/items", json=self._payload(product_id=pid))
            args = svc.call_args[0]
            assert args[1] == mock_current_user.id  # user_id
            assert args[2] == pid                   # product_id

        assert res.status_code == 201

    def test_missing_product_id_returns_422(self, client):
        """Thiếu product_id → 422."""
        payload = self._payload()
        del payload["product_id"]
        res = client.post("/cart/items", json=payload)
        assert res.status_code == 422

    def test_quantity_zero_returns_422(self, client):
        """quantity=0 vi phạm Field(ge=1) → 422."""
        res = client.post("/cart/items", json=self._payload(quantity=0))
        assert res.status_code == 422

    def test_product_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        pid = make_id()
        with patch("app.routes.carts.CartService.add_to_cart",
                   side_effect=not_found_exc("Product", pid)):
            res = client.post(
                "/cart/items", json=self._payload(product_id=pid))

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/cart/items", json=self._payload())
        assert res.status_code == 401

# PUT /cart/items/{item_id}


class TestUpdateCartItemEndpoint:

    def test_valid_update_returns_200(self, client, mock_current_user):
        """PUT /cart/items/{id} → 200, service nhận đúng item_id, quantity, user_id."""
        iid = make_id()
        mock_res = make_cart_with_item(mock_current_user.id)
        mock_res["message"] = "Cart item updated"

        with patch("app.routes.carts.CartService.update_cart_item",
                   return_value=mock_res) as svc:
            res = client.put(f"/cart/items/{iid}", json={"quantity": 3})
            args = svc.call_args[0]
            assert args[1] == mock_current_user.id  # user_id
            assert args[2] == iid                   # item_id
            assert args[3] == 3                     # quantity

        assert res.status_code == 200

    def test_quantity_zero_returns_422(self, client):
        """quantity=0 vi phạm Field(ge=1) → 422."""
        iid = make_id()
        res = client.put(f"/cart/items/{iid}", json={"quantity": 0})
        assert res.status_code == 422

    def test_item_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        iid = make_id()
        with patch("app.routes.carts.CartService.update_cart_item",
                   side_effect=not_found_exc("Cart item", iid)):
            res = client.put(f"/cart/items/{iid}", json={"quantity": 1})

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put(
            f"/cart/items/{make_id()}", json={"quantity": 1})
        assert res.status_code == 401

# DELETE /cart/items/{item_id}


class TestRemoveCartItemEndpoint:

    def test_returns_200_with_updated_cart(self, client, mock_current_user):
        """DELETE /cart/items/{id} → 200, service nhận đúng item_id và user_id."""
        iid = make_id()
        mock_res = make_cart_response(mock_current_user.id)
        mock_res["message"] = "Item removed from cart"

        with patch("app.routes.carts.CartService.remove_cart_item",
                   return_value=mock_res) as svc:
            res = client.delete(f"/cart/items/{iid}")
            args = svc.call_args[0]
            assert args[1] == mock_current_user.id  # user_id
            assert args[2] == iid                   # item_id

        assert res.status_code == 200

    def test_item_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        iid = make_id()
        with patch("app.routes.carts.CartService.remove_cart_item",
                   side_effect=not_found_exc("Cart item", iid)):
            res = client.delete(f"/cart/items/{iid}")

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(f"/cart/items/{make_id()}")
        assert res.status_code == 401

# DELETE /cart


class TestClearCartEndpoint:

    def test_returns_200_with_empty_cart(self, client, mock_current_user):
        """DELETE /cart → 200, service nhận đúng user_id."""
        mock_res = make_cart_response(mock_current_user.id)
        mock_res["message"] = "Cart cleared"

        with patch("app.routes.carts.CartService.clear_cart",
                   return_value=mock_res) as svc:
            res = client.delete("/cart")
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_cart_not_found_returns_404(self, client):
        """Service raise 404 → 404."""
        with patch("app.routes.carts.CartService.clear_cart",
                   side_effect=HTTPException(
                       status_code=404,
                       detail={"success": False, "message": "Cart not found"}
                   )):
            res = client.delete("/cart")

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete("/cart")
        assert res.status_code == 401
