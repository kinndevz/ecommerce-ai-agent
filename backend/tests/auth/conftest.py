import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.auth import router
from app.utils.deps import get_current_active_user
from app.db.database import get_db


#  IDs

@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def token_id() -> str:
    return str(uuid.uuid4())


#  User mocks

@pytest.fixture
def mock_user(user_id):
    """User bình thường — không có 2FA."""
    user = MagicMock()
    user.id = user_id
    user.email = "user@example.com"
    user.full_name = "Test User"
    user.phone_number = "0900000000"
    user.password = "hashed_password"
    user.status = "ACTIVE"
    user.role_id = str(uuid.uuid4())
    user.is_2fa_enabled = False
    user.totp_secret = None
    user.pending_totp_secret = None
    user.deleted_at = None
    return user


@pytest.fixture
def mock_user_2fa_enabled(user_id):
    """User đã bật 2FA."""
    user = MagicMock()
    user.id = user_id
    user.email = "user2fa@example.com"
    user.full_name = "2FA User"
    user.password = "hashed_password"
    user.status = "ACTIVE"
    user.role_id = str(uuid.uuid4())
    user.is_2fa_enabled = True
    user.totp_secret = "JBSWY3DPEHPK3PXP"
    user.pending_totp_secret = None
    user.deleted_at = None
    return user


@pytest.fixture
def mock_user_pending_2fa(user_id):
    """User đã setup 2FA nhưng chưa enable (pending_totp_secret có giá trị)."""
    user = MagicMock()
    user.id = user_id
    user.email = "pending@example.com"
    user.full_name = "Pending 2FA User"
    user.password = "hashed_password"
    user.status = "ACTIVE"
    user.role_id = str(uuid.uuid4())
    user.is_2fa_enabled = False
    user.totp_secret = None
    user.pending_totp_secret = "JBSWY3DPEHPK3PXP"
    user.deleted_at = None
    return user


#  Role mock

@pytest.fixture
def mock_customer_role():
    role = MagicMock()
    role.id = str(uuid.uuid4())
    role.name = "CUSTOMER"
    return role


#  VerificationCode mock

@pytest.fixture
def mock_verification_valid():
    """OTP hợp lệ — expires_at trong tương lai, NAIVE datetime."""
    v = MagicMock()
    v.id = str(uuid.uuid4())
    v.email = "user@example.com"
    v.code = "123456"
    # QUAN TRỌNG: naive datetime vì service gọi .replace(tzinfo=timezone.utc)
    v.expires_at = datetime(2099, 1, 1, 0, 0, 0)
    return v


@pytest.fixture
def mock_verification_expired():
    """OTP hết hạn — expires_at trong quá khứ."""
    v = MagicMock()
    v.id = str(uuid.uuid4())
    v.email = "user@example.com"
    v.code = "123456"
    v.expires_at = datetime(2000, 1, 1, 0, 0, 0)
    return v


#  RefreshToken mock

@pytest.fixture
def mock_refresh_token_db(token_id, user_id):
    """RefreshToken DB record — còn hạn."""
    rt = MagicMock()
    rt.id = token_id
    rt.token = "valid.refresh.token"
    rt.user_id = user_id
    # naive datetime
    rt.expires_at = datetime(2099, 1, 1, 0, 0, 0)
    return rt


@pytest.fixture
def mock_refresh_token_expired(token_id, user_id):
    """RefreshToken DB record — đã hết hạn."""
    rt = MagicMock()
    rt.id = token_id
    rt.token = "expired.refresh.token"
    rt.user_id = user_id
    rt.expires_at = datetime(2000, 1, 1, 0, 0, 0)
    return rt


#  Response mock

@pytest.fixture
def mock_response():
    """Mock FastAPI Response để test set_cookie / delete_cookie."""
    return MagicMock()


#  Auth user (2FA endpoints)

@pytest.fixture
def mock_current_user(mock_user):
    return mock_user


#  TestClient

@pytest.fixture
def client(mock_current_user):
    """Client có auth — dùng cho 2FA endpoints."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """Client không auth — dùng cho register/otp/login/refresh/logout/forgot-password."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
