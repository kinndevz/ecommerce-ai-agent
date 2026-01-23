import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.utils.responses import ResponseHandler


class WishlistService:
    @staticmethod
    def _get_primary_image(product: Product):
        if not product.images:
            return None
        primary_image = next(
            (img.image_url for img in product.images if img.is_primary),
            None
        )
        return primary_image or product.images[0].image_url

    @staticmethod
    def _format_wishlist_item(wishlist: Wishlist):
        product = wishlist.product
        return {
            "id": wishlist.id,
            "user_id": wishlist.user_id,
            "product_id": wishlist.product_id,
            "product_name": product.name,
            "product_slug": product.slug,
            "product_image": WishlistService._get_primary_image(product),
            "price": float(product.price),
            "sale_price": float(product.sale_price) if product.sale_price else None,
            "created_at": wishlist.created_at,
            "updated_at": wishlist.updated_at
        }

    @staticmethod
    def add_item(db: Session, user_id: str, product_id: str):
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        existing = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        ).first()

        if existing:
            ResponseHandler.already_exists_error("Wishlist item", "product")

        wishlist = Wishlist(
            id=str(uuid.uuid4()),
            user_id=user_id,
            product_id=product_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)

        wishlist.product = product
        return ResponseHandler.create_success(
            "Wishlist item",
            wishlist.id,
            WishlistService._format_wishlist_item(wishlist)
        )

    @staticmethod
    def remove_item(db: Session, user_id: str, product_id: str):
        wishlist = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        ).first()

        if not wishlist:
            ResponseHandler.not_found_error("Wishlist item", product_id)

        db.delete(wishlist)
        db.commit()
        return ResponseHandler.delete_success("Wishlist item", product_id)

    @staticmethod
    def list_items(db: Session, user_id: str, page: int = 1, limit: int = 20):
        query = db.query(Wishlist).options(
            joinedload(Wishlist.product).joinedload(Product.images)
        ).filter(
            Wishlist.user_id == user_id
        )

        total = query.count()
        items = query.order_by(Wishlist.created_at.desc()).offset(
            (page - 1) * limit
        ).limit(limit).all()

        data = [WishlistService._format_wishlist_item(item) for item in items]
        return ResponseHandler.get_list_success(
            "Wishlist",
            data=data,
            total=total,
            page=page,
            limit=limit
        )
