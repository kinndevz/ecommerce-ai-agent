from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from app.models.product import Product
from app.models.brand import Brand
from app.models.category import Category
from app.utils.responses import ResponseHandler
from .helpers import format_product_list_item


class ProductDiscoveryService:

    @staticmethod
    def get_featured(db: Session, limit: int = 10):
        """Get featured products"""

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.is_featured == True,
            Product.is_available == True
        )

        total = query.count()
        products = query.order_by(
            desc(Product.rating_average),
            desc(Product.views_count)
        ).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name="Featured Products",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )

    @staticmethod
    def get_trending(db: Session, days: int = 7, limit: int = 10):
        """Get trending products (most viewed recently)"""

        since = datetime.now(timezone.utc) - timedelta(days=days)

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.is_available == True,
            Product.updated_at >= since
        )

        total = query.count()
        products = query.order_by(desc(Product.views_count)).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name="Trending Products",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )

    @staticmethod
    def get_new_arrivals(db: Session, days: int = 30, limit: int = 10, page: int = 1):
        """Get new arrival products"""

        since = datetime.now(timezone.utc) - timedelta(days=days)

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.is_available == True,
            Product.created_at >= since
        )

        total = query.count()
        products = query.order_by(desc(Product.created_at))\
            .offset((page - 1) * limit)\
            .limit(limit)\
            .all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name="Products New Arrival",
            data=products_data,
            total=total,
            limit=limit,
            page=page
        )

    @staticmethod
    def get_on_sale(db: Session, limit: int = 20):
        """Get products on sale"""

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.is_available == True,
            Product.sale_price.isnot(None),
            Product.sale_price < Product.price
        )

        total = query.count()
        products = query.order_by(
            desc((Product.price - Product.sale_price) / Product.price)
        ).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name="Products On Sale",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )

    @staticmethod
    def get_by_brand(db: Session, brand_slug: str, page: int = 1, limit: int = 20):
        """Get products by brand slug"""

        brand = db.query(Brand).filter(
            Brand.slug == brand_slug,
            Brand.deleted_at.is_(None)
        ).first()

        if not brand:
            ResponseHandler.not_found_error("Brand", brand_slug)

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.brand_id == brand.id,
            Product.deleted_at.is_(None),
            Product.is_available == True
        )

        total = query.count()
        products = query.order_by(desc(Product.rating_average)).offset(
            (page - 1) * limit).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name=f"Products by brand '{brand.name}'",
            data=products_data,
            total=total,
            limit=limit,
            page=page
        )

    @staticmethod
    def get_by_category(db: Session, category_slug: str, page: int = 1, limit: int = 20):
        """Get products by category slug"""

        category = db.query(Category).filter(
            Category.slug == category_slug,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            ResponseHandler.not_found_error("Category", category_slug)

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.category_id == category.id,
            Product.deleted_at.is_(None),
            Product.is_available == True
        )

        total = query.count()
        products = query.order_by(desc(Product.rating_average)).offset(
            (page - 1) * limit).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name=f"Products by category '{category.name}'",
            data=products_data,
            total=total,
            limit=limit,
            page=page
        )

    @staticmethod
    def get_related(db: Session, product_id: str, limit: int = 5):
        """Get related products (same category)"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.id != product_id,
            Product.category_id == product.category_id,
            Product.deleted_at.is_(None),
            Product.is_available == True
        )

        if product.concerns and len(product.concerns) > 0:
            query = query.filter(
                Product.concerns.op('&&')(product.concerns)
            )

        total = query.count()
        products = query.order_by(
            desc(Product.rating_average)).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]

        return ResponseHandler.get_list_success(
            resource_name="Related Products",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )
