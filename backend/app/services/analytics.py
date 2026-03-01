from datetime import datetime, timedelta
from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.models.brand import Brand
from app.models.category import Category
from app.schemas.analytics.requests import DateRangeParams
from app.schemas.analytics.responses import (
    KPIMetric,
    TimeSeriesPoint,
    BreakdownItem,
    OverviewData,
    RevenueData,
    OrdersData,
    OrderStatusBreakdown,
    TopSellingProduct,
    LowStockProduct,
    CustomersData,
    TopSpender,
    CategoryRevenueData,
    BrandRevenueData,
)
from app.utils.responses import ResponseHandler


# Internal helpers

def _to_float(value) -> float:
    if value is None:
        return 0.0
    return float(value)


def _growth_rate(current: float, previous: float) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 2)


def _fmt_currency(value: float) -> str:
    return f"{int(value):,} ₫"


def _fmt_number(value: float) -> str:
    return f"{int(value):,}"


def _previous_range(start: datetime, end: datetime) -> tuple[datetime, datetime]:
    """Mirror the current period into the past for comparison."""
    delta = end - start
    return start - delta, start


def _date_series(start: datetime, end: datetime) -> List[str]:
    """Generate list of ISO date strings between start and end."""
    days = []
    current = start.date()
    while current <= end.date():
        days.append(current.isoformat())
        current += timedelta(days=1)
    return days


def _build_trend(
    raw: List,          # list of (date_str, value) rows from DB
    date_series: List[str],
) -> List[TimeSeriesPoint]:
    """Fill gaps in time series with 0 so frontend always has continuous data."""
    lookup = {row[0]: _to_float(row[1]) for row in raw}
    return [
        TimeSeriesPoint(date=d, value=lookup.get(d, 0.0))
        for d in date_series
    ]


def _build_breakdown(rows: List, total: float) -> List[BreakdownItem]:
    """Convert (label, value) rows → BreakdownItem list sorted desc."""
    items = []
    for label, value in rows:
        v = _to_float(value)
        items.append(BreakdownItem(
            label=str(label),
            value=v,
            percentage=round(v / total * 100, 2) if total > 0 else 0.0,
        ))
    return sorted(items, key=lambda x: x.value, reverse=True)


# Analytics Service
class AnalyticsService:

    #  Overview
    @staticmethod
    def get_overview(db: Session, params: DateRangeParams):
        start, end = params.resolve()
        prev_start, prev_end = _previous_range(start, end)

        def _revenue(s, e):
            row = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
                Order.status != "cancelled",
                Order.created_at >= s,
                Order.created_at <= e,
            ).scalar()
            return _to_float(row)

        def _orders(s, e):
            return db.query(func.count(Order.id)).filter(
                Order.created_at >= s,
                Order.created_at <= e,
            ).scalar() or 0

        def _new_customers(s, e):
            return db.query(func.count(User.id)).filter(
                User.created_at >= s,
                User.created_at <= e,
                User.deleted_at.is_(None),
            ).scalar() or 0

        cur_rev = _revenue(start, end)
        prv_rev = _revenue(prev_start, prev_end)

        cur_ord = _orders(start, end)
        prv_ord = _orders(prev_start, prev_end)

        cur_cus = _new_customers(start, end)
        prv_cus = _new_customers(prev_start, prev_end)

        cur_aov = cur_rev / cur_ord if cur_ord else 0.0
        prv_aov = prv_rev / prv_ord if prv_ord else 0.0

        data = OverviewData(
            revenue=KPIMetric(
                current=cur_rev,
                previous=prv_rev,
                growth_rate=_growth_rate(cur_rev, prv_rev),
                formatted_current=_fmt_currency(cur_rev),
            ),
            orders=KPIMetric(
                current=float(cur_ord),
                previous=float(prv_ord),
                growth_rate=_growth_rate(cur_ord, prv_ord),
                formatted_current=_fmt_number(cur_ord),
            ),
            customers=KPIMetric(
                current=float(cur_cus),
                previous=float(prv_cus),
                growth_rate=_growth_rate(cur_cus, prv_cus),
                formatted_current=_fmt_number(cur_cus),
            ),
            avg_order_value=KPIMetric(
                current=cur_aov,
                previous=prv_aov,
                growth_rate=_growth_rate(cur_aov, prv_aov),
                formatted_current=_fmt_currency(cur_aov),
            ),
        )
        return ResponseHandler.success("Overview retrieved successfully", data=data)

    #  Revenue

    @staticmethod
    def get_revenue(db: Session, params: DateRangeParams):
        start, end = params.resolve()
        dates = _date_series(start, end)

        # Aggregate totals
        row = db.query(
            func.coalesce(func.sum(Order.total), 0),
            func.coalesce(func.sum(Order.discount), 0),
        ).filter(
            Order.status != "cancelled",
            Order.created_at >= start,
            Order.created_at <= end,
        ).first()

        total_revenue = _to_float(row[0])
        total_discount = _to_float(row[1])
        net_revenue = total_revenue - total_discount

        # Daily revenue trend
        daily_rows = db.query(
            func.date(Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        ).filter(
            Order.status != "cancelled",
            Order.created_at >= start,
            Order.created_at <= end,
        ).group_by(func.date(Order.created_at)).all()

        trend = _build_trend(
            [(str(r.day), r.revenue) for r in daily_rows],
            dates,
        )

        data = RevenueData(
            total_revenue=total_revenue,
            total_discount=total_discount,
            net_revenue=net_revenue,
            trend=trend,
        )
        return ResponseHandler.success("Revenue retrieved successfully", data=data)

    #  Orders

    @staticmethod
    def get_orders(db: Session, params: DateRangeParams):
        start, end = params.resolve()
        dates = _date_series(start, end)

        total_orders = db.query(func.count(Order.id)).filter(
            Order.created_at >= start,
            Order.created_at <= end,
        ).scalar() or 0

        # Daily trend
        daily_rows = db.query(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("count"),
        ).filter(
            Order.created_at >= start,
            Order.created_at <= end,
        ).group_by(func.date(Order.created_at)).all()

        trend = _build_trend(
            [(str(r.day), r.count) for r in daily_rows],
            dates,
        )

        # By status
        status_rows = db.query(
            Order.status,
            func.count(Order.id).label("count"),
        ).filter(
            Order.created_at >= start,
            Order.created_at <= end,
        ).group_by(Order.status).all()

        by_status = [
            OrderStatusBreakdown(
                status=r.status,
                count=r.count,
                percentage=round(r.count / total_orders * 100,
                                 2) if total_orders else 0.0,
            )
            for r in status_rows
        ]

        # By payment method
        pm_rows = db.query(
            Order.payment_method,
            func.count(Order.id).label("count"),
        ).filter(
            Order.created_at >= start,
            Order.created_at <= end,
            Order.payment_method.isnot(None),
        ).group_by(Order.payment_method).all()

        by_payment_method = _build_breakdown(
            [(r.payment_method, r.count) for r in pm_rows],
            total=total_orders,
        )

        data = OrdersData(
            total_orders=total_orders,
            trend=trend,
            by_status=by_status,
            by_payment_method=by_payment_method,
        )
        return ResponseHandler.success("Orders analytics retrieved successfully", data=data)

    #  Products – Top Selling

    @staticmethod
    def get_top_selling_products(
        db: Session,
        params: DateRangeParams,
        limit: int = 10,
    ):
        start, end = params.resolve()

        rows = (
            db.query(
                Product.id,
                Product.name,
                Brand.name.label("brand_name"),
                Category.name.label("category_name"),
                func.sum(OrderItem.quantity).label("qty_sold"),
                func.sum(OrderItem.subtotal).label("revenue"),
                Product.rating_average,
                Product.review_count,
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .join(Brand, Brand.id == Product.brand_id)
            .join(Category, Category.id == Product.category_id)
            .filter(
                Order.status != "cancelled",
                Order.created_at >= start,
                Order.created_at <= end,
            )
            .group_by(
                Product.id,
                Product.name,
                Brand.name,
                Category.name,
                Product.rating_average,
                Product.review_count,
            )
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
            .all()
        )

        data = [
            TopSellingProduct(
                product_id=r.id,
                product_name=r.name,
                brand_name=r.brand_name,
                category_name=r.category_name,
                total_quantity_sold=int(r.qty_sold),
                total_revenue=_to_float(r.revenue),
                avg_rating=_to_float(r.rating_average),
                review_count=r.review_count or 0,
            )
            for r in rows
        ]
        return ResponseHandler.success("Top selling products retrieved successfully", data=data)

    #  Products – Low Stock

    @staticmethod
    def get_low_stock_products(db: Session, threshold: int = 10, limit: int = 20):
        rows = (
            db.query(Product)
            .filter(
                Product.stock_quantity <= threshold,
                Product.deleted_at.is_(None),
            )
            .order_by(Product.stock_quantity.asc())
            .limit(limit)
            .all()
        )

        data = [
            LowStockProduct(
                product_id=p.id,
                product_name=p.name,
                sku=p.sku,
                stock_quantity=p.stock_quantity,
                is_available=p.is_available,
            )
            for p in rows
        ]
        return ResponseHandler.success("Low stock products retrieved successfully", data=data)

    #  Customers

    @staticmethod
    def get_customers(db: Session, params: DateRangeParams, top_limit: int = 10):
        start, end = params.resolve()
        dates = _date_series(start, end)

        total_customers = db.query(func.count(User.id)).filter(
            User.deleted_at.is_(None),
        ).scalar() or 0

        new_customers = db.query(func.count(User.id)).filter(
            User.created_at >= start,
            User.created_at <= end,
            User.deleted_at.is_(None),
        ).scalar() or 0

        # Returning = placed more than 1 order total (all time)
        returning_customers = db.query(func.count()).filter(
            db.query(func.count(Order.id))
            .filter(Order.user_id == User.id)
            .correlate(User)
            .as_scalar() > 1,
            User.deleted_at.is_(None),
        ).scalar() or 0

        # Daily new customer trend
        daily_rows = db.query(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("count"),
        ).filter(
            User.created_at >= start,
            User.created_at <= end,
            User.deleted_at.is_(None),
        ).group_by(func.date(User.created_at)).all()

        growth_trend = _build_trend(
            [(str(r.day), r.count) for r in daily_rows],
            dates,
        )

        # Top spenders within period
        spender_rows = (
            db.query(
                User.id,
                User.full_name,
                User.email,
                func.count(Order.id).label("order_count"),
                func.sum(Order.total).label("total_spent"),
            )
            .join(Order, Order.user_id == User.id)
            .filter(
                Order.status != "cancelled",
                Order.created_at >= start,
                Order.created_at <= end,
                User.deleted_at.is_(None),
            )
            .group_by(User.id, User.full_name, User.email)
            .order_by(func.sum(Order.total).desc())
            .limit(top_limit)
            .all()
        )

        top_spenders = [
            TopSpender(
                user_id=r.id,
                full_name=r.full_name,
                email=r.email,
                total_orders=r.order_count,
                total_spent=_to_float(r.total_spent),
            )
            for r in spender_rows
        ]

        data = CustomersData(
            total_customers=total_customers,
            new_customers=new_customers,
            returning_customers=returning_customers,
            growth_trend=growth_trend,
            top_spenders=top_spenders,
        )
        return ResponseHandler.success("Customers analytics retrieved successfully", data=data)

    #  Categories

    @staticmethod
    def get_category_revenue(db: Session, params: DateRangeParams):
        start, end = params.resolve()

        rows = (
            db.query(
                Category.name,
                func.sum(OrderItem.subtotal).label("revenue"),
            )
            .join(Product, Product.category_id == Category.id)
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                Order.status != "cancelled",
                Order.created_at >= start,
                Order.created_at <= end,
            )
            .group_by(Category.name)
            .order_by(func.sum(OrderItem.subtotal).desc())
            .all()
        )

        total = sum(_to_float(r.revenue) for r in rows)
        breakdown = _build_breakdown(
            [(r.name, r.revenue) for r in rows], total)

        data = CategoryRevenueData(breakdown=breakdown)
        return ResponseHandler.success("Category revenue retrieved successfully", data=data)

    #  Brands

    @staticmethod
    def get_brand_revenue(db: Session, params: DateRangeParams):
        start, end = params.resolve()

        rows = (
            db.query(
                Brand.name,
                func.sum(OrderItem.subtotal).label("revenue"),
            )
            .join(Product, Product.brand_id == Brand.id)
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                Order.status != "cancelled",
                Order.created_at >= start,
                Order.created_at <= end,
            )
            .group_by(Brand.name)
            .order_by(func.sum(OrderItem.subtotal).desc())
            .all()
        )

        total = sum(_to_float(r.revenue) for r in rows)
        breakdown = _build_breakdown(
            [(r.name, r.revenue) for r in rows], total)

        data = BrandRevenueData(breakdown=breakdown)
        return ResponseHandler.success("Brand revenue retrieved successfully", data=data)
