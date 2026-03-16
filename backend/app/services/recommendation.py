from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.utils.responses import ResponseHandler
from app.services.products.helpers import format_product_list_item


class RecommendationService:

    @staticmethod
    def recommend_from_history(
        db: Session,
        user_id: str,
        order_limit: int = 2,
        products_per_source: int = 5,
        max_results: int = 10,
    ):
        """
        Recommend products based on user's recent order history.

        Strategy:
        1. Fetch the N most recent orders
        2. Extract unique product_ids from those orders
        3. For each product, find related products (same category + overlapping concerns)
        4. Deduplicate, exclude already-purchased products, sort by rating
        5. Return top max_results
        """

        # ── Step 1: Get recent orders
        recent_orders = (
            db.query(Order)
            .options(joinedload(Order.items))
            .filter(
                Order.user_id == user_id,
                Order.status != "cancelled",
            )
            .order_by(desc(Order.created_at))
            .limit(order_limit)
            .all()
        )

        if not recent_orders:
            return ResponseHandler.success(
                message="No order history found",
                data=[],
                meta={"total": 0, "page": 1,
                      "limit": max_results, "total_pages": 0},
            )

        #  Step 2: Extract purchased product_ids
        purchased_product_ids: set[str] = set()
        source_product_ids: List[str] = []

        for order in recent_orders:
            for item in order.items:
                if item.product_id not in purchased_product_ids:
                    purchased_product_ids.add(item.product_id)
                    source_product_ids.append(item.product_id)

        #  Step 3: Load source products to get category/concerns
        source_products = (
            db.query(Product)
            .filter(
                Product.id.in_(source_product_ids),
                Product.deleted_at.is_(None),
            )
            .all()
        )

        #  Step 4: Find related products for each source
        seen_ids: set[str] = set(purchased_product_ids)
        candidates: List[Product] = []

        for source in source_products:
            query = (
                db.query(Product)
                .options(
                    joinedload(Product.brand),
                    joinedload(Product.category),
                    joinedload(Product.images),
                    joinedload(Product.tags),
                )
                .filter(
                    Product.id.notin_(seen_ids),
                    Product.category_id == source.category_id,
                    Product.deleted_at.is_(None),
                    Product.is_available == True,
                )
            )

            # Boost: overlap on concerns (if source has concerns)
            if source.concerns:
                query = query.filter(
                    Product.concerns.op("&&")(source.concerns)
                )

            related = (
                query.order_by(desc(Product.rating_average))
                .limit(products_per_source)
                .all()
            )

            for p in related:
                if p.id not in seen_ids:
                    seen_ids.add(p.id)
                    candidates.append(p)

        #  Step 5: Sort all candidates by rating, cap at  ─────
        candidates.sort(
            key=lambda p: float(p.rating_average or 0),
            reverse=True,
        )
        top = candidates[:max_results]

        products_data = [format_product_list_item(p) for p in top]

        return ResponseHandler.get_list_success(
            resource_name="Recommended Products",
            data=products_data,
            total=len(products_data),
            limit=max_results,
            page=1,
        )
