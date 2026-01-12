from app.core.enums import RateLimitTier, HTTPMethod


class RateLimitConfig:
    GLOBAL_RATE_LIMIT = "1000/hour"
    ERROR_MESSAGE = "Rate limit exceeded. Please try again later."
    AUTHENTICATED_MULTIPLIER = 2

    WHITELIST_IPS = [
        # "*",
    ]

    DEFAULT_TIER = RateLimitTier.STRICT

    METHOD_TIERS = {
        HTTPMethod.GET.value: RateLimitTier.RELAXED,
        HTTPMethod.POST.value: RateLimitTier.MODERATE,
        HTTPMethod.PUT.value: RateLimitTier.MODERATE,
        HTTPMethod.DELETE.value: RateLimitTier.MODERATE,
        HTTPMethod.PATCH.value: RateLimitTier.MODERATE,
    }

    TIER_LIMITS = {
        RateLimitTier.STRICT: "5/minute",
        RateLimitTier.MODERATE: "30/minute",
        RateLimitTier.RELAXED: "100/minute",
        RateLimitTier.UNRESTRICTED: None
    }

    ENDPOINT_LIMITS = {
        "/auth/login": "5/minute",
        "/auth/register": "3/minute",
        "/auth/forgot-password": "3/minute",
        "/change-password": "3/minute",
        "/products": "100/minute",
        "/categories": "100/minute",
        "/brands": "100/minute",
        "/orders": "20/minute",
        "/carts": "30/minute",
        "/reviews": "10/minute",
        "/admin": "50/minute",
        "/health": None,
        "/": None,
    }

    ROLE_MULTIPLIERS = {
        "ADMIN": 5,
        "SELLER": 3,
        "CUSTOMER": 2,
    }
