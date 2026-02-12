import { OrderGridItem } from './OrderGridItem'
import { OrderListItem } from './OrderListItem'
import { OrderGridSkeleton, OrderListSkeleton } from './OrderSkeleton'
import type { OrderHistoryItem } from '@/api/types/order.types'

interface OrderListContainerProps {
  orders: OrderHistoryItem[]
  isLoading: boolean
  viewMode: 'grid' | 'list'
}

export function OrderListContainer({
  orders,
  isLoading,
  viewMode,
}: OrderListContainerProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        {Array.from({ length: 9 }).map((_, i) =>
          viewMode === 'grid' ? (
            <OrderGridSkeleton key={i} />
          ) : (
            <OrderListSkeleton key={i} />
          )
        )}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className='flex h-60 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 text-center'>
        <p className='text-lg font-medium'>Chưa có đơn hàng nào</p>
        <p className='text-sm text-muted-foreground'>
          Bạn chưa thực hiện đơn hàng nào.
        </p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50'>
        {orders.map((order) => (
          <OrderGridItem key={order.id} order={order} />
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 animate-in fade-in-50'>
      {orders.map((order) => (
        <OrderListItem key={order.id} order={order} />
      ))}
    </div>
  )
}
