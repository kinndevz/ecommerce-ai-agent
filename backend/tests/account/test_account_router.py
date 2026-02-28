import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException


# HELPERS

def make_id() -> str:
    return str(uuid.uuid4())


def profile_response(uid: str = None) -> dict:
    return {
        "success": True,
        "message": "Test User retrieved successfully",
        "data": {
            "id": uid or make_id(),
            "email": "user@example.com",
            "full_name": "Test User",
            "phone_number": "0900000000",
            "avatar": None,
            "status": "ACTIVE",
            "is_2fa_enabled": False,
            "role": {
                "id": make_id(),
                "name": "CUSTOMER",
                "description": "Customer",
                "is_active": True,
                "permissions": []
            },
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
        }
    }


def preference_response() -> dict:
    return {
        "success": True,
        "message": "User preferences retrieved successfully",
        "data": {
            "skin_type": "da dầu",
            "skin_concerns": ["mụn"],
            "favorite_brands": [],
            "price_range_min": None,
            "price_range_max": None,
            "preferred_categories": [],
            "allergies": []
        }
    }


def not_found_exc() -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False, "message": "User not found"}
    )


def bad_request_exc(message: str = "Bad request") -> HTTPException:
    return HTTPException(
        status_code=400,
        detail={"success": False, "message": message}
    )


# GET /me

class TestGetMyProfileEndpoint:

    def test_returns_200_with_profile(self, client, mock_current_user):
        """GET /me → 200, service nhận đúng user_id."""
        mock_res = profile_response(mock_current_user.id)

        with patch("app.routes.account.AccountService.get_my_profile",
                   return_value=mock_res) as svc:
            res = client.get("/me")
            assert svc.call_args[1]["user_id"] == mock_current_user.id

        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/me")
        assert res.status_code == 401


# PUT /me

class TestUpdateMyProfileEndpoint:

    def test_valid_update_returns_200(self, client, mock_current_user):
        """PUT /me → 200, service nhận đúng user_id."""
        mock_res = profile_response(mock_current_user.id)
        mock_res["message"] = "Test User updated successfully"

        with patch("app.routes.account.AccountService.update_profile",
                   return_value=mock_res) as svc:
            res = client.put("/me", json={"full_name": "New Name"})
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_empty_payload_returns_200(self, client):
        """Payload rỗng (tất cả Optional) → không lỗi validation."""
        mock_res = profile_response()

        with patch("app.routes.account.AccountService.update_profile",
                   return_value=mock_res):
            res = client.put("/me", json={})

        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put("/me", json={"full_name": "X"})
        assert res.status_code == 401


# PUT /change-password

class TestChangePasswordEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "old_password": "old_pass",
            "new_password": "new_pass123",
            "confirm_new_password": "new_pass123",
        }
        return {**base, **overrides}

    def test_valid_payload_returns_200(self, client, mock_current_user):
        """PUT /change-password → 200, service nhận đúng user_id."""
        mock_res = {"success": True, "message": "Password changed successfully",
                    "data": None}

        with patch("app.routes.account.AccountService.change_password",
                   return_value=mock_res) as svc:
            res = client.put("/change-password", json=self._payload())
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_missing_old_password_returns_422(self, client):
        payload = self._payload()
        del payload["old_password"]
        res = client.put("/change-password", json=payload)
        assert res.status_code == 422

    def test_wrong_old_password_returns_400(self, client):
        """Service raise 400 khi sai mật khẩu cũ."""
        with patch("app.routes.account.AccountService.change_password",
                   side_effect=bad_request_exc("Old password is incorrect")):
            res = client.put("/change-password", json=self._payload())
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put("/change-password", json=self._payload())
        assert res.status_code == 401


# GET /me/preferences

class TestGetMyPreferencesEndpoint:

    def test_returns_200_with_preference_data(self, client, mock_current_user):
        """GET /me/preferences → 200, service nhận đúng user_id."""
        with patch("app.routes.account.PreferenceService.get_my_preferences",
                   return_value=preference_response()) as svc:
            res = client.get("/me/preferences")
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_returns_200_with_none_data_when_no_preference(self, client):
        """Không có preference → data=None, vẫn 200."""
        mock_res = {
            "success": True,
            "message": "User preferences retrieved successfully",
            "data": None
        }
        with patch("app.routes.account.PreferenceService.get_my_preferences",
                   return_value=mock_res):
            res = client.get("/me/preferences")

        assert res.status_code == 200
        assert res.json()["data"] is None

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/me/preferences")
        assert res.status_code == 401


# PUT /me/preferences

class TestUpdateMyPreferencesEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "skin_type": "da dầu",
            "skin_concerns": ["mụn"],
            "favorite_brands": [],
            "price_range_min": None,
            "price_range_max": None,
            "preferred_categories": [],
            "allergies": []
        }
        return {**base, **overrides}

    def test_valid_payload_returns_200(self, client, mock_current_user):
        """PUT /me/preferences → 200, service nhận đúng user_id."""
        mock_res = preference_response()
        mock_res["message"] = "User preferences updated successfully"

        with patch("app.routes.account.PreferenceService.update_my_preferences",
                   return_value=mock_res) as svc:
            res = client.put("/me/preferences", json=self._payload())
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200

    def test_empty_payload_returns_200(self, client):
        """Payload rỗng (tất cả Optional) → không lỗi validation."""
        mock_res = preference_response()

        with patch("app.routes.account.PreferenceService.update_my_preferences",
                   return_value=mock_res):
            res = client.put("/me/preferences", json={})

        assert res.status_code == 200

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put("/me/preferences", json=self._payload())
        assert res.status_code == 401
