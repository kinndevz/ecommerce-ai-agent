from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base
from datetime import datetime, timezone


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    status = Column(SQLEnum(UserStatus), default=UserStatus.INACTIVE)

    # 2FA
    totp_secret = Column(String, nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)
    pending_totp_secret = Column(String, nullable=True)

    # Role
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="users")

    # Audit fields
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc),
                        onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)

    created_by_id = Column(String, nullable=True)
    updated_by_id = Column(String, nullable=True)
    deleted_by_id = Column(String, nullable=True)

    # Relationships
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String, ForeignKey(
        "devices.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    user = relationship("User", back_populates="refresh_tokens")
    device = relationship("Device", back_populates="refresh_tokens")


class VerificationCodeType(str, enum.Enum):
    REGISTER = "REGISTER"
    FORGOT_PASSWORD = "FORGOT_PASSWORD"
    LOGIN = "LOGIN"
    DISABLE_2FA = "DISABLE_2FA"


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False)
    type = Column(SQLEnum(VerificationCodeType), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    __table_args__ = (
        # Composite unique constraint
        # UniqueConstraint('email', 'type', name='uix_email_type'),
    )
