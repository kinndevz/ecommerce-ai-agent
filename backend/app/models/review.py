from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import AuditMixin


class Review(Base, AuditMixin):
    """
    Product reviews with ratings and skin type info
    """
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, index=True)

    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)

    # Metadata
    verified_purchase = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)

    # Reviewer info
    skin_type = Column(String(50), nullable=True)  # Reviewer skin type
    age_range = Column(String(20), nullable=True)  # 18-24, 25-34, etc.

    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review {self.id} - {self.rating} stars>"
