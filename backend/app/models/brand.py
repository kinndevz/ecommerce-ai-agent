from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import AuditMixin


class Brand(Base, AuditMixin):
    """
    Cosmetic brands: The Ordinary, CeraVe, La Roche-Posay, etc.
    """
    __tablename__ = "brands"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    website_url = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    products = relationship(
        "Product", back_populates="brand", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Brand {self.name}>"
