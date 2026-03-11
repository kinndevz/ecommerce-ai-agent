import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from openai import OpenAI
from app.models.review import Review
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.core.enums import OrderStatus, PaymentStatus, NotificationType
from app.services.notification_events import NotificationEventEmitter
from app.utils.responses import ResponseHandler
from app.core.redis_cache import redis_cache
from app.core.config import settings

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

SUMMARY_TTL = 7 * 24 * 3600  # 7 days
MAX_REVIEWS_FOR_SUMMARY = 50


def _summary_cache_key(slug: str) -> str:
    return f"product:{slug}:review_summary"


class ReviewService:

    @staticmethod
    def _format_review(review: Review):
        user = review.user
        return {
            "id": review.id,
            "product_id": review.product_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "title": review.title,
            "content": review.content,
            "verified_purchase": review.verified_purchase,
            "helpful_count": review.helpful_count,
            "skin_type": review.skin_type,
            "age_range": review.age_range,
            "created_at": review.created_at,
            "updated_at": review.updated_at,
            "user_name": user.full_name if user else None,
            "user_avatar": user.avatar if user else None
        }

    @staticmethod
    def _has_verified_purchase(db: Session, user_id: str, product_id: str) -> bool:
        order = db.query(Order).join(OrderItem).filter(
            Order.user_id == user_id,
            OrderItem.product_id == product_id,
            or_(
                Order.payment_status == PaymentStatus.PAID.value,
                Order.status == OrderStatus.DELIVERED.value
            )
        ).first()
        return order is not None

    @staticmethod
    def _refresh_product_rating(db: Session, product_id: str):
        average_rating = db.query(func.avg(Review.rating)).filter(
            Review.product_id == product_id,
            Review.deleted_at.is_(None)
        ).scalar() or 0
        review_count = db.query(func.count(Review.id)).filter(
            Review.product_id == product_id,
            Review.deleted_at.is_(None)
        ).scalar() or 0

        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.rating_average = float(average_rating)
            product.review_count = int(review_count)
            db.commit()

    @staticmethod
    def _generate_summary(product_name: str, reviews: list[Review]) -> str:
        review_texts = "\n".join([
            f"- [{r.rating}★] {f'({r.skin_type}) ' if r.skin_type else ''}{r.content}"
            for r in reviews
        ])

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a cosmetics review summarization assistant. "
                        "Your task is to write an honest, detailed summary based STRICTLY on the provided customer reviews. "
                        "NEVER fabricate or infer information that is not present in the reviews. "
                        "If there is insufficient information to conclude a point, omit it entirely. "
                        "Respond in Vietnamese, plain text, no markdown."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Product: {product_name}\n\n"
                        f"Customer reviews:\n{review_texts}\n\n"
                        "Write a detailed summary (6-10 sentences) covering:\n"
                        "1. Overall customer sentiment and rating trend\n"
                        "2. Key strengths and most praised aspects\n"
                        "3. Weaknesses or complaints (if any)\n"
                        "4. Skin types and age groups that found it suitable\n"
                        "5. Specific use cases or scenarios where the product performed well or poorly\n"
                        "Only include points that are clearly supported by the reviews."
                    )
                }
            ]
        )

        return response.choices[0].message.content.strip()

    @staticmethod
    def invalidate_summary_cache(slug: str):
        redis_cache.delete(_summary_cache_key(slug))

    @staticmethod
    def create_review(db: Session, user_id: str, product_id: str, data):
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        existing = db.query(Review).filter(
            Review.user_id == user_id,
            Review.product_id == product_id,
            Review.deleted_at.is_(None)
        ).first()
        if existing:
            ResponseHandler.already_exists_error("Review", "product")

        verified = ReviewService._has_verified_purchase(
            db, user_id, product_id)

        review = Review(
            id=str(uuid.uuid4()),
            product_id=product_id,
            user_id=user_id,
            rating=data.rating,
            title=data.title,
            content=data.content,
            skin_type=data.skin_type,
            age_range=data.age_range,
            verified_purchase=verified,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        ReviewService._refresh_product_rating(db, product_id)
        redis_cache.delete(_summary_cache_key(product.slug))

        reviewer = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        reviewer_name = reviewer.full_name if reviewer else "A customer"
        NotificationEventEmitter.emit(
            db,
            notification_type=NotificationType.REVIEW_RECEIVED,
            model=review,
            reviewer_name=reviewer_name,
            product_name=product.name,
            send_websocket=True
        )

        db.refresh(review)
        return ResponseHandler.create_success(
            "Review",
            review.id,
            ReviewService._format_review(review)
        )

    @staticmethod
    def update_review(db: Session, user_id: str, review_id: str, data):
        review = db.query(Review).options(
            joinedload(Review.user)
        ).filter(
            Review.id == review_id,
            Review.user_id == user_id,
            Review.deleted_at.is_(None)
        ).first()

        if not review:
            ResponseHandler.not_found_error("Review", review_id)

        update_fields = {
            "rating": data.rating,
            "title": data.title,
            "content": data.content,
            "skin_type": data.skin_type,
            "age_range": data.age_range
        }

        for field, value in update_fields.items():
            if value is not None:
                setattr(review, field, value)

        review.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(review)

        ReviewService._refresh_product_rating(db, review.product_id)

        return ResponseHandler.update_success(
            "Review",
            review.id,
            ReviewService._format_review(review)
        )

    @staticmethod
    def delete_review(db: Session, user_id: str, review_id: str):
        review = db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == user_id,
            Review.deleted_at.is_(None)
        ).first()

        if not review:
            ResponseHandler.not_found_error("Review", review_id)

        product = db.query(Product).filter(
            Product.id == review.product_id).first()

        review.deleted_at = datetime.now(timezone.utc)
        db.commit()

        ReviewService._refresh_product_rating(db, review.product_id)

        if product:
            redis_cache.delete(_summary_cache_key(product.slug))

        return ResponseHandler.delete_success("Review", review_id)

    @staticmethod
    def list_product_reviews(db: Session, product_id: str, page: int = 1, limit: int = 20):
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        query = db.query(Review).options(
            joinedload(Review.user)
        ).filter(
            Review.product_id == product_id,
            Review.deleted_at.is_(None)
        )

        total = query.count()
        reviews = query.order_by(Review.created_at.desc()).offset(
            (page - 1) * limit).limit(limit).all()

        data = [ReviewService._format_review(review) for review in reviews]

        return ResponseHandler.get_list_success(
            "Reviews",
            data=data,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def get_rating_summary(db: Session, product_id: str):
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        return ResponseHandler.success(
            message="Product rating summary retrieved successfully",
            data={
                "average_rating": float(product.rating_average or 0),
                "review_count": int(product.review_count or 0)
            }
        )

    @staticmethod
    def get_reviews_by_slug(db: Session, slug: str, page: int = 1, limit: int = 20):
        product = db.query(Product).filter(
            Product.slug == slug,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", slug)

        query = db.query(Review).options(
            joinedload(Review.user)
        ).filter(
            Review.product_id == product.id,
            Review.deleted_at.is_(None)
        )

        total = query.count()
        reviews = (
            query
            .order_by(Review.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        data = [ReviewService._format_review(r) for r in reviews]

        return ResponseHandler.get_list_success(
            "Reviews",
            data=data,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def get_summary_by_slug(db: Session, slug: str):
        product = db.query(Product).filter(
            Product.slug == slug,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", slug)

        cached = redis_cache.get(_summary_cache_key(slug))
        if cached:
            return ResponseHandler.success(
                message="Review summary retrieved successfully",
                data={**cached, "source": "cache"}
            )

        reviews = (
            db.query(Review)
            .filter(
                Review.product_id == product.id,
                Review.deleted_at.is_(None)
            )
            .order_by(Review.helpful_count.desc(), Review.created_at.desc())
            .limit(MAX_REVIEWS_FOR_SUMMARY)
            .all()
        )

        if not reviews:
            return ResponseHandler.success(
                message="No reviews available for this product",
                data={
                    "slug": slug,
                    "summary": None,
                    "average_rating": float(product.rating_average or 0),
                    "review_count": 0,
                    "source": "generated"
                }
            )

        summary_text = ReviewService._generate_summary(
            product_name=product.name,
            reviews=reviews
        )

        result = {
            "slug": slug,
            "summary": summary_text,
            "average_rating": float(product.rating_average or 0),
            "review_count": int(product.review_count or 0),
        }
        redis_cache.set(_summary_cache_key(slug),
                        result, ttl_seconds=SUMMARY_TTL)

        return ResponseHandler.success(
            message="Review summary generated successfully",
            data={**result, "source": "generated"}
        )
