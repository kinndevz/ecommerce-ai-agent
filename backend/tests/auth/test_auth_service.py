import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta
from app.services.auth import AuthService
from app.core.enums import UserStatus, VerificationCodeType


# HELPER

def build_query_chain(first=None, all_result=None):
    q = MagicMock()
    for attr in ("filter", "options", "order_by", "offset", "limit"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.delete.return_value = 0
    return q


MOCK_ACCESS_TOKEN = "mock.access.token"
MOCK_REFRESH_TOKEN = "mock.refresh.token"
MOCK_NEW_REFRESH_TOKEN = "mock.new.refresh.token"
MOCK_OTP = "123456"
MOCK_TOTP_SECRET = "JBSWY3DPEHPK3PXP"
MOCK_TOTP_URI = "otpauth://totp/test"

# Payload trả về bởi verify_refresh_token


def make_token_payload(user_id: str, exp_ts: int = 9999999999) -> dict:
    return {"user_id": user_id, "type": "refresh_token", "exp": exp_ts}


# REGISTER

class TestRegister:

    def _make_request(self, email="user@example.com"):
        req = MagicMock()
        req.email = email
        req.password = "password123"
        req.full_name = "Test User"
        req.phone_number = "0900000000"
        req.code = "123456"
        return req

    def _setup_query(self, mock_db, verification=None, existing_user=None,
                     customer_role=None, reload_user=None):
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = verification    # VerificationCode query
            elif call_count == 2:
                q.first.return_value = existing_user   # User exists check
            elif call_count == 3:
                q.first.return_value = customer_role   # Role query
            else:
                q.first.return_value = reload_user     # db.refresh reload
            return q

        mock_db.query.side_effect = side_effect

    def test_valid_data_creates_user(
        self, mock_db, mock_verification_valid, mock_customer_role, mock_user
    ):
        """OTP hợp lệ, email chưa tồn tại → tạo user thành công."""
        self._setup_query(
            mock_db,
            verification=mock_verification_valid,
            existing_user=None,
            customer_role=mock_customer_role,
            reload_user=mock_user
        )
        mock_db.refresh.side_effect = lambda obj: None

        with patch("app.services.auth.hash_password", return_value="hashed"):
            result = AuthService.register(mock_db, self._make_request())

        assert result["success"] is True
        mock_db.add.assert_called_once()
        mock_db.delete.assert_called_once_with(mock_verification_valid)
        mock_db.commit.assert_called_once()

    def test_otp_not_found_raises_400(self, mock_db):
        """OTP không tồn tại → raise 400."""
        self._setup_query(mock_db, verification=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.register(mock_db, self._make_request())

        assert exc_info.value.status_code == 400

    def test_otp_expired_raises_400(
        self, mock_db, mock_verification_expired
    ):
        """OTP hết hạn → raise 400."""
        self._setup_query(mock_db, verification=mock_verification_expired)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.register(mock_db, self._make_request())

        assert exc_info.value.status_code == 400

    def test_existing_email_raises_409(
        self, mock_db, mock_verification_valid, mock_user
    ):
        """Email đã tồn tại → raise 409."""
        self._setup_query(
            mock_db,
            verification=mock_verification_valid,
            existing_user=mock_user
        )

        with pytest.raises(HTTPException) as exc_info:
            AuthService.register(mock_db, self._make_request())

        assert exc_info.value.status_code == 409

    def test_customer_role_not_found_raises_500(
        self, mock_db, mock_verification_valid
    ):
        """Role CUSTOMER không tồn tại → raise 500."""
        self._setup_query(
            mock_db,
            verification=mock_verification_valid,
            existing_user=None,
            customer_role=None
        )

        with pytest.raises(HTTPException) as exc_info:
            with patch("app.services.auth.hash_password", return_value="hashed"):
                AuthService.register(mock_db, self._make_request())

        assert exc_info.value.status_code == 500


# SEND OTP

class TestSendOtp:

    def test_register_type_email_not_exists_sends_otp(self, mock_db):
        """REGISTER type, email chưa tồn tại → tạo OTP và gửi email."""
        mock_db.query.return_value = build_query_chain(first=None)
        mock_db.refresh.side_effect = lambda obj: None

        with patch("app.services.auth.generate_otp", return_value=MOCK_OTP), \
                patch("app.services.auth.send_otp_email") as mock_email:
            result = AuthService.send_otp(
                mock_db, "new@example.com", VerificationCodeType.REGISTER
            )

        assert result["success"] is True
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_email.assert_called_once_with("new@example.com", MOCK_OTP)

    def test_register_type_email_exists_raises_409(self, mock_db, mock_user):
        """REGISTER type, email đã tồn tại → raise 409."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.send_otp(
                mock_db, "user@example.com", VerificationCodeType.REGISTER
            )

        assert exc_info.value.status_code == 409

    def test_forgot_password_type_user_exists_sends_otp(
        self, mock_db, mock_user
    ):
        """FORGOT_PASSWORD type, user tồn tại → gửi OTP."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.auth.generate_otp", return_value=MOCK_OTP), \
                patch("app.services.auth.send_otp_email") as mock_email:
            result = AuthService.send_otp(
                mock_db, "user@example.com", VerificationCodeType.FORGOT_PASSWORD
            )

        assert result["success"] is True
        mock_email.assert_called_once()

    def test_forgot_password_type_user_not_exists_raises_404(self, mock_db):
        """FORGOT_PASSWORD type, user không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.send_otp(
                mock_db, "ghost@example.com", VerificationCodeType.FORGOT_PASSWORD
            )

        assert exc_info.value.status_code == 404

    def test_deletes_old_otp_before_creating_new(self, mock_db, mock_user):
        """Xóa OTP cũ trước khi tạo mới — bulk delete được gọi."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.auth.generate_otp", return_value=MOCK_OTP), \
                patch("app.services.auth.send_otp_email"):
            AuthService.send_otp(
                mock_db, "user@example.com", VerificationCodeType.FORGOT_PASSWORD
            )

        # query().filter().delete() được gọi để xóa OTP cũ
        q = mock_db.query.return_value
        q.filter.return_value.delete.assert_called()


# LOGIN

class TestLogin:

    def _make_login_request(self, email="user@example.com",
                            password="password123",
                            totp_code=None, code=None):
        req = MagicMock()
        req.email = email
        req.password = password
        req.totp_code = totp_code
        req.code = code
        # otp_code là bug trong service — MagicMock tự trả về falsy khi không set
        req.otp_code = None
        return req

    def test_valid_credentials_returns_access_token(
        self, mock_db, mock_user, mock_response
    ):
        """Email/pass đúng, không 2FA → trả về access_token."""
        mock_db.query.return_value = build_query_chain(first=mock_user)
        mock_db.refresh.side_effect = lambda obj: None
        mock_user.status = UserStatus.ACTIVE
        mock_user.is_2fa_enabled = False

        with patch("app.services.auth.verify_password", return_value=True), \
            patch("app.services.auth.create_access_token",
                  return_value=MOCK_ACCESS_TOKEN), \
            patch("app.services.auth.create_refresh_token",
                  return_value=MOCK_REFRESH_TOKEN), \
            patch("app.services.auth.verify_refresh_token",
                  return_value=make_token_payload(mock_user.id)):
            result = AuthService.login(
                mock_db, self._make_login_request(), mock_response
            )

        assert result["success"] is True
        assert result["data"]["access_token"] == MOCK_ACCESS_TOKEN
        assert result["data"]["token_type"] == "bearer"

    def test_user_not_found_raises_401(self, mock_db, mock_response):
        """User không tồn tại → raise invalid credentials."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.login(
                mock_db, self._make_login_request(), mock_response
            )

        assert exc_info.value.status_code == 401

    def test_wrong_password_raises_401(self, mock_db, mock_user, mock_response):
        """Sai mật khẩu → raise invalid credentials."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.auth.verify_password", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.login(
                    mock_db, self._make_login_request(), mock_response
                )

        assert exc_info.value.status_code == 401

    def test_inactive_user_raises_403(self, mock_db, mock_user, mock_response):
        """User bị inactive → raise account_inactive."""
        mock_user.status = UserStatus.INACTIVE
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.auth.verify_password", return_value=True):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.login(
                    mock_db, self._make_login_request(), mock_response
                )

        assert exc_info.value.status_code in (400, 403)

    def test_2fa_enabled_no_code_raises_400(
        self, mock_db, mock_user_2fa_enabled, mock_response
    ):
        """2FA bật, không truyền code → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )
        req = self._make_login_request()
        req.totp_code = None
        req.otp_code = None

        with patch("app.services.auth.verify_password", return_value=True):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.login(mock_db, req, mock_response)

        assert exc_info.value.status_code == 400

    def test_2fa_enabled_valid_totp_returns_token(
        self, mock_db, mock_user_2fa_enabled, mock_response
    ):
        """2FA bật, TOTP hợp lệ → login thành công."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )
        mock_db.refresh.side_effect = lambda obj: None

        req = self._make_login_request()
        req.totp_code = "123456"

        with patch("app.services.auth.verify_password", return_value=True), \
            patch("app.services.auth.verify_totp", return_value=True), \
            patch("app.services.auth.create_access_token",
                  return_value=MOCK_ACCESS_TOKEN), \
            patch("app.services.auth.create_refresh_token",
                  return_value=MOCK_REFRESH_TOKEN), \
            patch("app.services.auth.verify_refresh_token",
                  return_value=make_token_payload(mock_user_2fa_enabled.id)):
            result = AuthService.login(mock_db, req, mock_response)

        assert result["success"] is True
        assert result["data"]["access_token"] == MOCK_ACCESS_TOKEN

    def test_2fa_enabled_invalid_totp_raises_400(
        self, mock_db, mock_user_2fa_enabled, mock_response
    ):
        """2FA bật, TOTP sai → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )
        req = self._make_login_request()
        req.totp_code = "000000"

        with patch("app.services.auth.verify_password", return_value=True), \
                patch("app.services.auth.verify_totp", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.login(mock_db, req, mock_response)

        assert exc_info.value.status_code == 400

    def test_login_sets_cookie(
        self, mock_db, mock_user, mock_response
    ):
        """Login thành công → response.set_cookie được gọi."""
        mock_db.query.return_value = build_query_chain(first=mock_user)
        mock_db.refresh.side_effect = lambda obj: None
        mock_user.is_2fa_enabled = False

        with patch("app.services.auth.verify_password", return_value=True), \
            patch("app.services.auth.create_access_token",
                  return_value=MOCK_ACCESS_TOKEN), \
            patch("app.services.auth.create_refresh_token",
                  return_value=MOCK_REFRESH_TOKEN), \
            patch("app.services.auth.verify_refresh_token",
                  return_value=make_token_payload(mock_user.id)):
            AuthService.login(
                mock_db, self._make_login_request(), mock_response)

        mock_response.set_cookie.assert_called_once()


# REFRESH TOKEN

class TestRefreshToken:

    def test_valid_token_returns_new_access_token(
        self, mock_db, mock_user, mock_refresh_token_db, mock_response
    ):
        """Token hợp lệ → trả về access_token mới."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_refresh_token_db
            else:
                q.first.return_value = mock_user
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        # verify_refresh_token gọi 2 lần: verify incoming + get new expiry
        with patch("app.services.auth.verify_refresh_token",
                   side_effect=[
                       make_token_payload(mock_user.id),
                       make_token_payload(mock_user.id)
                   ]), \
            patch("app.services.auth.create_access_token",
                  return_value=MOCK_ACCESS_TOKEN), \
            patch("app.services.auth.create_refresh_token",
                  return_value=MOCK_NEW_REFRESH_TOKEN):
            result = AuthService.refresh_token_handler(
                mock_db, "valid.refresh.token", mock_response
            )

        assert result["success"] is True
        assert result["data"]["access_token"] == MOCK_ACCESS_TOKEN

    def test_invalid_token_raises_401(self, mock_db, mock_response):
        """Token không hợp lệ (JWTError) → raise 401."""
        from jose import JWTError

        with patch("app.services.auth.verify_refresh_token",
                   side_effect=JWTError("invalid")):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.refresh_token_handler(
                    mock_db, "bad.token", mock_response
                )

        assert exc_info.value.status_code == 401

    def test_token_not_in_db_raises_401(
        self, mock_db, mock_user, mock_response
    ):
        """Token không có trong DB → raise 401."""
        mock_db.query.return_value = build_query_chain(first=None)

        with patch("app.services.auth.verify_refresh_token",
                   return_value=make_token_payload(mock_user.id)):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.refresh_token_handler(
                    mock_db, "valid.but.not.in.db", mock_response
                )

        assert exc_info.value.status_code == 401

    def test_expired_token_in_db_raises_401(
        self, mock_db, mock_user, mock_refresh_token_expired, mock_response
    ):
        """Token trong DB nhưng đã hết hạn → xóa token, raise 401."""
        mock_db.query.return_value = build_query_chain(
            first=mock_refresh_token_expired
        )

        with patch("app.services.auth.verify_refresh_token",
                   return_value=make_token_payload(mock_user.id)):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.refresh_token_handler(
                    mock_db, "expired.refresh.token", mock_response
                )

        assert exc_info.value.status_code == 401
        mock_db.delete.assert_called_once_with(mock_refresh_token_expired)
        mock_db.commit.assert_called()

    def test_refresh_sets_new_cookie(
        self, mock_db, mock_user, mock_refresh_token_db, mock_response
    ):
        """Refresh thành công → response.set_cookie gọi với token mới."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_refresh_token_db
            else:
                q.first.return_value = mock_user
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        with patch("app.services.auth.verify_refresh_token",
                   side_effect=[
                       make_token_payload(mock_user.id),
                       make_token_payload(mock_user.id)
                   ]), \
            patch("app.services.auth.create_access_token",
                  return_value=MOCK_ACCESS_TOKEN), \
            patch("app.services.auth.create_refresh_token",
                  return_value=MOCK_NEW_REFRESH_TOKEN):
            AuthService.refresh_token_handler(
                mock_db, "valid.refresh.token", mock_response
            )

        mock_response.set_cookie.assert_called_once()


# LOGOUT

class TestLogout:

    def test_valid_token_logs_out_successfully(
        self, mock_db, mock_refresh_token_db, mock_response
    ):
        """Token tồn tại → xóa token, xóa cookie, success."""
        mock_db.query.return_value = build_query_chain(
            first=mock_refresh_token_db
        )

        result = AuthService.logout(
            mock_db, "valid.refresh.token", mock_response
        )

        assert result["success"] is True
        mock_db.delete.assert_called_once_with(mock_refresh_token_db)
        mock_db.commit.assert_called_once()

    def test_token_not_in_db_raises_401(self, mock_db, mock_response):
        """Token không có trong DB → raise 401."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.logout(mock_db, "unknown.token", mock_response)

        assert exc_info.value.status_code == 401

    def test_logout_clears_cookie(
        self, mock_db, mock_refresh_token_db, mock_response
    ):
        """Logout thành công → response.delete_cookie được gọi."""
        mock_db.query.return_value = build_query_chain(
            first=mock_refresh_token_db
        )

        AuthService.logout(mock_db, "valid.refresh.token", mock_response)

        mock_response.delete_cookie.assert_called_once()


# FORGOT PASSWORD

class TestForgotPassword:

    def _setup_query(self, mock_db, verification=None, user=None):
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = verification
            else:
                q.first.return_value = user
            return q

        mock_db.query.side_effect = side_effect

    def test_valid_otp_resets_password(
        self, mock_db, mock_verification_valid, mock_user
    ):
        """OTP hợp lệ → password được cập nhật, verification bị xóa."""
        self._setup_query(
            mock_db,
            verification=mock_verification_valid,
            user=mock_user
        )

        with patch("app.services.auth.hash_password",
                   return_value="new_hashed"):
            result = AuthService.forgot_password(
                mock_db,
                email="user@example.com",
                code="123456",
                new_password="newpassword123"
            )

        assert result["success"] is True
        assert mock_user.password == "new_hashed"
        mock_db.delete.assert_called_once_with(mock_verification_valid)
        mock_db.commit.assert_called_once()

    def test_otp_not_found_raises_400(self, mock_db):
        """OTP không tồn tại → raise 400."""
        self._setup_query(mock_db, verification=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.forgot_password(
                mock_db, "user@example.com", "000000", "newpass"
            )

        assert exc_info.value.status_code == 400

    def test_otp_expired_raises_400(
        self, mock_db, mock_verification_expired
    ):
        """OTP hết hạn → raise 400."""
        self._setup_query(mock_db, verification=mock_verification_expired)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.forgot_password(
                mock_db, "user@example.com", "123456", "newpass"
            )

        assert exc_info.value.status_code == 400

    def test_user_not_found_raises_404(
        self, mock_db, mock_verification_valid
    ):
        """OTP hợp lệ nhưng user không tồn tại → raise 404."""
        self._setup_query(
            mock_db,
            verification=mock_verification_valid,
            user=None
        )

        with pytest.raises(HTTPException) as exc_info:
            AuthService.forgot_password(
                mock_db, "ghost@example.com", "123456", "newpass"
            )

        assert exc_info.value.status_code == 404


# SETUP 2FA

class TestSetup2FA:

    def test_user_not_enabled_returns_secret_and_uri(
        self, mock_db, mock_user
    ):
        """2FA chưa bật → trả về secret và uri."""
        mock_user.is_2fa_enabled = False
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.auth.generate_totp_secret",
                   return_value=(MOCK_TOTP_SECRET, MOCK_TOTP_URI)):
            result = AuthService.setup_2fa(mock_db, mock_user.id)

        assert result["success"] is True
        assert result["data"]["secret"] == MOCK_TOTP_SECRET
        assert result["data"]["uri"] == MOCK_TOTP_URI
        assert mock_user.pending_totp_secret == MOCK_TOTP_SECRET
        mock_db.commit.assert_called_once()

    def test_user_not_found_raises_404(self, mock_db):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.setup_2fa(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404

    def test_already_enabled_raises_400(
        self, mock_db, mock_user_2fa_enabled
    ):
        """2FA đã bật → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )

        with pytest.raises(HTTPException) as exc_info:
            AuthService.setup_2fa(mock_db, mock_user_2fa_enabled.id)

        assert exc_info.value.status_code == 400
        assert "already enabled" in exc_info.value.detail["message"]


# ENABLE 2FA

class TestEnable2FA:

    def test_valid_totp_enables_2fa(
        self, mock_db, mock_user_pending_2fa
    ):
        """pending_totp_secret có giá trị, TOTP hợp lệ → bật 2FA."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_pending_2fa
        )

        with patch("app.services.auth.verify_totp", return_value=True):
            result = AuthService.enable_2fa(
                mock_db, mock_user_pending_2fa.id, totp_code="123456"
            )

        assert result["success"] is True
        assert mock_user_pending_2fa.is_2fa_enabled is True
        assert mock_user_pending_2fa.totp_secret == MOCK_TOTP_SECRET
        assert mock_user_pending_2fa.pending_totp_secret is None
        mock_db.commit.assert_called_once()

    def test_no_pending_secret_raises_400(self, mock_db, mock_user):
        """pending_totp_secret là None → raise 400."""
        mock_user.pending_totp_secret = None
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.enable_2fa(mock_db, mock_user.id, totp_code="123456")

        assert exc_info.value.status_code == 400
        assert "not initiated" in exc_info.value.detail["message"]

    def test_invalid_totp_raises_400(
        self, mock_db, mock_user_pending_2fa
    ):
        """TOTP sai → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_pending_2fa
        )

        with patch("app.services.auth.verify_totp", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.enable_2fa(
                    mock_db, mock_user_pending_2fa.id, totp_code="000000"
                )

        assert exc_info.value.status_code == 400
        assert "Invalid TOTP" in exc_info.value.detail["message"]


# DISABLE 2FA

class TestDisable2FA:

    def test_disable_via_totp_success(
        self, mock_db, mock_user_2fa_enabled
    ):
        """2FA đang bật, TOTP hợp lệ → tắt 2FA."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )

        with patch("app.services.auth.verify_totp", return_value=True):
            result = AuthService.disable_2fa(
                mock_db,
                user_id=mock_user_2fa_enabled.id,
                totp_code="123456"
            )

        assert result["success"] is True
        assert mock_user_2fa_enabled.is_2fa_enabled is False
        assert mock_user_2fa_enabled.totp_secret is None
        mock_db.commit.assert_called_once()

    def test_disable_via_otp_success(
        self, mock_db, mock_user_2fa_enabled, mock_verification_valid
    ):
        """2FA đang bật, OTP hợp lệ → tắt 2FA."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_user_2fa_enabled
            else:
                q.first.return_value = mock_verification_valid
            return q

        mock_db.query.side_effect = side_effect

        result = AuthService.disable_2fa(
            mock_db,
            user_id=mock_user_2fa_enabled.id,
            otp_code="123456"
        )

        assert result["success"] is True
        assert mock_user_2fa_enabled.is_2fa_enabled is False
        mock_db.delete.assert_called_once_with(mock_verification_valid)

    def test_2fa_not_enabled_raises_400(self, mock_db, mock_user):
        """2FA chưa bật → raise 400."""
        mock_user.is_2fa_enabled = False
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.disable_2fa(
                mock_db, user_id=mock_user.id, totp_code="123456"
            )

        assert exc_info.value.status_code == 400
        assert "not enabled" in exc_info.value.detail["message"]

    def test_no_code_provided_raises_400(
        self, mock_db, mock_user_2fa_enabled
    ):
        """Không truyền totp_code lẫn otp_code → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )

        with pytest.raises(HTTPException) as exc_info:
            AuthService.disable_2fa(
                mock_db,
                user_id=mock_user_2fa_enabled.id,
                totp_code=None,
                otp_code=None
            )

        assert exc_info.value.status_code == 400

    def test_invalid_totp_raises_400(
        self, mock_db, mock_user_2fa_enabled
    ):
        """TOTP sai → raise 400."""
        mock_db.query.return_value = build_query_chain(
            first=mock_user_2fa_enabled
        )

        with patch("app.services.auth.verify_totp", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                AuthService.disable_2fa(
                    mock_db,
                    user_id=mock_user_2fa_enabled.id,
                    totp_code="000000"
                )

        assert exc_info.value.status_code == 400

    def test_user_not_found_raises_404(self, mock_db):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AuthService.disable_2fa(
                mock_db, user_id="ghost-id", totp_code="123456"
            )

        assert exc_info.value.status_code == 404
