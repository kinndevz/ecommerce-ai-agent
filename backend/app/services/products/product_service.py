import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc

from app.models.product import Product, Tag, ProductVariant, ProductImage
from app.models.brand import Brand
from app.models.category import Category
from app.utils.responses import ResponseHandler
from app.schemas.products import (
    ProductCreateRequest,
    ProductUpdateRequest,
    AddTagsRequest,
    UpdateStockRequest
)
from .helpers import format_product_list_item, format_product_detail
from app.elastic.service import search_products_query


class ProductService:
    @staticmethod
    def search_products_with_es(keyword, min_price, max_price, limit, page):
        try:
            response = search_products_query(
                keyword, min_price, max_price, limit, page)

            total = response['hits']['total']['value']
            hits = response['hits']['hits']
            products_data = [hit['_source'] for hit in hits]
            total_pages = (total + limit - 1) // limit if limit > 0 else 1

            return ResponseHandler.success(
                message="Products retrieved successfully",
                data={
                    "products": products_data,
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "total_pages": total_pages
                }
            )
        except Exception as e:
            return ResponseHandler.error_response(message=str(e))

    @staticmethod
    def get_all_products(db: Session, filters: dict, page: int = 1, limit: int = 20):
        """Get all products with filters"""

        query = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.tags)
        ).filter(Product.deleted_at.is_(None))

        # Search by name only
        if filters.get('search'):
            search = f"%{filters['search']}%"
            query = query.filter(Product.name.ilike(search))

        if filters.get('brand_id'):
            query = query.filter(Product.brand_id == filters['brand_id'])

        if filters.get('category_id'):
            query = query.filter(Product.category_id == filters['category_id'])

        if filters.get('min_price'):
            query = query.filter(Product.price >= filters['min_price'])

        if filters.get('max_price'):
            query = query.filter(Product.price <= filters['max_price'])

        if filters.get('skin_types'):
            query = query.filter(
                Product.skin_types.overlap(filters['skin_types']))

        if filters.get('concerns'):
            query = query.filter(Product.concerns.overlap(filters['concerns']))

        if filters.get('benefits'):
            query = query.filter(Product.benefits.overlap(filters['benefits']))

        if filters.get('tags'):
            query = query.join(Product.tags).filter(
                Tag.slug.in_(filters['tags']))

        if filters.get('is_featured') is not None:
            query = query.filter(Product.is_featured == filters['is_featured'])

        if filters.get('is_available') is not None:
            query = query.filter(Product.is_available ==
                                 filters['is_available'])

        # Sorting
        sort_by = filters.get('sort_by', 'created_at')
        sort_order = filters.get('sort_order', 'desc')

        sort_column = {
            'created_at': Product.created_at,
            'price': Product.price,
            'rating': Product.rating_average,
            'popularity': Product.views_count,
            'name': Product.name
        }.get(sort_by, Product.created_at)

        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Pagination
        total = query.count()
        products = query.offset((page - 1) * limit).limit(limit).all()

        products_data = [format_product_list_item(p) for p in products]
        total_pages = (total + limit - 1) // limit

        return ResponseHandler.success(
            message="Products retrieved successfully",
            data={
                "products": products_data,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }
        )

    @staticmethod
    def get_product_by_id(db: Session, product_id: str):
        """Get product detail"""

        product = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.tags)
        ).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        product_dict = format_product_detail(product)

        return ResponseHandler.get_single_success("Product", product_id, product_dict)

    @staticmethod
    def create_product(db: Session, data: ProductCreateRequest, created_by_id: str):
        #  VALIDATIONS
        if db.query(Product).filter(
            Product.slug == data.slug,
            Product.deleted_at.is_(None)
        ).first():
            ResponseHandler.already_exists_error("Product", "slug")

        if db.query(Product).filter(
            Product.sku == data.sku,
            Product.deleted_at.is_(None)
        ).first():
            ResponseHandler.already_exists_error("Product", "sku")

        if data.variants:
            variant_skus = [v.sku for v in data.variants]
            existing_variants = db.query(ProductVariant).filter(
                ProductVariant.sku.in_(variant_skus),
                ProductVariant.deleted_at.is_(None)
            ).first()

            if existing_variants:
                ResponseHandler.already_exists_error("Variant", "sku")

        brand = db.query(Brand).filter(
            Brand.id == data.brand_id,
            Brand.deleted_at.is_(None)
        ).first()
        if not brand:
            ResponseHandler.not_found_error("Brand", data.brand_id)

        category = db.query(Category).filter(
            Category.id == data.category_id,
            Category.deleted_at.is_(None)
        ).first()
        if not category:
            ResponseHandler.not_found_error("Category", data.category_id)

        #  CREATE
        try:
            # Create Product
            now = datetime.now(timezone.utc)
            product = Product(
                id=str(uuid.uuid4()),
                brand_id=data.brand_id,
                category_id=data.category_id,
                name=data.name,
                slug=data.slug,
                sku=data.sku,
                short_description=data.short_description,
                description=data.description,
                how_to_use=data.how_to_use,
                price=data.price,
                sale_price=data.sale_price,
                stock_quantity=data.stock_quantity,
                is_available=True,
                is_featured=data.is_featured,
                skin_types=[
                    st.value for st in data.skin_types] if data.skin_types else None,
                concerns=[
                    c.value for c in data.concerns] if data.concerns else None,
                benefits=[
                    b.value for b in data.benefits] if data.benefits else None,
                ingredients=data.ingredients,
                created_by_id=created_by_id,
                created_at=now,
                updated_at=now
            )

            # Add Tags
            if data.tag_ids:
                tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
                product.tags.extend(tags)
                for tag in tags:
                    tag.usage_count += 1

            db.add(product)
            db.flush()

            # Create Product Images
            if data.images:
                for img_data in data.images:
                    image = ProductImage(
                        id=str(uuid.uuid4()),
                        product_id=product.id,
                        image_url=img_data.image_url,
                        alt_text=img_data.alt_text or data.name,
                        is_primary=img_data.is_primary,
                        display_order=img_data.display_order,
                        created_at=now,
                        updated_at=now
                    )
                    db.add(image)

            # Create Product Variants
            if data.variants:
                for variant_data in data.variants:
                    variant = ProductVariant(
                        id=str(uuid.uuid4()),
                        product_id=product.id,
                        name=variant_data.name,
                        sku=variant_data.sku,
                        price=variant_data.price,
                        sale_price=variant_data.sale_price,
                        stock_quantity=variant_data.stock_quantity,
                        is_available=True,
                        size=variant_data.size,
                        size_unit=variant_data.size_unit,
                        color=variant_data.color,
                        shade_name=variant_data.shade_name,
                        created_by_id=created_by_id,
                        created_at=now,
                        updated_at=now
                    )
                    db.add(variant)

            db.commit()
            db.expire(product)

            product = db.query(Product).options(
                joinedload(Product.images),
                joinedload(Product.variants),
                joinedload(Product.tags),
                joinedload(Product.brand),
                joinedload(Product.category)
            ).filter(Product.id == product.id).first()
            product_dict = format_product_detail(product)
            return ResponseHandler.create_success("Product", product.id, product_dict)

        except Exception as e:
            db.rollback()
            print(f"Failed to create product: {e}")
            raise

    @staticmethod
    def update_product(db: Session, product_id: str, data: ProductUpdateRequest, updated_by_id: str):
        """Update product"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        # Validations
        if data.slug and data.slug != product.slug:
            if db.query(Product).filter(Product.slug == data.slug, Product.id != product_id, Product.deleted_at.is_(None)).first():
                ResponseHandler.already_exists_error("Product", "slug")

        if data.sku and data.sku != product.sku:
            if db.query(Product).filter(Product.sku == data.sku, Product.id != product_id, Product.deleted_at.is_(None)).first():
                ResponseHandler.already_exists_error("Product", "sku")

        if data.brand_id:
            if not db.query(Brand).filter(Brand.id == data.brand_id, Brand.deleted_at.is_(None)).first():
                ResponseHandler.not_found_error("Brand", data.brand_id)

        if data.category_id:
            if not db.query(Category).filter(Category.id == data.category_id, Category.deleted_at.is_(None)).first():
                ResponseHandler.not_found_error("Category", data.category_id)

        # Update fields
        update_data = data.model_dump(exclude_unset=True, exclude={'tag_ids'})
        if 'skin_types' in update_data and update_data['skin_types']:
            update_data['skin_types'] = [
                st.value for st in update_data['skin_types']]
        if 'concerns' in update_data and update_data['concerns']:
            update_data['concerns'] = [
                c.value for c in update_data['concerns']]
        if 'benefits' in update_data and update_data['benefits']:
            update_data['benefits'] = [
                b.value for b in update_data['benefits']]
        for key, value in update_data.items():
            setattr(product, key, value)

        # Update tags (replace all)
        if data.tag_ids is not None:
            for tag in product.tags:
                tag.usage_count = max(0, tag.usage_count - 1)

            product.tags = []
            if data.tag_ids:
                tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
                product.tags.extend(tags)
                for tag in tags:
                    tag.usage_count += 1

        product.updated_by_id = updated_by_id
        product.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(product)

        return ResponseHandler.update_success("Product", product_id, product)

    @staticmethod
    def delete_product(db: Session, product_id: str, deleted_by_id: str):
        """Soft delete"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        for tag in product.tags:
            tag.usage_count = max(0, tag.usage_count - 1)

        product.deleted_at = datetime.now(timezone.utc)
        product.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Product", product_id)

    @staticmethod
    def toggle_availability(db: Session, product_id: str, updated_by_id: str):
        """Toggle availability"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        product.is_available = not product.is_available
        product.updated_by_id = updated_by_id
        product.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(product)

        status = "available" if product.is_available else "unavailable"

        return ResponseHandler.success(
            message=f"Product changed to {status}",
            data=product
        )

    @staticmethod
    def toggle_featured(db: Session, product_id: str, updated_by_id: str):
        """Toggle featured"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        product.is_featured = not product.is_featured
        product.updated_by_id = updated_by_id
        product.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(product)

        status = "featured" if product.is_featured else "not featured"

        return ResponseHandler.success(
            message=f"Product changed to {status}",
            data=product
        )

    @staticmethod
    def get_product_stats(db: Session):
        """Get statistics"""

        total = db.query(func.count(Product.id)).filter(
            Product.deleted_at.is_(None)).scalar()
        available = db.query(func.count(Product.id)).filter(
            Product.deleted_at.is_(None), Product.is_available == True).scalar()
        out_of_stock = db.query(func.count(Product.id)).filter(
            Product.deleted_at.is_(None), Product.stock_quantity == 0).scalar()
        featured = db.query(func.count(Product.id)).filter(
            Product.deleted_at.is_(None), Product.is_featured == True).scalar()
        avg_price = db.query(func.avg(Product.price)).filter(
            Product.deleted_at.is_(None)).scalar() or 0

        top_rated = db.query(
            Product.name, Product.rating_average, Product.review_count
        ).filter(
            Product.deleted_at.is_(None), Product.review_count > 0
        ).order_by(
            desc(Product.rating_average), desc(Product.review_count)
        ).limit(5).all()

        top_viewed = db.query(
            Product.name, Product.views_count
        ).filter(
            Product.deleted_at.is_(None)
        ).order_by(desc(Product.views_count)).limit(5).all()

        stats = {
            "total_products": total,
            "available_products": available,
            "out_of_stock": out_of_stock,
            "featured_products": featured,
            "average_price": float(avg_price),
            "top_rated_products": [
                {"name": name, "rating": float(rating), "reviews": count}
                for name, rating, count in top_rated
            ],
            "top_viewed_products": [
                {"name": name, "views": views}
                for name, views in top_viewed
            ]
        }

        return ResponseHandler.success("Statistics retrieved", stats)

    @staticmethod
    def add_tags(db: Session, product_id: str, data: AddTagsRequest):
        """Add tags"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()

        if len(tags) != len(data.tag_ids):
            ResponseHandler.bad_request("One or more tags not found")

        existing_tag_ids = {tag.id for tag in product.tags}
        new_tags = [tag for tag in tags if tag.id not in existing_tag_ids]

        product.tags.extend(new_tags)

        for tag in new_tags:
            tag.usage_count += 1

        db.commit()

        return ResponseHandler.success(
            message=f"Added {len(new_tags)} tags",
            data=product
        )

    @staticmethod
    def remove_tag(db: Session, product_id: str, tag_id: str):
        """Remove tag"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            ResponseHandler.not_found_error("Tag", tag_id)

        if tag in product.tags:
            product.tags.remove(tag)
            tag.usage_count = max(0, tag.usage_count - 1)
            db.commit()
            message = "Tag removed"
        else:
            message = "Tag was not associated with product"

        return ResponseHandler.success(message=message, data=product)

    @staticmethod
    def update_stock(db: Session, product_id: str, data: UpdateStockRequest, updated_by_id: str):
        """Update stock"""

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        product.stock_quantity = data.quantity
        product.updated_by_id = updated_by_id
        product.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(product)

        return ResponseHandler.success(
            message=f"Stock updated to {data.quantity}",
            data=product
        )
