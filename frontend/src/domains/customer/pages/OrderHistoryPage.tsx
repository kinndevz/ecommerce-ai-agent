import { useState } from 'react'
import { LayoutGrid, List, Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useMyOrders } from '@/hooks/useOrders'
import { OrderListContainer } from '../components/order/OrderListContainer'
import { OrderPagination } from '../components/order/OrderPagination'
import { Navbar } from '../components/layout/Navbar'
import { OrderEmptyState } from '../components/order/OrderEmptyState'

export default function OrderHistoryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const LIMIT = 9

  const { data: response, isLoading } = useMyOrders({
    page: currentPage,
    limit: LIMIT,
  })

  const orders = response?.data || []
  const totalPages = response?.meta?.total_pages || 1

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
      </div>

      <div className='container mx-auto max-w-7xl px-4 py-8 lg:py-12'>
        {/* Header */}
        <div className='mb-8 space-y-6'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <Package className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <h1 className='text-3xl lg:text-4xl font-bold tracking-tight'>
                    Đơn hàng của tôi
                  </h1>
                  <p className='text-muted-foreground mt-1'>
                    Quản lý và theo dõi các đơn hàng của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className='flex items-center gap-2 rounded-xl border bg-card/50 backdrop-blur-sm p-1.5 shadow-sm'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='h-9 px-4 rounded-lg'
              >
                <LayoutGrid className='h-4 w-4 mr-2' />
                <span className='hidden sm:inline'>Lưới</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='h-9 px-4 rounded-lg'
              >
                <List className='h-4 w-4 mr-2' />
                <span className='hidden sm:inline'>Danh sách</span>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          {!isLoading && orders.length > 0 && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span className='font-medium text-foreground'>
                {response?.meta?.total || 0}
              </span>
              <span>đơn hàng</span>
              <span>•</span>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {!isLoading && orders.length === 0 ? (
          <OrderEmptyState />
        ) : (
          <>
            <OrderListContainer
              orders={orders}
              isLoading={isLoading}
              viewMode={viewMode}
            />

            {!isLoading && orders.length > 0 && (
              <OrderPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
