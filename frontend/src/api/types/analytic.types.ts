export enum AnalyticsPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  ONE_YEAR = '1y',
}

export interface DateRangeParams {
  period?: AnalyticsPeriod | null
  start_date?: string | null // Định dạng ISO: YYYY-MM-DD
  end_date?: string | null // Định dạng ISO: YYYY-MM-DD
}

// BASE COMPONENTS
export interface KPIMetric {
  current: number
  previous: number
  growth_rate: number
  formatted_current: string
}

export interface TimeSeriesPoint {
  date: string // ISO date string "2024-01-01"
  value: number
}

export interface BreakdownItem {
  label: string
  value: number
  percentage: number
}

// OVERVIEW
export interface OverviewData {
  revenue: KPIMetric
  orders: KPIMetric
  customers: KPIMetric
  avg_order_value: KPIMetric
}

// REVENUE
export interface RevenueData {
  total_revenue: number
  total_discount: number
  net_revenue: number
  trend: TimeSeriesPoint[]
}

// ORDERS
export interface OrderStatusBreakdown {
  status: string
  count: number
  percentage: number
}

export interface OrdersData {
  total_orders: number
  trend: TimeSeriesPoint[]
  by_status: OrderStatusBreakdown[]
  by_payment_method: BreakdownItem[]
}

// PRODUCTS
export interface TopSellingProduct {
  product_id: string
  product_name: string
  brand_name: string
  category_name: string
  total_quantity_sold: number
  total_revenue: number
  avg_rating: number
  review_count: number
}

export interface LowStockProduct {
  product_id: string
  product_name: string
  sku: string | null
  stock_quantity: number
  is_available: boolean
}

// CUSTOMERS
export interface TopSpender {
  user_id: string
  full_name: string
  email: string
  total_orders: number
  total_spent: number
}

export interface CustomersData {
  total_customers: number
  new_customers: number
  returning_customers: number
  growth_trend: TimeSeriesPoint[]
  top_spenders: TopSpender[]
}

// CATEGORIES & BRANDS
export interface CategoryRevenueData {
  breakdown: BreakdownItem[]
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface BrandRevenueData {
  breakdown: BreakdownItem[]
}

export interface CategoryRevenueResponse
  extends ApiSuccessResponse<CategoryRevenueData> {}

export interface BrandRevenueResponse
  extends ApiSuccessResponse<BrandRevenueData> {}

export interface CustomersResponse extends ApiSuccessResponse<CustomersData> {}

export interface TopSellingResponse
  extends ApiSuccessResponse<TopSellingProduct[]> {}

export interface LowStockResponse
  extends ApiSuccessResponse<LowStockProduct[]> {}

export interface OrdersResponse extends ApiSuccessResponse<OrdersData> {}

export interface RevenueResponse extends ApiSuccessResponse<RevenueData> {}

export interface OverviewResponse extends ApiSuccessResponse<OverviewData> {}
