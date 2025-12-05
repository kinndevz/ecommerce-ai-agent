from sqlalchemy import Column, String, Boolean, DateTime, Table, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base
from datetime import datetime, timezone


# Association table for many-to-many relationship
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', String, ForeignKey(
        'permissions.id'), primary_key=True)
)


class HTTPMethod(str, enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, default="")
    is_active = Column(Boolean, default=True)

    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship(
        "Permission", secondary=role_permissions, back_populates="roles")

    # Audit
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc),
                        onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    created_by_id = Column(String, nullable=True)
    updated_by_id = Column(String, nullable=True)
    deleted_by_id = Column(String, nullable=True)


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    path = Column(String, nullable=False)
    method = Column(SQLEnum(HTTPMethod), nullable=False)
    module = Column(String, default="")

    # Relationships
    roles = relationship("Role", secondary=role_permissions,
                         back_populates="permissions")

    # Audit
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc),
                        onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    created_by_id = Column(String, nullable=True)
    updated_by_id = Column(String, nullable=True)
    deleted_by_id = Column(String, nullable=True)
