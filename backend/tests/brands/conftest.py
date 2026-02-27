import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.brands import router
from app.utils.deps import get_current_active_user, get_current_user
from app.db.database import get_db


#  Brand mock

@pytest.fixture
def brand_id() -> str:
    import uuid
    return str(uuid.uuid4())


@pytest.fixture
def mock_brand(brand_id):
    brand = MagicMock()
    brand.id = brand_id
    brand.name = "CeraVe"
    brand.slug = "cerave"
    brand.description = "Dermatologist developed skincare"
    brand.country = "USA"
    brand.website_url = "https://cerave.com"
    brand.logo_url = "https://cerave.com/logo.png"
    brand.is_active = True
    brand.deleted_at = None
    brand.created_at = datetime.now(timezone.utc)
    brand.updated_at = datetime.now(timezone.utc)
    brand.created_by_id = None
    brand.updated_by_id = None
    return brand


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
    """
    TestClient với auth bypass cho protected endpoints.
    Public endpoints (GET /brands, GET /brands/{id}) không cần override.
    """
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """TestClient không có auth - dùng để test public endpoints."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
