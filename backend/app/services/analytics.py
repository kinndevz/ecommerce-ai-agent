from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.order import Order, OrderItem
from app.core.enums import OrderStatus, PaymentStatus


class AnalyticsService:
    @staticmethod
    def _get_date_range(start_date: datetime | None, end_date: datetime | None):
        if end_date is None:
            end_date = datetime.now(timezone.utc)
        if start_date is None:
            start_date = end_date - timedelta(days=30)
        return start_date, end_date

    @staticmethod
    def _paid_order_filter():
        return or_(
            Order.payment_status == PaymentStatus.PAID.value,
            Order.status == OrderStatus.DELIVERED.value
        )

    @staticmethod
    def get_sales_summary(db: Session, start_date: datetime | None, end_date: datetime | None):
        start_date, end_date = AnalyticsService._get_date_range(
            start_date, end_date)

        base_query = db.query(Order).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            AnalyticsService._paid_order_filter()
        )

        total_orders = base_query.count()
        total_revenue = db.query(func.sum(Order.total)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            AnalyticsService._paid_order_filter()
        ).scalar() or 0

        average_order_value = float(total_revenue) / \
            total_orders if total_orders else 0

        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "average_order_value": float(average_order_value)
        }

    @staticmethod
    def get_sales_trend(db: Session, start_date: datetime | None, end_date: datetime | None):
        start_date, end_date = AnalyticsService._get_date_range(
            start_date, end_date)

        rows = db.query(
            func.date(Order.created_at).label("day"),
            func.sum(Order.total).label("total_revenue"),
            func.count(Order.id).label("total_orders")
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            AnalyticsService._paid_order_filter()
        ).group_by(
            func.date(Order.created_at)
        ).order_by(
            func.date(Order.created_at)
        ).all()

        points = []
        for row in rows:
            points.append({
                "date": row.day.isoformat(),
                "total_revenue": float(row.total_revenue or 0),
                "total_orders": int(row.total_orders or 0)
            })

        return {"points": points}

    @staticmethod
    def get_top_products(db: Session, start_date: datetime | None, end_date: datetime | None, limit: int = 10):
        start_date, end_date = AnalyticsService._get_date_range(
            start_date, end_date)

        rows = db.query(
            OrderItem.product_id.label("product_id"),
            OrderItem.product_name.label("product_name"),
            func.sum(OrderItem.subtotal).label("total_revenue"),
            func.sum(OrderItem.quantity).label("total_units")
        ).join(
            Order, OrderItem.order_id == Order.id
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            AnalyticsService._paid_order_filter()
        ).group_by(
            OrderItem.product_id, OrderItem.product_name
        ).order_by(
            func.sum(OrderItem.subtotal).desc()
        ).limit(limit).all()

        items = []
        for row in rows:
            items.append({
                "product_id": row.product_id,
                "product_name": row.product_name,
                "total_revenue": float(row.total_revenue or 0),
                "total_units": int(row.total_units or 0)
            })

        return {"items": items}
