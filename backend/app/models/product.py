from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, ForeignKey, Table, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from decimal import Decimal
from datetime import datetime, timezone
from app.db.database import Base
from app.models.base import TimestampMixin, AuditMixin


# ========== Association Table ==========

product_tags = Table(
    'product_tags',
    Base.metadata,
    Column('product_id', String, ForeignKey('products.id'), primary_key=True),
    Column('tag_id', String, ForeignKey('tags.id'), primary_key=True),
    Column('created_at', DateTime, default=datetime.now(timezone.utc))
)


# ========== Product Model ==========

class Product(Base, AuditMixin):
    """
    Main product table with cosmetic-specific attributes
    """
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    brand_id = Column(String, ForeignKey("brands.id"),
                      nullable=False, index=True)
    category_id = Column(String, ForeignKey(
        "categories.id"), nullable=False, index=True)

    # Basic Info
    name = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True)
    short_description = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    how_to_use = Column(Text, nullable=True)

    # Pricing & Stock
    price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)

    # Status
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, index=True)

    # Metrics
    rating_average = Column(Numeric(3, 2), default=Decimal('0.0'))
    review_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)

    # Cosmetic-specific attributes (PostgreSQL arrays)
    # ['oily', 'dry', 'combination', 'sensitive', 'normal']
    skin_types = Column(ARRAY(String), nullable=True)
    # ['acne', 'aging', 'dark_spots', 'wrinkles']
    concerns = Column(ARRAY(String), nullable=True)
    # ['moisturizing', 'brightening', 'anti-aging']
    benefits = Column(ARRAY(String), nullable=True)

    # Ingredients (JSONB)
    # {'key_ingredients': [], 'full_list': [], 'allergens': []}
    ingredients = Column(JSONB, nullable=True)

    # Relationships
    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship(
        "ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=product_tags,
                        back_populates="products")
    reviews = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlists = relationship("Wishlist", back_populates="product")
    product_views = relationship("ProductView", back_populates="product")

    def __repr__(self):
        return f"<Product {self.name}>"


# ========== Product Image ==========

class ProductImage(Base, TimestampMixin):
    """
    Multiple images per product
    """
    __tablename__ = "product_images"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False, index=True)
    display_order = Column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="images")

    def __repr__(self):
        return f"<ProductImage {self.id} - Primary: {self.is_primary}>"


# ========== Product Variant ==========

class ProductVariant(Base, AuditMixin):
    """
    Different sizes (50ml, 100ml) and shades (for makeup)
    """
    __tablename__ = "product_variants"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"),
                        nullable=False, index=True)

    # Basic Info
    name = Column(String(200), nullable=False)
    sku = Column(String(100), unique=True, index=True)

    # Pricing & Stock
    price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    is_available = Column(Boolean, default=True)

    # Variant attributes
    size = Column(String(50), nullable=True)        # 50, 100, 200
    size_unit = Column(String(20), nullable=True)   # ml, g, oz
    color = Column(String(50), nullable=True)       # Hex code or color name
    shade_name = Column(String(100), nullable=True)  # Ivory, Beige, Tan

    # Relationships
    product = relationship("Product", back_populates="variants")
    cart_items = relationship("CartItem", back_populates="variant")
    order_items = relationship("OrderItem", back_populates="variant")

    def __repr__(self):
        return f"<ProductVariant {self.name} - {self.size}{self.size_unit}>"


# ========== Tag ==========

class Tag(Base, TimestampMixin):
    """
    Tags: vegan, cruelty-free, organic, paraben-free, sulfate-free
    """
    __tablename__ = "tags"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Relationships
    products = relationship(
        "Product", secondary=product_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"
