import { OrderCard } from './OrderCard'
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
            : 'flex flex-col gap-6'
        }
      >
        {Array.from({ length: 6 }).map((_, i) =>
          viewMode === 'grid' ? (
            <OrderGridSkeleton key={i} />
          ) : (
            <OrderListSkeleton key={i} />
          )
        )}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-500'>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} viewMode='grid' />
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 animate-in fade-in-50 duration-500'>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} viewMode='list' />
      ))}
    </div>
  )
}
