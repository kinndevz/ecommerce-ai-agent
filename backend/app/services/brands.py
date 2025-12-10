import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.brand import Brand
from app.models.product import Product
from app.utils.responses import ResponseHandler
from app.utils.serializers import model_to_dict


class BrandService:
    @staticmethod
    def get_all_brands(db: Session, include_inactive: bool = False):
        """Get all brands"""

        query = db.query(
            Brand,
            func.count(Product.id).label('product_count')
        ).outerjoin(Product).filter(
            Brand.deleted_at.is_(None)
        )

        if not include_inactive:
            query = query.filter(Brand.is_active == True)

        results = query.group_by(Brand.id).order_by(Brand.name.asc()).all()

        # Serialize
        brands = [
            {**model_to_dict(brand), "product_count": product_count}
            for brand, product_count in results
        ]

        return ResponseHandler.success(
            message="Brands retrieved successfully",
            data={
                "brands": brands,
                "total": len(brands)
            }
        )

    @staticmethod
    def get_brand_by_id(db: Session, brand_id: str):
        """Get brand by ID"""

        result = db.query(
            Brand,
            func.count(Product.id).label('product_count')
        ).outerjoin(Product).filter(
            Brand.id == brand_id,
            Brand.deleted_at.is_(None)
        ).group_by(Brand.id).first()

        if not result:
            ResponseHandler.not_found_error("Brand", brand_id)

        brand, product_count = result
        brand_dict = {**model_to_dict(brand), "product_count": product_count}

        return ResponseHandler.get_single_success("Brand", brand_id, brand_dict)

    @staticmethod
    def create_brand(db: Session, data, created_by_id: str):
        """Create new brand"""

        # Check slug exists
        existing = db.query(Brand).filter(
            Brand.slug == data.slug,
            Brand.deleted_at.is_(None)
        ).first()

        if existing:
            ResponseHandler.already_exists_error("Brand", "slug")

        # Create
        brand = Brand(
            id=str(uuid.uuid4()),
            name=data.name,
            slug=data.slug,
            description=data.description,
            country=data.country,
            website_url=data.website_url,
            logo_url=data.logo_url,
            is_active=True,
            created_by_id=created_by_id
        )

        db.add(brand)
        db.commit()
        db.refresh(brand)

        return ResponseHandler.create_success("Brand", brand.id, brand)

    @staticmethod
    def update_brand(db: Session, brand_id: str, data, updated_by_id: str):
        """Update brand"""

        brand = db.query(Brand).filter(
            Brand.id == brand_id,
            Brand.deleted_at.is_(None)
        ).first()

        if not brand:
            ResponseHandler.not_found_error("Brand", brand_id)

        # Check slug uniqueness
        if data.slug and data.slug != brand.slug:
            existing = db.query(Brand).filter(
                Brand.slug == data.slug,
                Brand.id != brand_id,
                Brand.deleted_at.is_(None)
            ).first()

            if existing:
                ResponseHandler.already_exists_error("Brand", "slug")

        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)

        brand.updated_by_id = updated_by_id
        brand.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(brand)

        return ResponseHandler.update_success("Brand", brand_id, brand)

    @staticmethod
    def delete_brand(db: Session, brand_id: str, deleted_by_id: str):
        """Soft delete brand"""

        brand = db.query(Brand).filter(
            Brand.id == brand_id,
            Brand.deleted_at.is_(None)
        ).first()

        if not brand:
            ResponseHandler.not_found_error("Brand", brand_id)

        # Check products
        product_count = db.query(func.count(Product.id)).filter(
            Product.brand_id == brand_id,
            Product.deleted_at.is_(None)
        ).scalar()

        if product_count > 0:
            ResponseHandler.bad_request(
                f"Cannot delete brand. It has {product_count} products."
            )

        # Soft delete
        brand.deleted_at = datetime.now(timezone.utc)
        brand.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Brand", brand_id)

    @staticmethod
    def toggle_status(db: Session, brand_id: str, updated_by_id: str):
        """Toggle brand active status"""

        brand = db.query(Brand).filter(
            Brand.id == brand_id,
            Brand.deleted_at.is_(None)
        ).first()

        if not brand:
            ResponseHandler.not_found_error("Brand", brand_id)

        brand.is_active = not brand.is_active
        brand.updated_by_id = updated_by_id
        brand.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(brand)

        status = "active" if brand.is_active else "inactive"

        return ResponseHandler.success(
            message=f"Brand status changed to {status}",
            data=brand
        )

    @staticmethod
    def get_brand_stats(db: Session):
        """Get brand statistics"""

        total = db.query(func.count(Brand.id)).filter(
            Brand.deleted_at.is_(None)
        ).scalar()

        active = db.query(func.count(Brand.id)).filter(
            Brand.deleted_at.is_(None),
            Brand.is_active == True
        ).scalar()

        inactive = total - active

        # Top brands
        top_brands = db.query(
            Brand.name,
            func.count(Product.id).label('product_count')
        ).join(Product).filter(
            Brand.deleted_at.is_(None),
            Product.deleted_at.is_(None)
        ).group_by(Brand.id, Brand.name).order_by(
            func.count(Product.id).desc()
        ).limit(5).all()

        stats = {
            "total_brands": total,
            "active_brands": active,
            "inactive_brands": inactive,
            "top_brands": [
                {"name": name, "product_count": count}
                for name, count in top_brands
            ]
        }

        return ResponseHandler.success("Brand statistics retrieved", stats)
