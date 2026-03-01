from pydantic import BaseModel
from typing import Optional, List


class KPIMetric(BaseModel):
    """Single KPI card: current value vs. previous period."""
    current: float
    previous: float
    growth_rate: float          # percentage, positive = growth
    formatted_current: str      # e.g. "12,500,000 ₫" or "1,234"


class TimeSeriesPoint(BaseModel):
    """One data point on a time-series chart."""
    date: str                   # ISO date string "2024-01-01"
    value: float


class BreakdownItem(BaseModel):
    """One slice in a pie / bar breakdown chart."""
    label: str
    value: float
    percentage: float


# Overview
class OverviewData(BaseModel):
    revenue: KPIMetric
    orders: KPIMetric
    customers: KPIMetric
    avg_order_value: KPIMetric


class OverviewResponse(BaseModel):
    success: bool
    message: str
    data: OverviewData


# Revenue
class RevenueData(BaseModel):
    total_revenue: float
    total_discount: float
    net_revenue: float
    trend: List[TimeSeriesPoint]


class RevenueResponse(BaseModel):
    success: bool
    message: str
    data: RevenueData


# Orders
class OrderStatusBreakdown(BaseModel):
    status: str
    count: int
    percentage: float


class OrdersData(BaseModel):
    total_orders: int
    trend: List[TimeSeriesPoint]
    by_status: List[OrderStatusBreakdown]
    by_payment_method: List[BreakdownItem]


class OrdersResponse(BaseModel):
    success: bool
    message: str
    data: OrdersData


# Products
class TopSellingProduct(BaseModel):
    product_id: str
    product_name: str
    brand_name: str
    category_name: str
    total_quantity_sold: int
    total_revenue: float
    avg_rating: float
    review_count: int


class LowStockProduct(BaseModel):
    product_id: str
    product_name: str
    sku: Optional[str]
    stock_quantity: int
    is_available: bool


class TopSellingResponse(BaseModel):
    success: bool
    message: str
    data: List[TopSellingProduct]


class LowStockResponse(BaseModel):
    success: bool
    message: str
    data: List[LowStockProduct]


# Customers
class TopSpender(BaseModel):
    user_id: str
    full_name: str
    email: str
    total_orders: int
    total_spent: float


class CustomersData(BaseModel):
    total_customers: int
    new_customers: int
    returning_customers: int
    growth_trend: List[TimeSeriesPoint]
    top_spenders: List[TopSpender]


class CustomersResponse(BaseModel):
    success: bool
    message: str
    data: CustomersData


# Categories
class CategoryRevenueData(BaseModel):
    breakdown: List[BreakdownItem]


class CategoryRevenueResponse(BaseModel):
    success: bool
    message: str
    data: CategoryRevenueData


# Brands
class BrandRevenueData(BaseModel):
    breakdown: List[BreakdownItem]


class BrandRevenueResponse(BaseModel):
    success: bool
    message: str
    data: BrandRevenueData
