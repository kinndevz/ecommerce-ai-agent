import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.product import Product, ProductImage
from app.utils.responses import ResponseHandler
from app.schemas.products import (
    ProductImageCreateRequest,
    ProductImageUpdateRequest
)


class ProductImageService:

    @staticmethod
    def add_image(db: Session, product_id: str, data: ProductImageCreateRequest):
        """Add image to product"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        # If setting as primary, unset other primary images
        if data.is_primary:
            db.query(ProductImage).filter(
                ProductImage.product_id == product_id
            ).update({"is_primary": False})

        image = ProductImage(
            id=str(uuid.uuid4()),
            product_id=product_id,
            image_url=data.image_url,
            alt_text=data.alt_text,
            is_primary=data.is_primary,
            display_order=data.display_order
        )

        db.add(image)
        db.commit()
        db.refresh(image)

        return ResponseHandler.create_success("Product image", image.id, image)

    @staticmethod
    def update_image(db: Session, product_id: str, image_id: str, data: ProductImageUpdateRequest):
        """Update product image"""

        image = db.query(ProductImage).filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        ).first()

        if not image:
            ResponseHandler.not_found_error("Product image", image_id)

        # If setting as primary, unset other primary images
        if data.is_primary and data.is_primary != image.is_primary:
            db.query(ProductImage).filter(
                ProductImage.product_id == product_id,
                ProductImage.id != image_id
            ).update({"is_primary": False})

        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(image, key, value)

        image.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(image)

        return ResponseHandler.update_success("Product image", image_id, image)

    @staticmethod
    def delete_image(db: Session, product_id: str, image_id: str):
        """Delete product image"""

        image = db.query(ProductImage).filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        ).first()

        if not image:
            ResponseHandler.not_found_error("Product image", image_id)

        db.delete(image)
        db.commit()

        return ResponseHandler.delete_success("Product image", image_id)
