import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.role import router
from app.utils.deps import get_current_active_user, get_current_user
from app.db.database import get_db
from app.core.enums import HTTPMethod


#  IDs

@pytest.fixture
def permission_id() -> str:
    return str(uuid.uuid4())


#  Role mock

@pytest.fixture
def mock_role(role_id):
    role = MagicMock()
    role.id = role_id
    role.name = "ADMIN"
    role.description = "Administrator"
    role.is_active = True
    role.deleted_at = None
    role.permissions = []
    role.created_at = datetime.now(timezone.utc)
    role.updated_at = datetime.now(timezone.utc)
    role.created_by_id = None
    role.updated_by_id = None
    return role


@pytest.fixture
def mock_custom_role():
    """Non-system role — có thể update/delete tự do."""
    role = MagicMock()
    role.id = str(uuid.uuid4())
    role.name = "MANAGER"
    role.description = "Store manager"
    role.is_active = True
    role.deleted_at = None
    role.permissions = []
    role.created_at = datetime.now(timezone.utc)
    role.updated_at = datetime.now(timezone.utc)
    return role


#  Permission mock

@pytest.fixture
def mock_permission(permission_id):
    perm = MagicMock()
    perm.id = permission_id
    perm.name = "Get Users"
    perm.description = "Permission to list users"
    perm.path = "/api/v1/users"
    perm.method = HTTPMethod.GET
    perm.module = "Users"
    perm.deleted_at = None
    perm.created_at = datetime.now(timezone.utc)
    perm.updated_at = datetime.now(timezone.utc)
    perm.created_by_id = None
    perm.updated_by_id = None
    return perm


# ── Auth user

@pytest.fixture
def mock_admin_user(admin_id, mock_role):
    user = MagicMock()
    user.id = admin_id
    user.email = "admin@example.com"
    user.full_name = "Admin User"
    user.status = "ACTIVE"
    user.role_id = mock_role.id
    user.role = mock_role
    user.deleted_at = None
    return user


@pytest.fixture
def mock_current_user(mock_admin_user):
    return mock_admin_user


#  TestClient

@pytest.fixture
def client(mock_current_user):
    """Tất cả endpoints đều PROTECTED → dùng fixture này."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """Client không auth — chỉ dùng để verify 401."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
