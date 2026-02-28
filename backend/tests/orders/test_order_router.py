import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException
from decimal import Decimal

# HELPERS


def make_id() -> str:
    return str(uuid.uuid4())


def order_response(message="Order retrieved successfully") -> dict:
    return {
        "success": True,
        "message": message,
        "data": {
            "id": make_id(),
            "order_number": "ORD-20240101-00001",
            "user_id": make_id(),
            "status": "pending",
            "payment_status": "unpaid",
            "payment_method": "cod",
            "subtotal": 200000.0,
            "discount": 0.0,
            "shipping_fee": 30000.0,
            "total": 230000.0,
            "shipping_address": {
                "name": "Test", "phone": "09000",
                "address": "123", "city": "HCM"
            },
            "notes": None,
            "items": [],
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }


def list_response(count: int = 2) -> dict:
    return {
        "success": True,
        "message": "Orders list retrieved successfully",
        "data": [],
        "meta": {"total": count, "page": 1, "limit": 20, "total_pages": 1}
    }


def stats_response() -> dict:
    return {
        "success": True,
        "message": "Order statistics retrieved successfully",
        "data": {
            "total_orders": 100,
            "pending_orders": 10,
            "processing_orders": 20,
            "shipped_orders": 30,
            "delivered_orders": 25,
            "cancelled_orders": 15,
            "total_revenue": 5000000.0
        }
    }


def not_found_exc(resource="Order") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False, "message": f"{resource} not found"}
    )


def bad_request_exc(message="Bad request") -> HTTPException:
    return HTTPException(
        status_code=400,
        detail={"success": False, "message": message}
    )


def create_order_payload(**overrides) -> dict:
    base = {
        "shipping_address": {
            "name": "Test User",
            "phone": "0900000000",
            "address": "123 Test St",
            "city": "HCM",
            "country": "Vietnam"
        },
        "payment_method": "cod",
        "notes": None
    }
    return {**base, **overrides}

# POST /orders  (Customer)


class TestCreateOrderEndpoint:

    def test_valid_payload_returns_201(self, client, mock_current_user):
        """POST /orders → 201, service nhận đúng user_id."""
        mock_res = order_response("Order created successfully")

        with patch("app.routes.orders.OrderService.create_order",
                   return_value=mock_res) as svc:
            res = client.post("/orders", json=create_order_payload())
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 201

    def test_missing_shipping_address_returns_422(self, client):
        """Thiếu shipping_address → 422."""
        payload = create_order_payload()
        del payload["shipping_address"]
        res = client.post("/orders", json=payload)
        assert res.status_code == 422

    def test_missing_payment_method_returns_422(self, client):
        """Thiếu payment_method → 422."""
        payload = create_order_payload()
        del payload["payment_method"]
        res = client.post("/orders", json=payload)
        assert res.status_code == 422

    def test_empty_cart_returns_400(self, client):
        """Service raise 400 khi cart rỗng."""
        with patch("app.routes.orders.OrderService.create_order",
                   side_effect=bad_request_exc("Cart is empty")):
            res = client.post("/orders", json=create_order_payload())
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/orders", json=create_order_payload())
        assert res.status_code == 401

# GET /orders  (Customer)


class TestGetMyOrdersEndpoint:

    def test_returns_200_with_list(self, client, mock_current_user):
        """GET /orders → 200, service nhận đúng user_id."""
        with patch("app.routes.orders.OrderService.get_user_orders",
                   return_value=list_response()) as svc:
            res = client.get("/orders")
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_forwards_pagination_params(self, client):
        """Query params page, limit được forward đúng."""
        with patch("app.routes.orders.OrderService.get_user_orders",
                   return_value=list_response()) as svc:
            client.get("/orders?page=2&limit=10")
            assert svc.call_args[0][2] == 2   # page
            assert svc.call_args[0][3] == 10  # limit

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/orders")
        assert res.status_code == 401

# GET /orders/{order_id}  (Customer)


class TestGetOrderDetailEndpoint:

    def test_existing_order_returns_200(self, client, mock_current_user):
        """GET /orders/{id} → 200, service nhận đúng user_id và order_id."""
        oid = make_id()
        with patch("app.routes.orders.OrderService.get_order_detail",
                   return_value=order_response()) as svc:
            res = client.get(f"/orders/{oid}")
            assert svc.call_args[0][1] == mock_current_user.id
            assert svc.call_args[0][2] == oid

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        oid = make_id()
        with patch("app.routes.orders.OrderService.get_order_detail",
                   side_effect=not_found_exc()):
            res = client.get(f"/orders/{oid}")
        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get(f"/orders/{make_id()}")
        assert res.status_code == 401

# PATCH /orders/{order_id}/cancel  (Customer)


class TestCancelOrderEndpoint:

    def test_returns_200_on_success(self, client, mock_current_user):
        """PATCH /orders/{id}/cancel → 200, service nhận đúng user_id."""
        oid = make_id()
        mock_res = order_response("Order cancelled successfully")

        with patch("app.routes.orders.OrderService.cancel_order",
                   return_value=mock_res) as svc:
            res = client.patch(f"/orders/{oid}/cancel")
            assert svc.call_args[0][1] == mock_current_user.id
            assert svc.call_args[0][2] == oid

        assert res.status_code == 200

    def test_not_cancellable_returns_400(self, client):
        oid = make_id()
        with patch("app.routes.orders.OrderService.cancel_order",
                   side_effect=bad_request_exc("Cannot cancel order")):
            res = client.patch(f"/orders/{oid}/cancel")
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(f"/orders/{make_id()}/cancel")
        assert res.status_code == 401

# GET /orders/all  (Admin)


class TestGetAllOrdersAdminEndpoint:

    def test_returns_200_with_list(self, admin_client):
        """GET /orders/all → 200."""
        with patch("app.routes.orders.OrderService.get_all_orders",
                   return_value=list_response()):
            res = admin_client.get("/orders/all")
        assert res.status_code == 200

    def test_forwards_status_filter(self, admin_client):
        """status query param được forward đúng."""
        with patch("app.routes.orders.OrderService.get_all_orders",
                   return_value=list_response()) as svc:
            admin_client.get("/orders/all?status=pending")
            assert svc.call_args[0][1] == "pending"

    def test_forwards_pagination_params(self, admin_client):
        with patch("app.routes.orders.OrderService.get_all_orders",
                   return_value=list_response()) as svc:
            admin_client.get("/orders/all?page=2&limit=5")
            assert svc.call_args[0][2] == 2
            assert svc.call_args[0][3] == 5

    def test_invalid_status_returns_400(self, admin_client):
        with patch("app.routes.orders.OrderService.get_all_orders",
                   side_effect=bad_request_exc("Invalid status")):
            res = admin_client.get("/orders/all?status=bad_status")
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/orders/all")
        assert res.status_code == 401

# GET /orders/stats  (Admin)


class TestGetOrderStatsEndpoint:

    def test_returns_200_with_stats(self, admin_client):
        """GET /orders/stats → 200, data có đủ keys."""
        with patch("app.routes.orders.OrderService.get_order_stats",
                   return_value=stats_response()):
            res = admin_client.get("/orders/stats")

        assert res.status_code == 200
        body = res.json()
        assert body["data"]["total_orders"] == 100
        assert float(body["data"]["total_revenue"]) == 5000000.0

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/orders/stats")
        assert res.status_code == 401

# GET /orders/admin/{order_id}  (Admin)


class TestGetOrderDetailAdminEndpoint:

    def test_any_order_returns_200(self, admin_client):
        """GET /orders/admin/{id} → 200, không filter theo user_id."""
        oid = make_id()
        with patch("app.routes.orders.OrderService.get_order_detail_admin",
                   return_value=order_response()) as svc:
            res = admin_client.get(f"/orders/admin/{oid}")
            assert svc.call_args[0][1] == oid

        assert res.status_code == 200

    def test_not_found_returns_404(self, admin_client):
        oid = make_id()
        with patch("app.routes.orders.OrderService.get_order_detail_admin",
                   side_effect=not_found_exc()):
            res = admin_client.get(f"/orders/admin/{oid}")
        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get(f"/orders/admin/{make_id()}")
        assert res.status_code == 401

# PATCH /orders/{order_id}/status  (Admin)


class TestUpdateOrderStatusEndpoint:

    def test_valid_status_returns_200(self, admin_client, mock_admin_user):
        """PATCH /orders/{id}/status → 200, service nhận đúng order_id và status."""
        oid = make_id()
        mock_res = order_response("Order status updated")

        with patch("app.routes.orders.OrderService.update_order_status",
                   return_value=mock_res) as svc:
            res = admin_client.patch(
                f"/orders/{oid}/status",
                json={"status": "processing"}
            )
            assert svc.call_args[0][1] == oid
            assert svc.call_args[0][2] == "processing"

        assert res.status_code == 200

    def test_invalid_status_returns_422(self, admin_client):
        """Status không hợp lệ → validator raise ValueError → 422."""
        oid = make_id()
        res = admin_client.patch(
            f"/orders/{oid}/status",
            json={"status": "invalid_status"}
        )
        assert res.status_code == 422

    def test_not_found_returns_404(self, admin_client):
        oid = make_id()
        with patch("app.routes.orders.OrderService.update_order_status",
                   side_effect=not_found_exc()):
            res = admin_client.patch(
                f"/orders/{oid}/status",
                json={"status": "processing"}
            )
        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.patch(
            f"/orders/{make_id()}/status",
            json={"status": "processing"}
        )
        assert res.status_code == 401
