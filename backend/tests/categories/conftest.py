import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.categories import router
from app.utils.deps import get_current_active_user, get_current_user
from app.db.database import get_db


#  Category mocks

@pytest.fixture
def category_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def parent_category_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def mock_category(category_id):
    """Root category (không có parent)."""
    cat = MagicMock()
    cat.id = category_id
    cat.name = "Skincare"
    cat.slug = "skincare"
    cat.description = "Skincare products"
    cat.parent_id = None
    cat.image_url = None
    cat.display_order = 0
    cat.is_active = True
    cat.deleted_at = None
    cat.created_at = datetime.now(timezone.utc)
    cat.updated_at = datetime.now(timezone.utc)
    cat.created_by_id = None
    cat.updated_by_id = None
    return cat


@pytest.fixture
def mock_child_category(parent_category_id):
    """Child category (có parent)."""
    cat = MagicMock()
    cat.id = str(uuid.uuid4())
    cat.name = "Cleanser"
    cat.slug = "cleanser"
    cat.description = "Face cleansers"
    cat.parent_id = parent_category_id
    cat.image_url = None
    cat.display_order = 1
    cat.is_active = True
    cat.deleted_at = None
    cat.created_at = datetime.now(timezone.utc)
    cat.updated_at = datetime.now(timezone.utc)
    return cat


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
    """TestClient với auth bypass cho protected endpoints."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """TestClient không có auth — dùng cho public endpoints."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
