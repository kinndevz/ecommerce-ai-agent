import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.orders import router
from app.utils.deps import get_current_user, require_permission
from app.db.database import get_db
from app.core.enums import OrderStatus, PaymentStatus, PaymentMethod


#  IDs

@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def order_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def cart_id() -> str:
    return str(uuid.uuid4())


#  Product & Variant mock

@pytest.fixture
def mock_image():
    img = MagicMock()
    img.image_url = "https://example.com/img.jpg"
    img.is_primary = True
    return img


@pytest.fixture
def mock_product(mock_image):
    p = MagicMock()
    p.id = str(uuid.uuid4())
    p.name = "Test Product"
    p.slug = "test-product"
    p.stock_quantity = 10
    p.images = [mock_image]
    return p


@pytest.fixture
def mock_variant(mock_product):
    v = MagicMock()
    v.id = str(uuid.uuid4())
    v.product_id = mock_product.id
    v.name = "Size M"
    v.stock_quantity = 5
    return v


#  CartItem & Cart mock

@pytest.fixture
def mock_cart_item(mock_product):
    item = MagicMock()
    item.id = str(uuid.uuid4())
    item.product_id = mock_product.id
    item.product_slug = "test-product"
    item.variant_id = None
    item.variant = None
    item.product = mock_product
    item.quantity = 2
    item.price = Decimal("100000.00")
    return item


@pytest.fixture
def mock_cart(cart_id, user_id, mock_cart_item):
    cart = MagicMock()
    cart.id = cart_id
    cart.user_id = user_id
    cart.items = [mock_cart_item]
    return cart


@pytest.fixture
def mock_empty_cart(cart_id, user_id):
    cart = MagicMock()
    cart.id = cart_id
    cart.user_id = user_id
    cart.items = []
    return cart


#  OrderItem mock

@pytest.fixture
def mock_order_item(mock_product):
    item = MagicMock()
    item.id = str(uuid.uuid4())
    item.product_id = mock_product.id
    item.product_slug = "test-product"
    item.variant_id = None
    item.variant = None
    item.product = mock_product
    item.product_name = "Test Product"
    item.variant_name = None
    item.quantity = 2
    item.unit_price = Decimal("100000.00")
    item.subtotal = Decimal("200000.00")
    return item


#  Order mock

@pytest.fixture
def mock_order(order_id, user_id, mock_order_item):
    order = MagicMock()
    order.id = order_id
    order.user_id = user_id
    order.order_number = "ORD-20240101-00001"
    order.status = OrderStatus.PENDING.value
    order.payment_status = PaymentStatus.UNPAID.value
    order.payment_method = PaymentMethod.COD.value
    order.subtotal = Decimal("200000.00")
    order.discount = Decimal("0.00")
    order.shipping_fee = Decimal("30000.00")
    order.total = Decimal("230000.00")
    order.shipping_address = {
        "name": "Test User",
        "phone": "0900000000",
        "address": "123 Test St",
        "city": "HCM"
    }
    order.notes = None
    order.items = [mock_order_item]
    order.created_at = datetime.now(timezone.utc)
    order.updated_at = datetime.now(timezone.utc)
    return order


@pytest.fixture
def mock_order_processing(mock_order):
    mock_order.status = OrderStatus.PROCESSING.value
    return mock_order


@pytest.fixture
def mock_order_shipped(mock_order):
    mock_order.status = OrderStatus.SHIPPED.value
    return mock_order


#  User mock

@pytest.fixture
def mock_current_user(user_id):
    user = MagicMock()
    user.id = user_id
    user.email = "user@example.com"
    user.full_name = "Test User"
    return user


@pytest.fixture
def mock_admin_user():
    user = MagicMock()
    user.id = str(uuid.uuid4())
    user.email = "admin@example.com"
    user.full_name = "Admin User"
    role = MagicMock()
    role.name = "ADMIN"
    role.is_active = True
    role.deleted_at = None
    role.permissions = []
    user.role = role
    user.role_id = role.id
    user.deleted_at = None
    user.status = "ACTIVE"
    return user


#  TestClients

@pytest.fixture
def client(mock_current_user):
    """Customer client — override get_current_user."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def admin_client(mock_admin_user):
    """Admin client — require_permission() là factory nên override get_current_user bên trong nó."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)


@pytest.fixture
def public_client():
    """Không override auth → 401."""
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return TestClient(app)
