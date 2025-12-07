from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import AuditMixin


class Category(Base, AuditMixin):
    """
    Hierarchical categories: Skincare > Cleansers, Makeup > Face > Foundation
    """
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)
    parent_id = Column(String, ForeignKey(
        "categories.id"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Self-referential relationship (parent-child)
    parent = relationship("Category", remote_side=[id], backref="children")

    # Relationships
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"
