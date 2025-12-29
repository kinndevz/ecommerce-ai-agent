from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from sqlalchemy.sql import func


class TimestampMixin:
    """Add created_at and updated_at timestamps"""
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())


class SoftDeleteMixin:
    """Add soft delete capability"""
    deleted_at = Column(DateTime, nullable=True)
    deleted_by_id = Column(String, nullable=True)


class AuditMixin(TimestampMixin, SoftDeleteMixin):
    """Full audit trail"""
    created_by_id = Column(String, nullable=True)
    updated_by_id = Column(String, nullable=True)
