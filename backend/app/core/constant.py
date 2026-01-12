from enum import Enum
from decimal import Decimal


class UserRole:
    """User role constants"""
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"
    SELLER = "SELLER"


# ORDER CONSTANTS
class OrderConstants:
    """Order-related constants"""

    # Shipping
    DEFAULT_SHIPPING_FEE = Decimal('30000.00')  # 30,000 VND
    FREE_SHIPPING_THRESHOLD = Decimal('500000.00')  # Free shipping > 500k VND

    # Order number format
    ORDER_NUMBER_PREFIX = "ORD"
    ORDER_NUMBER_FORMAT = "{prefix}-{date}-{sequence:05d}"

    # Limits
    MAX_ITEMS_PER_ORDER = 100
    MAX_QUANTITY_PER_ITEM = 999

    # Cancellable statuses
    CANCELLABLE_STATUSES = ["pending", "processing"]


class PaymentConstants:
    """Payment-related constants"""

    # VNPay
    VNPAY_TIMEOUT = 900  # 15 minutes
    VNPAY_VERSION = "2.1.0"

    # Momo
    MOMO_TIMEOUT = 300  # 5 minutes

    # COD
    COD_FEE = Decimal('0.00')  # No fee for COD


# CART CONSTANTS
class CartConstants:
    """Cart-related constants"""

    MAX_ITEMS_PER_CART = 50
    MAX_QUANTITY_PER_ITEM = 99
    CART_EXPIRY_DAYS = 30  # Auto-clear after 30 days


# PRODUCT CONSTANTS
class ProductConstants:
    """Product-related constants"""

    LOW_STOCK_THRESHOLD = 10
    OUT_OF_STOCK = 0
    MAX_IMAGES_PER_PRODUCT = 10
    MAX_VARIANTS_PER_PRODUCT = 50

    # Rating
    MIN_RATING = 1
    MAX_RATING = 5

    # Price
    MIN_PRICE = Decimal('0.01')
    MAX_PRICE = Decimal('999999999.99')
