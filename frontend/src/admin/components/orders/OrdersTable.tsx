import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Package, Calendar, MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  ORDER_STATUS,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/api/services/order.constants'
import type { OrderListItem } from '@/api/order.api'
import { UpdateOrderStatusDialog } from './UpdateOrderStatusDialog'

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

  const totalPages = Math.ceil(total / limit)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className='h-20 w-full rounded-xl' />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed bg-card/50'>
        <div className='text-center py-20 px-6'>
          <div className='inline-flex p-4 rounded-full bg-primary/10 mb-6'>
            <Package className='w-12 h-12 text-primary' />
          </div>
          <h3 className='text-xl font-semibold mb-2'>No Orders Found</h3>
          <p className='text-muted-foreground text-sm max-w-sm mx-auto'>
            There are no orders matching your current filters. Try adjusting
            your search criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='rounded-xl border bg-card overflow-hidden shadow-sm'>
        {/* Table Header - Sử dụng text-xs đậm và uppercase để gọn gàng */}
        <div className='grid grid-cols-12 gap-4 px-6 py-4 bg-muted/40 border-b font-semibold text-xs text-muted-foreground uppercase tracking-wider'>
          <div className='col-span-2 flex items-center gap-1'>Order ID</div>
          <div className='col-span-2 text-center'>Date</div>
          <div className='col-span-2 text-center'>Amount</div>
          <div className='col-span-1 text-center'>Items</div>
          <div className='col-span-2 text-center'>Payment</div>
          <div className='col-span-2 text-center'>Status</div>
          <div className='col-span-1 text-right'>Action</div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border/50'>
          {orders.map((order) => (
            <div
              key={order.id}
              className='group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-all duration-200'
            >
              {/* Order Number - Tăng lên text-sm để dễ đọc */}
              <div className='col-span-2 flex items-center'>
                <button
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className='font-mono text-sm font-medium text-foreground hover:text-primary transition-colors truncate'
                >
                  {order.order_number}
                </button>
              </div>

              {/* Date - Text-sm nhưng màu nhạt hơn */}
              <div className='col-span-2 flex items-center justify-center'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='w-4 h-4 opacity-70' />
                        {formatDate(order.created_at)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created at {formatTime(order.created_at)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Total - Text-sm đậm */}
              <div className='col-span-2 flex items-center justify-center'>
                <span className='text-sm font-semibold text-foreground'>
                  {formatCurrency(order.total)}
                </span>
              </div>

              {/* Items Count */}
              <div className='col-span-1 flex items-center justify-center'>
                <Badge
                  variant='secondary'
                  className='gap-1 font-medium px-2.5 py-0.5 text-xs'
                >
                  {order.total_items}
                </Badge>
              </div>

              {/* Payment Status - Badge chỉnh padding */}
              <div className='col-span-2 flex items-center justify-center'>
                <Badge
                  variant='outline'
                  className={`${
                    PAYMENT_STATUS_CONFIG[order.payment_status]?.className
                  } text-[11px] font-medium px-2.5 py-1 uppercase tracking-wide border`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                </Badge>
              </div>

              {/* Order Status */}
              <div className='col-span-2 flex items-center justify-center'>
                <Badge
                  variant='outline'
                  className={`${
                    ORDER_STATUS_CONFIG[order.status]?.className
                  } text-[11px] font-medium px-2.5 py-1 uppercase tracking-wide border`}
                >
                  {ORDER_STATUS_CONFIG[order.status]?.label}
                </Badge>
              </div>

              {/* Actions */}
              <div className='col-span-1 flex items-center justify-end'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-foreground'
                    >
                      <MoreHorizontal className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className='gap-2 cursor-pointer py-2.5 text-sm'
                    >
                      <Eye className='w-4 h-4 text-muted-foreground' />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    {order.status !== ORDER_STATUS.CANCELLED &&
                      order.status !== ORDER_STATUS.DELIVERED && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setStatusChangeOrder(order)}
                            className='gap-2 cursor-pointer py-2.5 text-sm'
                          >
                            <Package className='w-4 h-4 text-muted-foreground' />
                            <span>Update Status</span>
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination - Text-sm cho đồng bộ */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between py-4 px-2'>
          <p className='text-sm text-muted-foreground font-medium'>
            Showing{' '}
            <span className='font-semibold text-foreground'>
              {(page - 1) * limit + 1}
            </span>{' '}
            to{' '}
            <span className='font-semibold text-foreground'>
              {Math.min(page * limit, total)}
            </span>{' '}
            of <span className='font-semibold text-foreground'>{total}</span>{' '}
            results
          </p>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className='h-9 px-4 text-sm font-medium'
            >
              Previous
            </Button>

            <div className='flex items-center gap-1'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => onPageChange(pageNum)}
                    className={`w-9 h-9 text-sm font-medium ${
                      page === pageNum ? 'shadow-md' : 'text-muted-foreground'
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className='h-9 px-4 text-sm font-medium'
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
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
