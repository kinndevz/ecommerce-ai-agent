from enum import Enum


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class HTTPMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


class VerificationCodeType(str, Enum):
    REGISTER = "REGISTER"
    FORGOT_PASSWORD = "FORGOT_PASSWORD"
    LOGIN = "LOGIN"
    DISABLE_2FA = "DISABLE_2FA"


class RateLimitTier(str, Enum):
    STRICT = "strict"
    MODERATE = "moderate"
    RELAXED = "relaxed"
    UNRESTRICTED = "unrestricted"


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
    OILY = "da dầu"
    DRY = "da khô"
    COMBINATION = "da hỗn hợp"
    SENSITIVE = "da nhạy cảm"
    NORMAL = "da thường"

    @classmethod
    def values(cls):
        """Get all valid skin type values"""
        return [skin_type.value for skin_type in cls]


class SkinConcern(str, Enum):
    """Common skin concerns"""
    ACNE = "mụn"
    BLACKHEADS = "mụn đầu đen"
    PORES = "lỗ chân lông to"
    SEBUM_CONTROL = "đổ dầu nhiều"
    WRINKLES = "nếp nhăn"
    AGING = "lão hóa"
    DARK_SPOTS = "thâm nám"
    UNEVEN_TONE = "da không đều màu"
    DULLNESS = "da xỉn màu"
    DRYNESS = "khô da"
    DEHYDRATION = "mất nước"
    IRRITATION = "kích ứng"
    REDNESS = "mẩn đỏ"
    BARRIER_REPAIR = "tổn thương màng bảo vệ"
    EYE_CARE = "quầng thâm mắt"
    SUN_PROTECTION = "chống nắng"

    @classmethod
    def values(cls):
        """Get all valid concern values"""
        return [concern.value for concern in cls]


class ProductBenefit(str, Enum):
    """Product benefits"""

    MOISTURIZING = "dưỡng ẩm"
    HYDRATING = "cấp nước"
    NOURISHING = "nuôi dưỡng sâu"
    BRIGHTENING = "dưỡng trắng"
    ANTI_AGING = "chống lão hóa"
    ANTI_ACNE = "trị mụn"
    EXFOLIATING = "tẩy tế bào chết"
    FIRMING = "săn chắc da"
    PORE_MINIMIZING = "thu nhỏ lỗ chân lông"
    OIL_CONTROL = "kiềm dầu"
    UNEVEN_TEXTURE = "cải thiện bề mặt da"
    SOOTHING = "làm dịu da"
    PROTECTIVE = "bảo vệ da"
    RECOVERY = "phục hồi da"
    TONE_UP = "nâng tông"
