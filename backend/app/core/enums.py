from enum import Enum


# NOTIFICATION ENUMS
class NotificationType(str, Enum):
    """Notification types"""
    ORDER_CREATED = "ORDER_CREATED"
    ORDER_CONFIRMED = "ORDER_CONFIRMED"
    ORDER_SHIPPED = "ORDER_SHIPPED"
    ORDER_DELIVERED = "ORDER_DELIVERED"
    ORDER_CANCELLED = "ORDER_CANCELLED"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    REVIEW_RECEIVED = "REVIEW_RECEIVED"
    PROMOTION = "PROMOTION"
    SYSTEM = "SYSTEM"


# ORDER ENUMS
class OrderStatus(str, Enum):
    """Order status values"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

    @classmethod
    def values(cls):
        """Get all valid status values"""
        return [status.value for status in cls]

    @classmethod
    def get_flow_description(cls):
        """Get status flow description"""
        return "pending → processing → shipped → delivered (or cancelled)"


class PaymentStatus(str, Enum):
    """Payment status values"""
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"

    @classmethod
    def values(cls):
        """Get all valid payment status values"""
        return [status.value for status in cls]


class PaymentMethod(str, Enum):
    """Payment method values"""
    COD = "cod"  # Cash on delivery
    BANK_TRANSFER = "bank_transfer"
    VNPAY = "vnpay"
    MOMO = "momo"
    CREDIT_CARD = "credit_card"

    @classmethod
    def values(cls):
        """Get all valid payment method values"""
        return [method.value for method in cls]

    @classmethod
    def get_display_name(cls, method: str):
        """Get human-readable payment method name"""
        display_names = {
            cls.COD.value: "Cash on Delivery",
            cls.BANK_TRANSFER.value: "Bank Transfer",
            cls.VNPAY.value: "VNPay",
            cls.MOMO.value: "Momo Wallet",
            cls.CREDIT_CARD.value: "Credit Card"
        }
        return display_names.get(method, method)


# PRODUCT ENUMS
class SkinType(str, Enum):
    """Skin type values"""
    OILY = "oily"
    DRY = "dry"
    COMBINATION = "combination"
    SENSITIVE = "sensitive"
    NORMAL = "normal"

    @classmethod
    def values(cls):
        """Get all valid skin type values"""
        return [skin_type.value for skin_type in cls]


class SkinConcern(str, Enum):
    """Common skin concerns"""
    ACNE = "acne"
    WRINKLES = "wrinkles"
    DARK_SPOTS = "dark_spots"
    DRYNESS = "dryness"
    DEHYDRATION = "dehydration"
    IRRITATION = "irritation"
    PORES = "pores"
    SEBUM_CONTROL = "sebum_control"
    AGING = "aging"
    UNEVEN_TONE = "uneven_tone"
    SUN_PROTECTION = "sun_protection"

    @classmethod
    def values(cls):
        """Get all valid concern values"""
        return [concern.value for concern in cls]
