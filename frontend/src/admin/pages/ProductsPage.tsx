import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { useProducts, productKeys } from '@/hooks/useProducts'
import { ProductsStats } from '@/admin/components/products/ProductsStats'
import { ProductsFilters } from '@/admin/components/products/ProductsFilters'
import { ProductsTable } from '@/admin/components/products/ProductsTable'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProductQueryParams } from '@/api/product.api'

export default function ProductsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const { data, isLoading, isFetching } = useProducts(filters)

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters({ ...newFilters, page: 1 }) //
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleSort = (
    sortBy: 'name' | 'price' | 'created_at' | 'rating' | 'popularity'
  ) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order:
        prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1, // Reset to first page when sorting
    }))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.stats() }),
      ])
      toast.success('Data refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const products = data?.data.products || []
  const pagination = {
    total: data?.data.total || 0,
    page: data?.data.page || 1,
    limit: data?.data.limit || 20,
    totalPages: data?.data.total_pages || 1,
  }

  return (
    <AdminLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              Products
            </h1>
            <p className='text-muted-foreground'>
              Manage your product inventory and details
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Refresh Button */}
            <Button
              variant='outline'
              size='default'
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className='gap-2 hover:bg-primary/10 transition-colors'
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing || isFetching ? 'animate-spin' : ''
                }`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Add Product Button */}
            <Button
              onClick={() => navigate('/admin/products/add')}
              className='gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5'
            >
              <Plus className='h-4 w-4' />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ProductsStats />

        {/* Filters */}
        <ProductsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Products Table */}
        <ProductsTable
          products={products}
          isLoading={isLoading}
          isFetching={isFetching}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          sortBy={filters.sort_by}
          sortOrder={filters.sort_order}
          onPageChange={handlePageChange}
          onSort={handleSort}
        />
      </div>
    </AdminLayout>
  )
}
