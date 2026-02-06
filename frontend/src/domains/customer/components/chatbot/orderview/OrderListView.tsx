import { Receipt } from 'lucide-react'
import type { OrderListItem } from '@/api/order.api'
import { OrderListCard } from './OrderListCard'
import { useChatStore } from '@/stores/useChatStore'

interface OrderListViewProps {
  orders: OrderListItem[]
}

export const OrderListView = ({ orders }: OrderListViewProps) => {
  if (!orders.length) return null

  const { sendMessageStreaming } = useChatStore()

  const handleSubmitTracking = async (orderId: string) => {
    const prompt = `Please tracking this order with this id: ${orderId}`

    await sendMessageStreaming(prompt, {
      suppressUserMessage: true,
      isActive: false,
    })
  }

  return (
    <div className='w-full max-w-4xl mx-auto my-6 space-y-4'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Receipt className='w-4 h-4 text-primary' />
        Your orders
      </div>

      <div className='space-y-3'>
        {orders.map((order) => (
          <OrderListCard
            key={order.id}
            order={order}
            onSubmitTracking={handleSubmitTracking}
          />
        ))}
      </div>
    </div>
  )
}
