import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.models.review import Review
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.core.enums import OrderStatus, PaymentStatus, NotificationType
from app.services.notifications import NotificationService
from app.services.notification_events import NotificationEventEmitter
from app.utils.responses import ResponseHandler


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

        review.deleted_at = datetime.now(timezone.utc)
        db.commit()

        ReviewService._refresh_product_rating(db, review.product_id)

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
