from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import TimestampMixin


class Wishlist(Base, TimestampMixin):
    """
    User favorites/saved products
    """
    __tablename__ = "wishlists"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="wishlists")
    product = relationship("Product", back_populates="wishlists")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uix_user_product'),
    )

    def __repr__(self):
        return f"<Wishlist {self.user_id} - {self.product_id}>"
