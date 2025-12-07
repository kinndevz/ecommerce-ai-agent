from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.base import TimestampMixin


class Order(Base, TimestampMixin):
    """
    Customer orders
    Status: pending, processing, shipped, delivered, cancelled
    """
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)

    # Status
    status = Column(String(50), nullable=False, default='pending', index=True)
    payment_status = Column(String(50), default='pending', index=True)
    payment_method = Column(String(50), nullable=True)

    # Pricing
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), default=0)
    shipping_fee = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)

    # Shipping address (JSONB)
    # {'name': '', 'phone': '', 'address': '', 'city': '', 'country': ''}
    shipping_address = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order",
                         cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order {self.order_number} - {self.status}>"


class OrderItem(Base, TimestampMixin):
    """
    Items in order (snapshot of product data at time of order)
    """
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"),
                      nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)
    variant_id = Column(String, ForeignKey(
        "product_variants.id"), nullable=True)

    # Snapshot data
    product_name = Column(String(500), nullable=False)
    variant_name = Column(String(200), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem {self.product_name} x{self.quantity}>"
