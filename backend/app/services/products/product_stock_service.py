from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.utils.responses import ResponseHandler
from .helpers import format_product_list_item


class ProductStockService:

    @staticmethod
    def get_low_stock(db: Session, threshold: int = 10):
        """Get products with low stock"""

        products = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.stock_quantity > 0,
            Product.stock_quantity <= threshold
        ).order_by(Product.stock_quantity.asc()).all()

        products_data = [format_product_list_item(p) for p in products]
        total = len(products_data)
        limit = total if total > 0 else 1

        return ResponseHandler.get_list_success(
            resource_name="Low stock products",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )

    @staticmethod
    def get_out_of_stock(db: Session):
        """Get out of stock products"""

        products = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(
            Product.deleted_at.is_(None),
            Product.stock_quantity == 0
        ).all()

        products_data = [format_product_list_item(p) for p in products]
        total = len(products_data)
        limit = total if total > 0 else 1

        return ResponseHandler.get_list_success(
            resource_name="Out of stock products",
            data=products_data,
            total=total,
            limit=limit,
            page=1
        )
