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

        return ResponseHandler.success(
            message="Low stock products retrieved successfully",
            data={"products": products_data, "total": len(products_data)}
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

        return ResponseHandler.success(
            message="Out of stock products retrieved successfully",
            data={"products": products_data, "total": len(products_data)}
        )
