import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException

# HELPERS


def make_id() -> str:
    return str(uuid.uuid4())


def make_user_data(user_id: str = None, email: str = "user@test.com") -> dict:
    """Dict khớp với UserResponse schema."""
    return {
        "id": user_id or make_id(),
        "email": email,
        "full_name": "Test User",
        "phone_number": "0901234567",
        "avatar": None,
        "status": "ACTIVE",
        "is_2fa_enabled": False,
        "role": {"id": make_id(), "name": "ADMIN", "description": "Administrator"},
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "created_by_id": None,
        "updated_by_id": None,
    }


def detail_response(user_id: str = None, message: str = "User retrieved successfully") -> dict:
    return {"success": True, "message": message, "data": make_user_data(user_id)}


def list_response(count: int = 1, total: int = 1) -> dict:
    return {
        "success": True,
        "message": "Users list retrieved successfully",
        "data": [make_user_data() for _ in range(count)],
        "meta": {"total": total, "page": 1, "limit": 10, "total_pages": 1}
    }


def not_found_exc(resource: str = "User", uid: str = "x") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False,
                "message": f"{resource} with id '{uid}' not found"}
    )


# GET /users
class TestGetAllUsersEndpoint:

    def test_returns_200_with_list(self, client):
        with patch("app.routes.users.UserService.get_all_users",
                   return_value=list_response()):
            res = client.get("/users")

        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "data" in body
        assert "meta" in body

    def test_forwards_pagination_params(self, client):
        with patch("app.routes.users.UserService.get_all_users",
                   return_value=list_response()) as svc:
            client.get("/users?page=2&limit=5")
            kw = svc.call_args.kwargs
            assert kw["page"] == 2
            assert kw["limit"] == 5

    def test_forwards_search_param(self, client):
        with patch("app.routes.users.UserService.get_all_users",
                   return_value=list_response()) as svc:
            client.get("/users?search=john")
            assert svc.call_args.kwargs["search"] == "john"

    def test_forwards_role_and_status_filters(self, client):
        with patch("app.routes.users.UserService.get_all_users",
                   return_value=list_response()) as svc:
            client.get("/users?role=ADMIN&status=ACTIVE")
            kw = svc.call_args.kwargs
            assert kw["role"] == "ADMIN"
            assert kw["status"] == "ACTIVE"

    def test_page_less_than_1_returns_422(self, client):
        """page=0 vi phạm Query(ge=1) → FastAPI tự validate → 422."""
        res = client.get("/users?page=0")
        assert res.status_code == 422

    def test_limit_over_100_returns_422(self, client):
        """limit=101 vi phạm Query(le=100) → 422."""
        res = client.get("/users?limit=101")
        assert res.status_code == 422


# GET /users/stats
class TestGetUserStatsEndpoint:

    def test_returns_200_with_stats_data(self, client):
        mock_stats = {
            "success": True,
            "message": "User statistics retrieved",
            "data": {
                "total_users": 100, "active_users": 80,
                "inactive_users": 20, "users_with_2fa": 10,
                "users_by_role": {"ADMIN": 5, "USER": 95}
            }
        }

        with patch("app.routes.users.UserService.get_user_stats",
                   return_value=mock_stats):
            res = client.get("/users/stats")

        assert res.status_code == 200
        assert res.json()["data"]["total_users"] == 100


# GET /users/{user_id}
class TestGetUserByIdEndpoint:

    def test_existing_user_returns_200(self, client):
        uid = make_id()
        with patch("app.routes.users.UserService.get_user",
                   return_value=detail_response(uid)) as svc:
            res = client.get(f"/users/{uid}")
            assert svc.call_args[0][1] == uid  # user_id được truyền đúng

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        uid = make_id()
        with patch("app.routes.users.UserService.get_user",
                   side_effect=not_found_exc("User", uid)):
            res = client.get(f"/users/{uid}")

        assert res.status_code == 404
        assert res.json()["detail"]["success"] is False


# POST /users
class TestCreateUserEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "email": "new@test.com",
            "password": "secret123",
            "full_name": "New User",
            "phone_number": "0909999999",
            "role_id": make_id(),
            "status": "ACTIVE"
        }
        return {**base, **overrides}

    def test_valid_payload_calls_service_with_current_user_id(
        self, client, mock_current_user
    ):
        """current_user.id phải được forward vào service."""
        uid = make_id()
        with patch("app.routes.users.UserService.create_user",
                   return_value=detail_response(uid, "user created successfully")) as svc:
            res = client.post("/users", json=self._payload())
            assert svc.call_args[0][2] == mock_current_user.id

        assert res.status_code == 200

    def test_missing_email_returns_422(self, client):
        payload = self._payload()
        del payload["email"]
        res = client.post("/users", json=payload)
        assert res.status_code == 422

    def test_password_too_short_returns_422(self, client):
        """Password < 6 ký tự → Field(min_length=6) → 422."""
        res = client.post("/users", json=self._payload(password="123"))
        assert res.status_code == 422

    def test_invalid_email_format_returns_422(self, client):
        res = client.post("/users", json=self._payload(email="not-an-email"))
        assert res.status_code == 422

    def test_duplicate_email_returns_409(self, client):
        with patch("app.routes.users.UserService.create_user",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "User with this email already exists"}
                   )):
            res = client.post("/users", json=self._payload())

        assert res.status_code == 409

    def test_role_not_found_returns_404(self, client):
        with patch("app.routes.users.UserService.create_user",
                   side_effect=not_found_exc("Role")):
            res = client.post("/users", json=self._payload())

        assert res.status_code == 404


# PUT /users/{user_id}
class TestUpdateUserEndpoint:

    def test_valid_payload_returns_200(self, client, mock_current_user):
        uid = make_id()
        with patch("app.routes.users.UserService.update_user",
                   return_value=detail_response(uid, "User updated successfully")) as svc:
            res = client.put(f"/users/{uid}", json={"full_name": "Updated"})
            args = svc.call_args[0]
            assert args[1] == uid
            assert args[3] == mock_current_user.id  # updated_by_id

        assert res.status_code == 200

    def test_empty_full_name_returns_422(self, client):
        """full_name = "" vi phạm Field(min_length=1) → 422."""
        uid = make_id()
        res = client.put(f"/users/{uid}", json={"full_name": ""})
        assert res.status_code == 422

    def test_not_found_returns_404(self, client):
        uid = make_id()
        with patch("app.routes.users.UserService.update_user",
                   side_effect=not_found_exc("User", uid)):
            res = client.put(f"/users/{uid}", json={"full_name": "X"})

        assert res.status_code == 404


# DELETE /users/{user_id}
class TestDeleteUserEndpoint:

    def test_returns_200_with_success_message(self, client, mock_current_user):
        uid = make_id()
        mock_res = {"success": True,
                    "message": "User deleted successfully", "data": None}

        with patch("app.routes.users.UserService.delete_user",
                   return_value=mock_res) as svc:
            res = client.delete(f"/users/{uid}")
            args = svc.call_args[0]
            assert args[1] == uid
            assert args[2] == mock_current_user.id  # deleted_by_id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        uid = make_id()
        with patch("app.routes.users.UserService.delete_user",
                   side_effect=not_found_exc("User", uid)):
            res = client.delete(f"/users/{uid}")

        assert res.status_code == 404

    def test_delete_self_returns_400(self, client, mock_current_user):
        with patch("app.routes.users.UserService.delete_user",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "You cannot delete yourself"}
                   )):
            res = client.delete(f"/users/{mock_current_user.id}")

        assert res.status_code == 400
        assert "yourself" in res.json()["detail"]["message"]


# PUT /users/{user_id}/toggle-status
class TestToggleStatusEndpoint:

    def test_returns_200_with_updated_user(self, client, mock_current_user):
        uid = make_id()
        with patch("app.routes.users.UserService.toggle_status",
                   return_value=detail_response(uid, "User status changed to INACTIVE")) as svc:
            res = client.put(f"/users/{uid}/toggle-status")
            args = svc.call_args[0]
            assert args[1] == uid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_toggle_self_returns_400(self, client, mock_current_user):
        with patch("app.routes.users.UserService.toggle_status",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "You cannot change your own status"}
                   )):
            res = client.put(f"/users/{mock_current_user.id}/toggle-status")

        assert res.status_code == 400

    def test_not_found_returns_404(self, client):
        uid = make_id()
        with patch("app.routes.users.UserService.toggle_status",
                   side_effect=not_found_exc("User", uid)):
            res = client.put(f"/users/{uid}/toggle-status")

        assert res.status_code == 404
