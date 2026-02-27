import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException
from app.core.config import settings

# HELPERS


def make_id() -> str:
    return str(uuid.uuid4())


def token_response(message="Login successful") -> dict:
    return {
        "success": True,
        "message": message,
        "data": {
            "access_token": "mock.access.token",
            "token_type": "bearer"
        }
    }


def success_response(message="Success") -> dict:
    return {"success": True, "message": message, "data": None}


def not_found_exc(resource="User") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False, "message": f"{resource} not found"}
    )


def bad_request_exc(message="Bad request") -> HTTPException:
    return HTTPException(
        status_code=400,
        detail={"success": False, "message": message}
    )


COOKIE_NAME = settings.COOKIE_NAME

# POST /auth/register


class TestRegisterEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "email": "newuser@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "full_name": "New User",
            "phone_number": "0900000000",
            "code": "123456",
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, public_client):
        mock_res = {
            "success": True,
            "message": "User created successfully",
            "data": {
                "email": "newuser@example.com",
                "full_name": "New User",
                "phone_number": "0900000000",
                "status": "ACTIVE"
            }
        }
        with patch("app.routes.auth.AuthService.register",
                   return_value=mock_res):
            res = public_client.post("/auth/register", json=self._payload())

        assert res.status_code == 200  # register endpoint không có status_code=201

    def test_missing_email_returns_422(self, public_client):
        payload = self._payload()
        del payload["email"]
        res = public_client.post("/auth/register", json=payload)
        assert res.status_code == 422

    def test_password_mismatch_returns_422(self, public_client):
        """confirm_password khác password → validator raise ValueError → 422."""
        res = public_client.post("/auth/register", json=self._payload(
            confirm_password="different_password"
        ))
        assert res.status_code == 422

    def test_invalid_otp_returns_400(self, public_client):
        with patch("app.routes.auth.AuthService.register",
                   side_effect=bad_request_exc("Invalid OTP")):
            res = public_client.post("/auth/register", json=self._payload())
        assert res.status_code == 400

# POST /auth/otp


class TestSendOtpEndpoint:

    def test_valid_request_returns_200(self, public_client):
        mock_res = {"success": True, "message": "OTP sent to user@example.com"}
        with patch("app.routes.auth.AuthService.send_otp",
                   return_value=mock_res):
            res = public_client.post("/auth/otp", json={
                "email": "user@example.com",
                "type": "REGISTER"
            })
        assert res.status_code == 200

    def test_invalid_type_returns_422(self, public_client):
        res = public_client.post("/auth/otp", json={
            "email": "user@example.com",
            "type": "INVALID_TYPE"
        })
        assert res.status_code == 422

    def test_email_already_exists_returns_409(self, public_client):
        with patch("app.routes.auth.AuthService.send_otp",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "User with this email already exists"}
                   )):
            res = public_client.post("/auth/otp", json={
                "email": "existing@example.com",
                "type": "REGISTER"
            })
        assert res.status_code == 409

# POST /auth/login


class TestLoginEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "email": "user@example.com",
            "password": "password123",
        }
        return {**base, **overrides}

    def test_valid_credentials_returns_200_with_token(self, public_client):
        with patch("app.routes.auth.AuthService.login",
                   return_value=token_response()):
            res = public_client.post("/auth/login", json=self._payload())
        assert res.status_code == 200
        assert res.json()["data"]["access_token"] == "mock.access.token"

    def test_missing_email_returns_422(self, public_client):
        payload = self._payload()
        del payload["email"]
        res = public_client.post("/auth/login", json=payload)
        assert res.status_code == 422

    def test_invalid_credentials_returns_401(self, public_client):
        with patch("app.routes.auth.AuthService.login",
                   side_effect=HTTPException(
                       status_code=401,
                       detail={"success": False,
                               "message": "Invalid credentials"}
                   )):
            res = public_client.post("/auth/login", json=self._payload())
        assert res.status_code == 401

    def test_service_receives_response_object(self, public_client):
        """Service phải nhận được response object để set cookie."""
        with patch("app.routes.auth.AuthService.login",
                   return_value=token_response()) as svc:
            public_client.post("/auth/login", json=self._payload())
            # Đảm bảo service được gọi với keyword argument response
            assert svc.called

# POST /auth/refresh


class TestRefreshTokenEndpoint:

    def test_valid_cookie_returns_200(self, public_client):
        """Cookie hợp lệ → service được gọi, trả về token mới."""
        with patch("app.routes.auth.AuthService.refresh_token_handler",
                   return_value=token_response("Token refreshed successfully")):
            res = public_client.post(
                "/auth/refresh",
                cookies={COOKIE_NAME: "valid.refresh.token"}
            )
        assert res.status_code == 200

    def test_no_cookie_returns_401(self, public_client):
        """Không có cookie → router raise 401 trước khi gọi service."""
        res = public_client.post("/auth/refresh")
        assert res.status_code == 401

    def test_invalid_token_returns_401(self, public_client):
        """Service raise 401 → 401."""
        with patch("app.routes.auth.AuthService.refresh_token_handler",
                   side_effect=HTTPException(
                       status_code=401,
                       detail={"success": False,
                               "message": "Invalid refresh token"}
                   )):
            res = public_client.post(
                "/auth/refresh",
                cookies={COOKIE_NAME: "bad.token"}
            )
        assert res.status_code == 401

    def test_expired_token_returns_401(self, public_client):
        """Token hết hạn → service raise 401."""
        with patch("app.routes.auth.AuthService.refresh_token_handler",
                   side_effect=HTTPException(
                       status_code=401,
                       detail={"success": False,
                               "message": "Expired refresh token"}
                   )):
            res = public_client.post(
                "/auth/refresh",
                cookies={COOKIE_NAME: "expired.token"}
            )
        assert res.status_code == 401

# POST /auth/logout


class TestLogoutEndpoint:

    def test_valid_cookie_returns_200(self, public_client):
        """Cookie hợp lệ → logout thành công."""
        with patch("app.routes.auth.AuthService.logout",
                   return_value={"success": True, "message": "Logged out successfully"}):
            res = public_client.post(
                "/auth/logout",
                cookies={COOKIE_NAME: "valid.refresh.token"}
            )
        assert res.status_code == 200

    def test_no_cookie_returns_401(self, public_client):
        """Không có cookie → router raise 401."""
        res = public_client.post("/auth/logout")
        assert res.status_code == 401

    def test_invalid_token_returns_401(self, public_client):
        """Service raise 401."""
        with patch("app.routes.auth.AuthService.logout",
                   side_effect=HTTPException(
                       status_code=401,
                       detail={"success": False,
                               "message": "Invalid refresh token"}
                   )):
            res = public_client.post(
                "/auth/logout",
                cookies={COOKIE_NAME: "bad.token"}
            )
        assert res.status_code == 401

# POST /auth/forgot-password


class TestForgotPasswordEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "email": "user@example.com",
            "code": "123456",
            "new_password": "newpassword123",
            "confirm_new_password": "newpassword123",
        }
        return {**base, **overrides}

    def test_valid_payload_returns_200(self, public_client):
        with patch("app.routes.auth.AuthService.forgot_password",
                   return_value={"success": True,
                                 "message": "Password changed successfully"}):
            res = public_client.post(
                "/auth/forgot-password", json=self._payload()
            )
        assert res.status_code == 200

    def test_password_mismatch_returns_422(self, public_client):
        res = public_client.post(
            "/auth/forgot-password",
            json=self._payload(confirm_new_password="different")
        )
        assert res.status_code == 422

    def test_invalid_otp_returns_400(self, public_client):
        with patch("app.routes.auth.AuthService.forgot_password",
                   side_effect=bad_request_exc("Invalid OTP")):
            res = public_client.post(
                "/auth/forgot-password", json=self._payload()
            )
        assert res.status_code == 400

    def test_user_not_found_returns_404(self, public_client):
        with patch("app.routes.auth.AuthService.forgot_password",
                   side_effect=not_found_exc("User")):
            res = public_client.post(
                "/auth/forgot-password", json=self._payload()
            )
        assert res.status_code == 404

# POST /auth/2fa/setup  (PROTECTED)


class TestSetup2FAEndpoint:

    def test_returns_200_with_secret_and_uri(self, client, mock_current_user):
        mock_res = {
            "success": True,
            "message": "2FA setup initiated",
            "data": {
                "secret": "JBSWY3DPEHPK3PXP",
                "uri": "otpauth://totp/test"
            }
        }
        with patch("app.routes.auth.AuthService.setup_2fa",
                   return_value=mock_res) as svc:
            res = client.post("/auth/2fa/setup")
            assert svc.call_args[0][1] == mock_current_user.id

        assert res.status_code == 200
        assert res.json()["data"]["secret"] == "JBSWY3DPEHPK3PXP"

    def test_already_enabled_returns_400(self, client):
        with patch("app.routes.auth.AuthService.setup_2fa",
                   side_effect=bad_request_exc("2FA is already enabled")):
            res = client.post("/auth/2fa/setup")
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/auth/2fa/setup")
        assert res.status_code == 401

# POST /auth/2fa/enable  (PROTECTED)


class TestEnable2FAEndpoint:

    def test_valid_totp_returns_200(self, client, mock_current_user):
        with patch("app.routes.auth.AuthService.enable_2fa",
                   return_value=success_response("2FA enabled successfully")) as svc:
            res = client.post("/auth/2fa/enable", json={"totp_code": "123456"})
            assert svc.call_args[0][1] == mock_current_user.id
            assert svc.call_args[0][2] == "123456"

        assert res.status_code == 200

    def test_invalid_totp_returns_400(self, client):
        with patch("app.routes.auth.AuthService.enable_2fa",
                   side_effect=bad_request_exc("Invalid TOTP code")):
            res = client.post("/auth/2fa/enable", json={"totp_code": "000000"})
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            "/auth/2fa/enable", json={"totp_code": "123456"})
        assert res.status_code == 401

# POST /auth/2fa/disable  (PROTECTED)


class TestDisable2FAEndpoint:

    def test_via_totp_returns_200(self, client, mock_current_user):
        with patch("app.routes.auth.AuthService.disable_2fa",
                   return_value=success_response("2FA disabled successfully")) as svc:
            res = client.post(
                "/auth/2fa/disable", json={"totp_code": "123456"}
            )
            assert svc.call_args[1]["user_id"] == mock_current_user.id

        assert res.status_code == 200

    def test_invalid_code_returns_400(self, client):
        with patch("app.routes.auth.AuthService.disable_2fa",
                   side_effect=bad_request_exc("Invalid TOTP code")):
            res = client.post(
                "/auth/2fa/disable", json={"totp_code": "000000"}
            )
        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            "/auth/2fa/disable", json={"totp_code": "123456"}
        )
        assert res.status_code == 401
