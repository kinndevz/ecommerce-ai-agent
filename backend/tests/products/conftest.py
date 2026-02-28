import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.products import router
from app.utils.deps import get_current_user
from app.db.database import get_db


#  IDs

@pytest.fixture
def product_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def variant_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def image_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def tag_id() -> str:
    return str(uuid.uuid4())


#  Brand / Category

@pytest.fixture
def mock_brand():
    b = MagicMock()
    b.id = str(uuid.uuid4())
    b.name = "The Ordinary"
    b.slug = "the-ordinary"
    b.deleted_at = None
    return b


@pytest.fixture
def mock_category():
    c = MagicMock()
    c.id = str(uuid.uuid4())
    c.name = "Serum"
    c.slug = "serum"
    c.deleted_at = None
    return c


#  Tag

@pytest.fixture
def mock_tag(tag_id):
    t = MagicMock()
    t.id = tag_id
    t.name = "Vegan"
    t.slug = "vegan"
    t.usage_count = 5
    return t


#  ProductImage

@pytest.fixture
def mock_image(product_id, image_id):
    img = MagicMock()
    img.id = image_id
    img.product_id = product_id
    img.image_url = "https://example.com/img.jpg"
    img.alt_text = "Product Image"
    img.is_primary = True
    img.display_order = 0
    img.updated_at = datetime.now(timezone.utc)
    return img


#  ProductVariant

@pytest.fixture
def mock_variant(product_id, variant_id):
    v = MagicMock()
    v.id = variant_id
    v.product_id = product_id
    v.name = "50ml"
    v.sku = "SKU-VAR-001"
    v.price = Decimal("150000.00")
    v.sale_price = None
    v.stock_quantity = 10
    v.is_available = True
    v.size = "50"
    v.size_unit = "ml"
    v.color = None
    v.shade_name = None
    v.deleted_at = None
    return v


#  Product

@pytest.fixture
def mock_product(product_id, mock_brand, mock_category, mock_image, mock_variant, mock_tag):
    p = MagicMock()
    p.id = product_id
    p.brand_id = mock_brand.id
    p.category_id = mock_category.id
    p.name = "Niacinamide 10%"
    p.slug = "niacinamide-10"
    p.sku = "SKU-001"
    p.short_description = "Reduces pores"
    p.description = "Full description"
    p.how_to_use = "Apply to face"
    p.price = Decimal("200000.00")
    p.sale_price = None
    p.stock_quantity = 50
    p.is_available = True
    p.is_featured = False
    p.rating_average = Decimal("4.5")
    p.review_count = 10
    p.views_count = 100
    p.skin_types = ["da_dau"]
    p.concerns = ["mun"]
    p.benefits = ["kiem_dau"]
    p.ingredients = {"key_ingredients": ["Niacinamide"]}
    p.brand = mock_brand
    p.category = mock_category
    p.images = [mock_image]
    p.variants = [mock_variant]
    p.tags = [mock_tag]
    p.deleted_at = None
    p.created_at = datetime.now(timezone.utc)
    p.updated_at = datetime.now(timezone.utc)
    return p


#  User

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


#  Clients

@pytest.fixture
def public_client():
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def admin_client(mock_admin_user):
    """require_permission() là factory → override get_current_user."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
