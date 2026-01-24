import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/api/services/order.constants'
import type { OrderListItem } from '@/api/order.api'
import { UpdateOrderStatusDialog } from './UpdateOrderStatusDialog'
import { OrdersTableSkeleton } from './OrdersTableSkeleton'
import { OrdersEmptyState } from './OrdersEmptyState'
import { OrdersPaginationBar } from './OrdersPaginationBar'
import { OrderActionsMenu } from './OrderActionsMenu'
import {
  formatOrderDate,
  formatOrderTime,
  formatVndCurrency,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
} from '@/domains/admin/helpers/order.helpers'

interface OrdersTableProps {
  orders: OrderListItem[]
  isLoading: boolean
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
}

export function OrdersTable({
  orders,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
}: OrdersTableProps) {
  const navigate = useNavigate()
  const [statusChangeOrder, setStatusChangeOrder] =
    useState<OrderListItem | null>(null)

  if (isLoading) {
    return <OrdersTableSkeleton />
  }

  if (orders.length === 0) {
    return <OrdersEmptyState />
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border bg-card overflow-hidden shadow-sm'>
        <div className='grid grid-cols-12 gap-4 px-6 py-4 bg-muted/40 border-b font-semibold text-xs text-muted-foreground uppercase tracking-wider'>
          <div className='col-span-2 flex items-center gap-1'>Order ID</div>
          <div className='col-span-2 text-center'>Date</div>
          <div className='col-span-2 text-center'>Amount</div>
          <div className='col-span-1 text-center'>Items</div>
          <div className='col-span-2 text-center'>Payment</div>
          <div className='col-span-2 text-center'>Status</div>
          <div className='col-span-1 text-right'>Action</div>
        </div>

        <div className='divide-y divide-border/50'>
          {orders.map((order) => (
            <div
              key={order.id}
              className='group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-all duration-200'
            >
              <div className='col-span-2 flex items-center'>
                <button
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className='font-mono text-sm font-medium text-foreground hover:text-primary transition-colors truncate'
                >
                  {order.order_number}
                </button>
              </div>

              <div className='col-span-2 flex items-center justify-center'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='w-4 h-4 opacity-70' />
                        {formatOrderDate(order.created_at)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created at {formatOrderTime(order.created_at)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className='col-span-2 flex items-center justify-center'>
                <span className='text-sm font-semibold text-foreground'>
                  {formatVndCurrency(order.total)}
                </span>
              </div>

              <div className='col-span-1 flex items-center justify-center'>
                <Badge
                  variant='secondary'
                  className='gap-1 font-medium px-2.5 py-0.5 text-xs'
                >
                  {order.total_items}
                </Badge>
              </div>

              <div className='col-span-2 flex items-center justify-center'>
                <Badge
                  variant='outline'
                  className={`${getPaymentStatusBadgeClass(order.payment_status)} text-[11px] font-medium px-2.5 py-1 uppercase tracking-wide border`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                </Badge>
              </div>

              <div className='col-span-2 flex items-center justify-center'>
                <Badge
                  variant='outline'
                  className={`${getOrderStatusBadgeClass(order.status)} text-[11px] font-medium px-2.5 py-1 uppercase tracking-wide border`}
                >
                  {ORDER_STATUS_CONFIG[order.status]?.label}
                </Badge>
              </div>

              <div className='col-span-1 flex items-center justify-end'>
                <OrderActionsMenu
                  order={order}
                  onUpdateStatus={setStatusChangeOrder}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <OrdersPaginationBar
        page={page}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />

      {statusChangeOrder && (
        <UpdateOrderStatusDialog
          orderId={statusChangeOrder.id}
          orderNumber={statusChangeOrder.order_number}
          currentStatus={statusChangeOrder.status}
          open={!!statusChangeOrder}
          onOpenChange={(open) => {
            if (!open) setStatusChangeOrder(null)
          }}
        />
      )}
    </div>
  )
}
