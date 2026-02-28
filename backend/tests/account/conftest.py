import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.account import router
from app.utils.deps import get_current_active_user
from app.db.database import get_db


#  IDs

@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def preference_id() -> str:
    return str(uuid.uuid4())


#  Role mock

@pytest.fixture
def mock_role():
    role = MagicMock()
    role.id = str(uuid.uuid4())
    role.name = "CUSTOMER"
    role.description = "Customer role"
    role.is_active = True
    role.permissions = []
    return role


#  User mock

@pytest.fixture
def mock_user(user_id, mock_role):
    user = MagicMock()
    user.id = user_id
    user.email = "user@example.com"
    user.full_name = "Test User"
    user.phone_number = "0900000000"
    user.avatar = None
    user.status = "ACTIVE"
    user.is_2fa_enabled = False
    user.password = "hashed_old_password"
    user.role_id = mock_role.id
    user.role = mock_role
    user.deleted_at = None
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


#  UserPreference mock

@pytest.fixture
def mock_preference(preference_id, user_id):
    pref = MagicMock()
    pref.id = preference_id
    pref.user_id = user_id
    pref.skin_type = "da dầu"
    pref.skin_concerns = ["mụn", "lỗ chân lông to"]
    pref.favorite_brands = ["The Ordinary"]
    pref.price_range_min = 100000.0
    pref.price_range_max = 500000.0
    pref.preferred_categories = ["Cleanser"]
    pref.allergies = []
    return pref


#  Auth user

@pytest.fixture
def mock_current_user(mock_user):
    return mock_user


#  TestClient

@pytest.fixture
def client(mock_current_user):
    """Tất cả endpoints PROTECTED → override get_current_active_user."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """Không override auth → 401."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
