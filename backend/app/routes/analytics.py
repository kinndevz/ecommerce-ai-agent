from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.db.database import get_db
from app.models.user import User
from app.schemas.analytics.requests import AnalyticsPeriod, DateRangeParams
from app.schemas.analytics.responses import (
    OverviewResponse,
    RevenueResponse,
    OrdersResponse,
    TopSellingResponse,
    LowStockResponse,
    CustomersResponse,
    CategoryRevenueResponse,
    BrandRevenueResponse,
)
from app.services.analytics import AnalyticsService
from app.utils.deps import require_permission

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _build_params(
    period: Optional[AnalyticsPeriod],
    start_date: Optional[date],
    end_date: Optional[date],
) -> DateRangeParams:
    return DateRangeParams(period=period, start_date=start_date, end_date=end_date)


# Overview
@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(
        None, description="Custom range start (YYYY-MM-DD). Overrides period."),
    end_date: Optional[date] = Query(
        None, description="Custom range end (YYYY-MM-DD). Overrides period."),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    KPI overview cards: Revenue, Orders, New Customers, Avg Order Value.
    Each metric includes current value, previous period value, and growth rate.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_overview(db, params)


# Revenue
@router.get("/revenue", response_model=RevenueResponse)
def get_revenue(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Revenue analytics with daily trend line (excludes cancelled orders).
    Returns total_revenue, total_discount, net_revenue and a daily time-series.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_revenue(db, params)


# Orders
@router.get("/orders", response_model=OrdersResponse)
def get_orders(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Order analytics: daily trend, breakdown by status (pie chart),
    breakdown by payment method.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_orders(db, params)


# Products
@router.get("/products/top-selling", response_model=TopSellingResponse)
def get_top_selling_products(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(
        10, ge=1, le=50, description="Max number of products to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Top N selling products ranked by units sold within the period.
    Includes brand, category, revenue, and rating info.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_top_selling_products(db, params, limit=limit)


@router.get("/products/low-stock", response_model=LowStockResponse)
def get_low_stock_products(
    threshold: int = Query(10, ge=0, description="Stock quantity threshold"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Products at or below the stock threshold, sorted by quantity ascending.
    Useful for inventory alert widgets on the dashboard.
    """
    return AnalyticsService.get_low_stock_products(db, threshold=threshold, limit=limit)


# Customers
@router.get("/customers", response_model=CustomersResponse)
def get_customers(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    top_limit: int = Query(
        10, ge=1, le=50, description="Number of top spenders to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Customer analytics: total, new vs returning, daily growth trend,
    and top spenders within the period.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_customers(db, params, top_limit=top_limit)


# Categories
@router.get("/categories", response_model=CategoryRevenueResponse)
def get_category_revenue(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Revenue breakdown by product category (pie / donut chart data).
    Sorted by revenue descending with percentage share.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_category_revenue(db, params)


# Brands
@router.get("/brands", response_model=BrandRevenueResponse)
def get_brand_revenue(
    period: Optional[AnalyticsPeriod] = Query(AnalyticsPeriod.THIRTY_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission()),
):
    """
    Revenue breakdown by brand (horizontal bar chart data).
    Sorted by revenue descending with percentage share.
    """
    params = _build_params(period, start_date, end_date)
    return AnalyticsService.get_brand_revenue(db, params)
