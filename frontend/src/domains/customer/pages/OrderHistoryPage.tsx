import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useMyOrders } from '@/hooks/useOrders'
import { OrderListContainer } from '../components/order/OrderListContainer'
import { OrderPagination } from '../components/order/OrderPagination'
import { Navbar } from '../components/layout/Navbar'

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

      <div className='container mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6'>
        <div className='mb-8 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Lịch sử đơn hàng
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Quản lý và theo dõi các đơn hàng của bạn.
            </p>
          </div>

          <div className='flex items-center gap-1 rounded-lg border bg-muted/50 p-1'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
              title='Dạng lưới'
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='h-8 w-8 p-0'
              title='Dạng danh sách'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  )
}
