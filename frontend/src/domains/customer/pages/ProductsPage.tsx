import { useState } from 'react'
import { Search, Grid3x3, List, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { useSearchProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/hooks/useWishlist'
import type { SearchQueryParams } from '@/api/product.api'
import ProductCard, {
  normalizeProduct,
} from '../components/product/ProductCard'
import { ProductFilters } from '../components/product/ProductFilters'
import { ActiveFilters } from '../components/product/ActiveFilters'
import { ProductsPageSkeleton } from '../components/product/ProductsPageSkeleton'
import { ProductsPagination } from '../components/product/ProductsPagination'
import { Navbar } from '../components/layout/Navbar'
import { countActiveFilters } from '../helpers/productFilters.helpers'

export function ProductsPage() {
  const [filters, setFilters] = useState<SearchQueryParams>({
    page: 1,
    limit: 12,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: response, isLoading } = useSearchProducts(filters)
  const { data: wishlistData } = useWishlist()

  const products = response?.data?.map(normalizeProduct) || []
  const meta = response?.meta
  const wishlistIds = new Set(
    wishlistData?.data?.map((item) => item.product_id) || []
  )

  // Get active filters count
  const activeCount = countActiveFilters(filters)

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      q: searchQuery || undefined,
      page: 1,
    }))
  }

  const handleFiltersChange = (newFilters: SearchQueryParams) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleRemoveFilter = (key: keyof SearchQueryParams, value?: string) => {
    if (key === 'is_available') {
      setFilters((prev) => ({ ...prev, is_available: undefined }))
    } else if (key === 'min_price' || key === 'max_price') {
      setFilters((prev) => ({
        ...prev,
        min_price: undefined,
        max_price: undefined,
      }))
    } else if (key === 'category' || key === 'brand') {
      setFilters((prev) => ({ ...prev, [key]: undefined }))
    } else if (Array.isArray(filters[key])) {
      const updated = (filters[key] as string[]).filter((v) => v !== value)
      setFilters((prev) => ({
        ...prev,
        [key]: updated.length > 0 ? updated : undefined,
      }))
    }
  }

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 12 })
    setSearchQuery('')
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />

      {/* Main Container */}
      <div className='max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Sidebar - Filters (Desktop) */}
          <aside className='hidden lg:block lg:col-span-3'>
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleClearFilters}
            />
          </aside>

          {/* Right Content - Search + Products */}
          <div className='lg:col-span-9 space-y-6'>
            {/* Header with Title and Results Count */}
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>Danh mục sản phẩm</h1>
                <p className='text-sm text-muted-foreground mt-1'>
                  Hiển thị{' '}
                  <span className='font-semibold text-foreground'>
                    {meta?.total || 0}
                  </span>{' '}
                  kết quả
                </p>
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className='hidden sm:flex items-center gap-1 border rounded-lg p-1 bg-background'>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setViewMode('list')}
                >
                  <List className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo SKU, tên sản phẩm...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className='pl-11 pr-32 h-11'
              />
              <Button
                onClick={handleSearch}
                className='absolute right-2 top-1/2 -translate-y-1/2 h-8'
                size='sm'
              >
                Tìm kiếm
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <div className='lg:hidden'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='sm' className='w-full'>
                    <SlidersHorizontal className='h-4 w-4 mr-2' />
                    Bộ lọc
                    {activeCount > 0 && (
                      <Badge variant='secondary' className='ml-2'>
                        {activeCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-80 p-0'>
                  <SheetHeader className='p-6 border-b'>
                    <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                  </SheetHeader>
                  <div className='p-6'>
                    <ProductFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onReset={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearFilters}
            />

            {/* Products Grid/List */}
            {isLoading ? (
              <ProductsPageSkeleton />
            ) : products.length === 0 ? (
              <div className='text-center py-16 bg-muted/30 rounded-lg border border-dashed'>
                <p className='text-lg font-medium text-muted-foreground mb-2'>
                  Không tìm thấy sản phẩm
                </p>
                <p className='text-sm text-muted-foreground'>
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-4'
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={viewMode}
                      isFavorite={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.total_pages > 1 && (
                  <ProductsPagination
                    currentPage={meta.page}
                    totalPages={meta.total_pages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}

            {/* Results Info Footer */}
            {!isLoading && products.length > 0 && (
              <div className='text-sm text-muted-foreground text-center py-4'>
                Showing {(meta?.page! - 1) * (meta?.limit || 12) + 1} to{' '}
                {Math.min(meta?.page! * (meta?.limit || 12), meta?.total || 0)}{' '}
                of {meta?.total} items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
