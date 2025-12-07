from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import TimestampMixin


class Cart(Base, TimestampMixin):
    """
    Shopping cart for user
    """
    __tablename__ = "carts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, unique=True, index=True)

    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart",
                         cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Cart {self.user_id}>"


class CartItem(Base, TimestampMixin):
    """
    Items in shopping cart
    """
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True, index=True)
    cart_id = Column(String, ForeignKey("carts.id"),
                     nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)
    variant_id = Column(String, ForeignKey(
        "product_variants.id"), nullable=True)

    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Numeric(10, 2), nullable=False)  # Price at time of adding

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")
    variant = relationship("ProductVariant", back_populates="cart_items")

    def __repr__(self):
        return f"<CartItem {self.product_id} x{self.quantity}>"
