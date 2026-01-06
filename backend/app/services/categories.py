"""
Category service
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.category import Category
from app.models.product import Product
from app.utils.responses import ResponseHandler
from app.utils.serializers import model_to_dict


class CategoryService:

    @staticmethod
    def get_all_categories(db: Session, include_inactive: bool = False):
        """Get all categories as flat list"""

        query = db.query(
            Category,
            func.count(Product.id).label('product_count')
        ).outerjoin(Product).filter(
            Category.deleted_at.is_(None)
        )

        if not include_inactive:
            query = query.filter(Category.is_active == True)

        results = query.group_by(Category.id).order_by(
            Category.parent_id.asc().nullsfirst(),
            Category.display_order.asc(),
            Category.name.asc()
        ).all()

        # Serialize
        categories = []
        for category, product_count in results:
            # Count children
            children_count = db.query(func.count(Category.id)).filter(
                Category.parent_id == category.id,
                Category.deleted_at.is_(None)
            ).scalar()

            cat_dict = {
                **model_to_dict(category),
                "product_count": product_count,
                "children_count": children_count
            }
            categories.append(cat_dict)

        return ResponseHandler.success(
            message="Categories retrieved successfully",
            data={
                "categories": categories,
                "total": len(categories)
            }
        )

    @staticmethod
    def get_category_tree(db: Session, include_inactive: bool = False):
        """Get categories as hierarchical tree"""

        query = db.query(
            Category,
            func.count(Product.id).label('product_count')
        ).outerjoin(Product).filter(
            Category.deleted_at.is_(None)
        )

        if not include_inactive:
            query = query.filter(Category.is_active == True)

        results = query.group_by(Category.id).order_by(
            Category.display_order.asc(),
            Category.name.asc()
        ).all()

        # Build tree
        categories_map = {}
        root_categories = []

        for category, product_count in results:
            cat_dict = {
                **model_to_dict(category),
                "product_count": product_count,
                "children": []
            }

            categories_map[category.id] = cat_dict

            if category.parent_id is None:
                root_categories.append(cat_dict)

        # Link children to parents
        for cat_id, cat_dict in categories_map.items():
            parent_id = cat_dict["parent_id"]
            if parent_id and parent_id in categories_map:
                categories_map[parent_id]["children"].append(cat_dict)

        return ResponseHandler.success(
            message="Category tree retrieved successfully",
            data=root_categories
        )

    @staticmethod
    def get_category_by_id(db: Session, category_id: str):
        """Get category by ID"""

        result = db.query(
            Category,
            func.count(Product.id).label('product_count')
        ).outerjoin(Product).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).group_by(Category.id).first()

        if not result:
            ResponseHandler.not_found_error("Category", category_id)

        category, product_count = result

        # Count children
        children_count = db.query(func.count(Category.id)).filter(
            Category.parent_id == category_id,
            Category.deleted_at.is_(None)
        ).scalar()

        cat_dict = {
            **model_to_dict(category),
            "product_count": product_count,
            "children_count": children_count
        }

        return ResponseHandler.get_single_success("Category", category_id, cat_dict)

    @staticmethod
    def create_category(db: Session, data, created_by_id: str):
        """Create new category"""

        # Check slug
        existing = db.query(Category).filter(
            Category.slug == data.slug,
            Category.deleted_at.is_(None)
        ).first()

        if existing:
            ResponseHandler.already_exists_error("Category", "slug")

        # Validate parent
        if data.parent_id:
            parent = db.query(Category).filter(
                Category.id == data.parent_id,
                Category.deleted_at.is_(None)
            ).first()

            if not parent:
                ResponseHandler.not_found_error(
                    "Parent category", data.parent_id)

        # Create
        now = datetime.now(timezone.utc)
        category = Category(
            id=str(uuid.uuid4()),
            parent_id=data.parent_id,
            name=data.name,
            slug=data.slug,
            description=data.description,
            image_url=data.image_url,
            display_order=data.display_order,
            is_active=True,
            created_by_id=created_by_id,
            created_at=now,
            updated_at=now
        )

        db.add(category)
        db.commit()
        db.refresh(category)

        return ResponseHandler.create_success("Category", category.id, category)

    @staticmethod
    def update_category(db: Session, category_id: str, data, updated_by_id: str):
        """Update category"""

        category = db.query(Category).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            ResponseHandler.not_found_error("Category", category_id)

        # Check slug
        if data.slug and data.slug != category.slug:
            existing = db.query(Category).filter(
                Category.slug == data.slug,
                Category.id != category_id,
                Category.deleted_at.is_(None)
            ).first()

            if existing:
                ResponseHandler.already_exists_error("Category", "slug")

        # Validate parent
        if data.parent_id:
            if data.parent_id == category_id:
                ResponseHandler.bad_request(
                    "Category cannot be its own parent")

            parent = db.query(Category).filter(
                Category.id == data.parent_id,
                Category.deleted_at.is_(None)
            ).first()

            if not parent:
                ResponseHandler.not_found_error(
                    "Parent category", data.parent_id)

        # Update
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)

        category.updated_by_id = updated_by_id
        category.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(category)

        return ResponseHandler.update_success("Category", category_id, category)

    @staticmethod
    def delete_category(db: Session, category_id: str, deleted_by_id: str):
        """
        Soft delete category (cascade to children)

        When deleting a category:
        1. Check if has products → Cannot delete
        2. If has children → Recursively soft delete all children
        3. Soft delete the category itself
        """

        category = db.query(Category).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            ResponseHandler.not_found_error("Category", category_id)

        # Check if category has products
        product_count = db.query(func.count(Product.id)).filter(
            Product.category_id == category_id,
            Product.deleted_at.is_(None)
        ).scalar()

        if product_count > 0:
            ResponseHandler.bad_request(
                f"Cannot delete category. It has {product_count} products. Please move or delete products first."
            )

        # Check children - recursively delete
        children = db.query(Category).filter(
            Category.parent_id == category_id,
            Category.deleted_at.is_(None)
        ).all()

        if children:
            # Recursively check and delete children
            for child in children:
                CategoryService._delete_category_recursive(
                    db, child.id, deleted_by_id)

        # Soft delete the category itself
        category.deleted_at = datetime.now(timezone.utc)
        category.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Category", category_id)

    @staticmethod
    def _delete_category_recursive(db: Session, category_id: str, deleted_by_id: str):
        category = db.query(Category).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            return

        # Check if category has products
        product_count = db.query(func.count(Product.id)).filter(
            Product.category_id == category_id,
            Product.deleted_at.is_(None)
        ).scalar()

        if product_count > 0:
            ResponseHandler.bad_request(
                f"Cannot delete category '{category.name}'. It has {product_count} products. Please move or delete products first."
            )

        # Get all children
        children = db.query(Category).filter(
            Category.parent_id == category_id,
            Category.deleted_at.is_(None)
        ).all()

        # Recursively delete children first (depth-first)
        for child in children:
            CategoryService._delete_category_recursive(
                db, child.id, deleted_by_id)

        # Delete this category after all children are deleted
        category.deleted_at = datetime.now(timezone.utc)
        category.deleted_by_id = deleted_by_id

    @staticmethod
    def toggle_status(db: Session, category_id: str, updated_by_id: str):
        """Toggle category status"""

        category = db.query(Category).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            ResponseHandler.not_found_error("Category", category_id)

        category.is_active = not category.is_active
        category.updated_by_id = updated_by_id
        category.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(category)

        status = "active" if category.is_active else "inactive"

        return ResponseHandler.success(
            message=f"Category status changed to {status}",
            data=category
        )

    @staticmethod
    def move_category(db: Session, category_id: str, new_parent_id: Optional[str], updated_by_id: str):
        """Move category to different parent"""

        category = db.query(Category).filter(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        ).first()

        if not category:
            ResponseHandler.not_found_error("Category", category_id)

        # Validate new parent
        if new_parent_id:
            if new_parent_id == category_id:
                ResponseHandler.bad_request(
                    "Category cannot be its own parent")

            parent = db.query(Category).filter(
                Category.id == new_parent_id,
                Category.deleted_at.is_(None)
            ).first()

            if not parent:
                ResponseHandler.not_found_error(
                    "Parent category", new_parent_id)

        # Move
        category.parent_id = new_parent_id
        category.updated_by_id = updated_by_id
        category.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(category)

        return ResponseHandler.success(
            message="Category moved successfully",
            data=category
        )

    @staticmethod
    def get_category_stats(db: Session):
        """Get category statistics"""

        total = db.query(func.count(Category.id)).filter(
            Category.deleted_at.is_(None)
        ).scalar()

        active = db.query(func.count(Category.id)).filter(
            Category.deleted_at.is_(None),
            Category.is_active == True
        ).scalar()

        parent_count = db.query(func.count(Category.id)).filter(
            Category.deleted_at.is_(None),
            Category.parent_id.is_(None)
        ).scalar()

        child_count = total - parent_count

        # Top categories
        top_categories = db.query(
            Category.name,
            func.count(Product.id).label('product_count')
        ).join(Product).filter(
            Category.deleted_at.is_(None),
            Product.deleted_at.is_(None)
        ).group_by(Category.id, Category.name).order_by(
            func.count(Product.id).desc()
        ).limit(5).all()

        stats = {
            "total_categories": total,
            "active_categories": active,
            "parent_categories": parent_count,
            "child_categories": child_count,
            "top_categories": [
                {"name": name, "product_count": count}
                for name, count in top_categories
            ]
        }

        return ResponseHandler.success("Category statistics retrieved", stats)
