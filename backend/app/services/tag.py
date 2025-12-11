import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.product import Tag, product_tags
from app.utils.responses import ResponseHandler
from app.schemas.tags import TagCreateRequest, TagUpdateRequest


class TagService:

    @staticmethod
    def get_all_tags(db: Session):
        """Get all tags with product count"""

        tags = db.query(
            Tag,
            func.count(product_tags.c.product_id).label('product_count')
        ).outerjoin(
            product_tags, Tag.id == product_tags.c.tag_id
        ).group_by(Tag.id).order_by(Tag.name.asc()).all()

        # Format response - Only fields from DB
        tags_data = [
            {
                "id": tag.id,
                "name": tag.name,
                "slug": tag.slug,
                "created_at": tag.created_at,
                "updated_at": tag.updated_at,
                "usage_count": product_count  # Computed from query
            }
            for tag, product_count in tags
        ]

        return ResponseHandler.success(
            message="Tags retrieved successfully",
            data={
                "tags": tags_data,
                "total": len(tags_data)
            }
        )

    @staticmethod
    def get_popular_tags(db: Session, limit: int = 10):
        """Get most used tags"""

        tags = db.query(
            Tag,
            func.count(product_tags.c.product_id).label('product_count')
        ).join(
            product_tags, Tag.id == product_tags.c.tag_id
        ).group_by(Tag.id).order_by(
            desc(func.count(product_tags.c.product_id))
        ).limit(limit).all()

        tags_data = [
            {
                "id": tag.id,
                "name": tag.name,
                "slug": tag.slug,
                "created_at": tag.created_at,
                "updated_at": tag.updated_at,
                "usage_count": product_count
            }
            for tag, product_count in tags
        ]

        return ResponseHandler.success(
            message="Popular tags retrieved successfully",
            data={
                "tags": tags_data,
                "total": len(tags_data)
            }
        )

    @staticmethod
    def get_tag_by_id(db: Session, tag_id: str):
        """Get tag by ID"""

        result = db.query(
            Tag,
            func.count(product_tags.c.product_id).label('product_count')
        ).outerjoin(
            product_tags, Tag.id == product_tags.c.tag_id
        ).filter(Tag.id == tag_id).group_by(Tag.id).first()

        if not result:
            ResponseHandler.not_found_error("Tag", tag_id)

        tag, product_count = result
        tag_dict = {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "created_at": tag.created_at,
            "updated_at": tag.updated_at,
            "usage_count": product_count
        }

        return ResponseHandler.get_single_success("Tag", tag_id, tag_dict)

    @staticmethod
    def get_tag_by_slug(db: Session, slug: str):
        """Get tag by slug"""

        result = db.query(
            Tag,
            func.count(product_tags.c.product_id).label('product_count')
        ).outerjoin(
            product_tags, Tag.id == product_tags.c.tag_id
        ).filter(Tag.slug == slug).group_by(Tag.id).first()

        if not result:
            ResponseHandler.not_found_error("Tag", slug)

        tag, product_count = result
        tag_dict = {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "created_at": tag.created_at,
            "updated_at": tag.updated_at,
            "usage_count": product_count
        }

        return ResponseHandler.get_single_success("Tag", slug, tag_dict)

    @staticmethod
    def create_tag(db: Session, data: TagCreateRequest):
        """Create new tag"""

        # Check slug uniqueness
        existing = db.query(Tag).filter(Tag.slug == data.slug).first()
        if existing:
            ResponseHandler.already_exists_error("Tag", "slug")

        # Check name uniqueness
        existing_name = db.query(Tag).filter(Tag.name == data.name).first()
        if existing_name:
            ResponseHandler.already_exists_error("Tag", "name")

        # Create tag - Only fields that exist in DB
        tag = Tag(
            id=str(uuid.uuid4()),
            name=data.name,
            slug=data.slug
        )

        db.add(tag)
        db.commit()
        db.refresh(tag)

        return ResponseHandler.create_success("Tag", tag.id, tag)

    @staticmethod
    def update_tag(db: Session, tag_id: str, data: TagUpdateRequest):
        """Update tag"""

        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            ResponseHandler.not_found_error("Tag", tag_id)

        # Check slug uniqueness
        if data.slug and data.slug != tag.slug:
            existing = db.query(Tag).filter(
                Tag.slug == data.slug,
                Tag.id != tag_id
            ).first()

            if existing:
                ResponseHandler.already_exists_error("Tag", "slug")

        # Check name uniqueness
        if data.name and data.name != tag.name:
            existing_name = db.query(Tag).filter(
                Tag.name == data.name,
                Tag.id != tag_id
            ).first()

            if existing_name:
                ResponseHandler.already_exists_error("Tag", "name")

        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tag, key, value)

        tag.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(tag)

        return ResponseHandler.update_success("Tag", tag_id, tag)

    @staticmethod
    def delete_tag(db: Session, tag_id: str):
        """Delete tag (only if not used)"""

        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            ResponseHandler.not_found_error("Tag", tag_id)

        # Check if tag is used by any products
        product_count = db.query(func.count(product_tags.c.product_id)).filter(
            product_tags.c.tag_id == tag_id
        ).scalar()

        if product_count > 0:
            ResponseHandler.bad_request(
                f"Cannot delete tag. It is used by {product_count} products. Remove from products first."
            )

        # Delete
        db.delete(tag)
        db.commit()

        return ResponseHandler.delete_success("Tag", tag_id)

    @staticmethod
    def get_tag_stats(db: Session):
        """Get tag statistics"""

        total = db.query(func.count(Tag.id)).scalar()

        # Most used tags
        most_used = db.query(
            Tag.name,
            func.count(product_tags.c.product_id).label('product_count')
        ).join(
            product_tags, Tag.id == product_tags.c.tag_id
        ).group_by(Tag.id, Tag.name).order_by(
            desc(func.count(product_tags.c.product_id))
        ).limit(10).all()

        # Unused tags
        unused_count = db.query(func.count(Tag.id)).outerjoin(
            product_tags, Tag.id == product_tags.c.tag_id
        ).filter(product_tags.c.tag_id.is_(None)).scalar()

        stats = {
            "total_tags": total,
            "most_used_tags": [
                {"name": name, "product_count": count}
                for name, count in most_used
            ],
            "unused_tags_count": unused_count
        }

        return ResponseHandler.success("Tag statistics retrieved", stats)

    @staticmethod
    def merge_tags(db: Session, source_tag_id: str, target_tag_id: str):
        """Merge source tag into target tag"""

        source_tag = db.query(Tag).filter(Tag.id == source_tag_id).first()
        target_tag = db.query(Tag).filter(Tag.id == target_tag_id).first()

        if not source_tag:
            ResponseHandler.not_found_error("Source tag", source_tag_id)

        if not target_tag:
            ResponseHandler.not_found_error("Target tag", target_tag_id)

        if source_tag_id == target_tag_id:
            ResponseHandler.bad_request("Cannot merge tag with itself")

        # Get all products with source tag
        from app.models.product import Product
        products = db.query(Product).join(
            product_tags, Product.id == product_tags.c.product_id
        ).filter(product_tags.c.tag_id == source_tag_id).all()

        # Add target tag to all products
        for product in products:
            if target_tag not in product.tags:
                product.tags.append(target_tag)

            # Remove source tag
            if source_tag in product.tags:
                product.tags.remove(source_tag)

        # Delete source tag
        db.delete(source_tag)
        db.commit()

        return ResponseHandler.success(
            message=f"Merged tag '{source_tag.name}' into '{target_tag.name}'",
            data={
                "products_affected": len(products),
                "target_tag": {
                    "id": target_tag.id,
                    "name": target_tag.name,
                    "slug": target_tag.slug
                }
            }
        )
