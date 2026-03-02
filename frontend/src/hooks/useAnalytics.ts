import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { analyticsAPI, type DateRangeParams } from '@/api/analytic.api'

// QUERY KEYS
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (params?: DateRangeParams) =>
    [...analyticsKeys.all, 'overview', params] as const,
  revenue: (params?: DateRangeParams) =>
    [...analyticsKeys.all, 'revenue', params] as const,
  orders: (params?: DateRangeParams) =>
    [...analyticsKeys.all, 'orders', params] as const,
  topSelling: (params?: DateRangeParams, limit?: number) =>
    [...analyticsKeys.all, 'topSelling', params, limit] as const,
  lowStock: (threshold?: number, limit?: number) =>
    [...analyticsKeys.all, 'lowStock', threshold, limit] as const,
  customers: (params?: DateRangeParams, topLimit?: number) =>
    [...analyticsKeys.all, 'customers', params, topLimit] as const,
  categories: (params?: DateRangeParams) =>
    [...analyticsKeys.all, 'categories', params] as const,
  brands: (params?: DateRangeParams) =>
    [...analyticsKeys.all, 'brands', params] as const,
}

// QUERY HOOKS

/**
 * Get KPI overview cards: Revenue, Orders, New Customers, Avg Order Value.
 */
export function useAnalyticsOverview(params?: DateRangeParams) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsAPI.overview(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * Get Revenue analytics with daily trend line.
 */
export function useRevenueAnalytics(params?: DateRangeParams) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsAPI.revenue(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get Order analytics: daily trend, status breakdown, payment methods.
 */
export function useOrderAnalytics(params?: DateRangeParams) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => analyticsAPI.orders(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get Top selling products.
 */
export function useTopSellingProducts(
  params?: DateRangeParams,
  limit: number = 10
) {
  return useQuery({
    queryKey: analyticsKeys.topSelling(params, limit),
    queryFn: () => analyticsAPI.topSellingProducts(params, limit),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get Low stock products for inventory alerts.
 */
export function useLowStockProducts(
  threshold: number = 10,
  limit: number = 20
) {
  return useQuery({
    queryKey: analyticsKeys.lowStock(threshold, limit),
    queryFn: () => analyticsAPI.lowStockProducts(threshold, limit),
    placeholderData: keepPreviousData,
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Get Customer analytics: trends and top spenders.
 */
export function useCustomerAnalytics(
  params?: DateRangeParams,
  topLimit: number = 10
) {
  return useQuery({
    queryKey: analyticsKeys.customers(params, topLimit),
    queryFn: () => analyticsAPI.customers(params, topLimit),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get Revenue breakdown by Product Categories.
 */
export function useCategoryRevenue(params?: DateRangeParams) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: () => analyticsAPI.categoryRevenue(params),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Get Revenue breakdown by Brands.
 */
export function useBrandRevenue(params?: DateRangeParams) {
  return useQuery({
    queryKey: analyticsKeys.brands(params),
    queryFn: () => analyticsAPI.brandRevenue(params),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  })
}
