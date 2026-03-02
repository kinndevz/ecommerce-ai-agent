import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  OverviewResponse,
  RevenueResponse,
  OrdersResponse,
  TopSellingResponse,
  LowStockResponse,
  CustomersResponse,
  CategoryRevenueResponse,
  BrandRevenueResponse,
  DateRangeParams,
} from './types/analytic.types'

export const analyticsAPI = {
  overview: async (params?: DateRangeParams): Promise<OverviewResponse> => {
    const { data } = await api.get<OverviewResponse>(
      API_ENDPOINT.ANALYTICS_OVERVIEW,
      { params }
    )
    return data
  },

  revenue: async (params?: DateRangeParams): Promise<RevenueResponse> => {
    const { data } = await api.get<RevenueResponse>(
      API_ENDPOINT.ANALYTICS_REVENUE,
      { params }
    )
    return data
  },

  orders: async (params?: DateRangeParams): Promise<OrdersResponse> => {
    const { data } = await api.get<OrdersResponse>(
      API_ENDPOINT.ANALYTICS_ORDERS,
      { params }
    )
    return data
  },

  topSellingProducts: async (
    params?: DateRangeParams,
    limit: number = 10
  ): Promise<TopSellingResponse> => {
    const { data } = await api.get<TopSellingResponse>(
      API_ENDPOINT.ANALYTICS_TOP_SELLING,
      {
        params: { ...params, limit },
      }
    )
    return data
  },

  lowStockProducts: async (
    threshold: number = 10,
    limit: number = 20
  ): Promise<LowStockResponse> => {
    const { data } = await api.get<LowStockResponse>(
      API_ENDPOINT.ANALYTICS_LOW_STOCK,
      {
        params: { threshold, limit },
      }
    )
    return data
  },

  customers: async (
    params?: DateRangeParams,
    topLimit: number = 10
  ): Promise<CustomersResponse> => {
    const { data } = await api.get<CustomersResponse>(
      API_ENDPOINT.ANALYTICS_CUSTOMERS,
      {
        params: { ...params, top_limit: topLimit },
      }
    )
    return data
  },

  categoryRevenue: async (
    params?: DateRangeParams
  ): Promise<CategoryRevenueResponse> => {
    const { data } = await api.get<CategoryRevenueResponse>(
      API_ENDPOINT.ANALYTICS_CATEGORIES,
      { params }
    )
    return data
  },

  brandRevenue: async (
    params?: DateRangeParams
  ): Promise<BrandRevenueResponse> => {
    const { data } = await api.get<BrandRevenueResponse>(
      API_ENDPOINT.ANALYTICS_BRANDS,
      { params }
    )
    return data
  },
}

export type {
  OverviewResponse,
  RevenueResponse,
  OrdersResponse,
  TopSellingResponse,
  LowStockResponse,
  CustomersResponse,
  CategoryRevenueResponse,
  BrandRevenueResponse,
  DateRangeParams,
} from './types/analytic.types'

export { AnalyticsPeriod } from './types/analytic.types'
