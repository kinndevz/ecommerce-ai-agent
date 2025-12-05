from datetime import datetime, timedelta, timezone
from typing import Optional
import random
from jose import JWTError, jwt
from passlib.context import CryptContext
import pyotp
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain, hashed)


# JWT Tokens
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access_token"})

    return jwt.encode(to_encode, settings.ACCESS_TOKEN_SECRET, algorithm="HS256")


def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "type": "refresh_token"})

    return jwt.encode(to_encode, settings.REFRESH_TOKEN_SECRET, algorithm="HS256")


def verify_access_token(token: str) -> dict:
    """Verify and decode access token"""
    try:
        payload = jwt.decode(
            token, settings.ACCESS_TOKEN_SECRET, algorithms=["HS256"])
        if payload.get("type") != "access_token":
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        raise


def verify_refresh_token(token: str) -> dict:
    """Verify and decode refresh token"""
    try:
        payload = jwt.decode(
            token, settings.REFRESH_TOKEN_SECRET, algorithms=["HS256"])
        if payload.get("type") != "refresh_token":
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        raise


# 2FA (TOTP)
def generate_totp_secret(email: str) -> tuple[str, str]:
    """Generate TOTP secret and URI for QR code"""
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=email, issuer_name=settings.APP_NAME)
    return secret, uri


def verify_totp(secret: str, token: str) -> bool:
    """Verify TOTP token"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)  # Allow 30s window


# OTP Generation

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))
