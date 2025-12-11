import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.product import Product, ProductVariant
from app.utils.responses import ResponseHandler
from app.schemas.products import (
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest
)
from .helpers import format_product_variant


class ProductVariantService:

    @staticmethod
    def get_all_variants(db: Session, product_id: str):
        """Get all variants of a product"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        variants = db.query(ProductVariant).filter(
            ProductVariant.product_id == product_id,
            ProductVariant.deleted_at.is_(None)
        ).all()

        variants_data = [format_product_variant(v) for v in variants]

        return ResponseHandler.success(
            message="Product variants retrieved successfully",
            data={"variants": variants_data, "total": len(variants_data)}
        )

    @staticmethod
    def add_variant(db: Session, product_id: str, data: ProductVariantCreateRequest, created_by_id: str):
        """Add variant to product"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        # Check SKU uniqueness
        existing_sku = db.query(ProductVariant).filter(
            ProductVariant.sku == data.sku,
            ProductVariant.deleted_at.is_(None)
        ).first()

        if existing_sku:
            ResponseHandler.already_exists_error("Product variant", "sku")

        variant = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=product_id,
            name=data.name,
            sku=data.sku,
            price=data.price,
            sale_price=data.sale_price,
            stock_quantity=data.stock_quantity,
            is_available=True,
            size=data.size,
            size_unit=data.size_unit,
            color=data.color,
            shade_name=data.shade_name,
            created_by_id=created_by_id
        )

        db.add(variant)
        db.commit()
        db.refresh(variant)

        return ResponseHandler.create_success("Product variant", variant.id, variant)

    @staticmethod
    def update_variant(db: Session, product_id: str, variant_id: str, data: ProductVariantUpdateRequest, updated_by_id: str):
        """Update product variant"""

        variant = db.query(ProductVariant).filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
            ProductVariant.deleted_at.is_(None)
        ).first()

        if not variant:
            ResponseHandler.not_found_error("Product variant", variant_id)

        # Check SKU uniqueness
        if data.sku and data.sku != variant.sku:
            existing_sku = db.query(ProductVariant).filter(
                ProductVariant.sku == data.sku,
                ProductVariant.id != variant_id,
                ProductVariant.deleted_at.is_(None)
            ).first()

            if existing_sku:
                ResponseHandler.already_exists_error("Product variant", "sku")

        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(variant, key, value)

        variant.updated_by_id = updated_by_id
        variant.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(variant)

        return ResponseHandler.update_success("Product variant", variant_id, variant)

    @staticmethod
    def delete_variant(db: Session, product_id: str, variant_id: str, deleted_by_id: str):
        """Soft delete product variant"""

        variant = db.query(ProductVariant).filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
            ProductVariant.deleted_at.is_(None)
        ).first()

        if not variant:
            ResponseHandler.not_found_error("Product variant", variant_id)

        variant.deleted_at = datetime.now(timezone.utc)
        variant.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Product variant", variant_id)
