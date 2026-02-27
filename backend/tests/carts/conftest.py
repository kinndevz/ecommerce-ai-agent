import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes.carts import router
from app.utils.deps import get_current_user
from app.db.database import get_db


#  IDs

@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def cart_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def item_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def product_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def variant_id() -> str:
    return str(uuid.uuid4())


#  Product image mock

@pytest.fixture
def mock_image():
    img = MagicMock()
    img.image_url = "https://example.com/image.jpg"
    img.is_primary = True
    return img


#  Product mock

@pytest.fixture
def mock_product(product_id, mock_image):
    p = MagicMock()
    p.id = product_id
    p.name = "Test Product"
    p.slug = "test-product"
    p.price = Decimal("100.00")
    p.sale_price = None
    p.stock_quantity = 10
    p.is_available = True
    p.deleted_at = None
    p.images = [mock_image]  # BẮT BUỘC cho _format_cart
    return p


#  Variant mock

@pytest.fixture
def mock_variant(variant_id, product_id):
    v = MagicMock()
    v.id = variant_id
    v.product_id = product_id
    v.name = "Size M"
    v.price = Decimal("100.00")
    v.sale_price = None
    v.stock_quantity = 5
    v.deleted_at = None
    return v


#  CartItem mock

@pytest.fixture
def mock_cart_item(item_id, product_id, mock_product, cart_id):
    """CartItem không có variant."""
    item = MagicMock()
    item.id = item_id
    item.cart_id = cart_id
    item.product_id = product_id
    item.variant_id = None
    item.quantity = 2
    item.price = Decimal("100.00")
    item.product = mock_product
    item.variant = None
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)
    return item


@pytest.fixture
def mock_cart_item_with_variant(item_id, product_id, variant_id,
                                mock_product, mock_variant, cart_id):
    """CartItem có variant."""
    item = MagicMock()
    item.id = item_id
    item.cart_id = cart_id
    item.product_id = product_id
    item.variant_id = variant_id
    item.quantity = 1
    item.price = Decimal("100.00")
    item.product = mock_product
    item.variant = mock_variant
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)
    return item


#  Cart mock

@pytest.fixture
def mock_cart(cart_id, user_id, mock_cart_item):
    cart = MagicMock()
    cart.id = cart_id
    cart.user_id = user_id
    cart.items = [mock_cart_item]
    cart.created_at = datetime.now(timezone.utc)
    cart.updated_at = datetime.now(timezone.utc)
    return cart


@pytest.fixture
def mock_empty_cart(cart_id, user_id):
    cart = MagicMock()
    cart.id = cart_id
    cart.user_id = user_id
    cart.items = []
    cart.created_at = datetime.now(timezone.utc)
    cart.updated_at = datetime.now(timezone.utc)
    return cart


#  Auth user — không cần role

@pytest.fixture
def mock_current_user(user_id):
    user = MagicMock()
    user.id = user_id
    user.email = "user@example.com"
    return user


#  TestClient

@pytest.fixture
def client(mock_current_user):
    """Override get_current_user — không cần role."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """Không override auth → 401."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
