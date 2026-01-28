from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from decimal import Decimal
from sqlalchemy import Numeric
from datetime import datetime, timezone
from app.db.database import Base
from app.models.base import TimestampMixin


class Conversation(Base, TimestampMixin):
    """
    AI chat conversation threads
    """
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, index=True)
    thread_id = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation {self.thread_id}>"


class Message(Base, TimestampMixin):
    """
    Individual messages in conversations
    Role: user, assistant, system
    """
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey(
        "conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    # Tool calls, citations, etc.
    message_metadata = Column(JSONB, nullable=True)
    # False = hidden from UI (e.g., system prompts from frontend)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.role} - {self.content[:50]}>"


class UserPreference(Base, TimestampMixin):
    """
    User preferences for AI personalization
    """
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"),
                     nullable=False, unique=True, index=True)

    # Skin preferences
    skin_type = Column(String(50), nullable=True)
    skin_concerns = Column(ARRAY(String), nullable=True)

    # Shopping preferences
    favorite_brands = Column(ARRAY(String), nullable=True)
    price_range_min = Column(Numeric(10, 2), nullable=True)
    price_range_max = Column(Numeric(10, 2), nullable=True)
    preferred_categories = Column(ARRAY(String), nullable=True)

    # Allergies/restrictions
    allergies = Column(ARRAY(String), nullable=True)  # Ingredients to avoid

    # Relationships
    user = relationship("User", back_populates="preference")

    def __repr__(self):
        return f"<UserPreference {self.user_id}>"


class ProductView(Base):
    """
    Track product views for recommendations
    """
    __tablename__ = "product_views"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)
    session_id = Column(String(100), nullable=True)
    viewed_at = Column(DateTime, default=datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="product_views")
    product = relationship("Product", back_populates="product_views")

    def __repr__(self):
        return f"<ProductView {self.product_id}>"
