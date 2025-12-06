from enum import Enum


class UserRole:
    """User role constants"""
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"
    SELLER = "SELLER"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class HTTPMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
