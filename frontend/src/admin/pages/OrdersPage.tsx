import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { OrderStatsCards } from '@/admin/components/orders/OrderStatsCards'
import { OrderFilters } from '@/admin/components/orders/OrderFilters'
import { OrdersTable } from '@/admin/components/orders/OrdersTable'
import { useAdminOrders, useOrderStats } from '@/hooks/useOrders'
import type { OrderStatusType } from '@/api/services/order.constants'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusType | 'all'>(
    'all'
  )
  const [page, setPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const limit = 12

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter
    }
    return params
  }, [page, limit, statusFilter])

  const { data, isLoading, isFetching, refetch } = useAdminOrders(queryParams)
  const { data: stats } = useOrderStats()

  // Client-side search filter
  const filteredOrders = useMemo(() => {
    if (!data?.data) return []

    if (!search) return data.data

    const searchLower = search.toLowerCase()
    return data.data.filter((order) =>
      order.order_number.toLowerCase().includes(searchLower)
    )
  }, [data?.data, search])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleStatusFilterChange = (newStatus: OrderStatusType | 'all') => {
    setStatusFilter(newStatus)
    setPage(1) // Reset to page 1 when filter changes
  }

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    if (!stats) return undefined
    return {
      total: stats.total_orders,
      pending: stats.pending_orders,
      processing: stats.processing_orders,
      shipped: stats.shipped_orders,
      delivered: stats.delivered_orders,
      cancelled: stats.cancelled_orders,
    }
  }, [stats])

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Orders</h1>
            <p className='text-muted-foreground mt-1'>
              Manage and track your orders
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <OrderStatsCards />

        {/* Filters */}
        <OrderFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onClearFilters={handleClearFilters}
          statusCounts={statusCounts}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          isLoading={isLoading && !data}
          total={data?.meta?.total || 0}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  )
}
