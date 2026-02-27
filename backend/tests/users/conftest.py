
import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.users import router
from app.utils.deps import get_current_active_user, get_current_user
from app.db.database import get_db


# Mock objects

@pytest.fixture
def mock_role(role_id):
    role = MagicMock()
    role.id = role_id
    role.name = "ADMIN"
    role.description = "Administrator"
    role.is_active = True
    role.deleted_at = None
    role.permissions = []
    return role


@pytest.fixture
def mock_user(user_id, mock_role):
    """User thông thường, status ACTIVE."""
    user = MagicMock()
    user.id = user_id
    user.email = "user@example.com"
    user.full_name = "Test User"
    user.phone_number = "0901234567"
    user.avatar = None
    user.password = "$argon2id$hashed"
    user.status = "ACTIVE"
    user.is_2fa_enabled = False
    user.role_id = mock_role.id
    user.role = mock_role
    user.deleted_at = None
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    user.created_by_id = None
    user.updated_by_id = None
    return user


@pytest.fixture
def mock_admin_user(admin_id, mock_role):
    """User đóng vai admin - dùng làm current_user trong API tests."""
    user = MagicMock()
    user.id = admin_id
    user.email = "admin@example.com"
    user.full_name = "Admin User"
    user.status = "ACTIVE"
    user.role_id = mock_role.id
    user.role = mock_role
    user.deleted_at = None
    return user


#  TestClient helpers

@pytest.fixture
def mock_current_user(mock_admin_user):
    return mock_admin_user


@pytest.fixture
def client(mock_current_user):
    app = FastAPI()
    app.include_router(router)

    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    return TestClient(app)
