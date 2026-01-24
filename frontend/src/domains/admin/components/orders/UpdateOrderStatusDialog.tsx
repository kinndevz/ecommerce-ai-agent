import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { ORDER_STATUS, type OrderStatusType } from '@/api/services/order.constants'
import { useUpdateOrderStatus } from '@/hooks/useOrders'
import {
  ORDER_STATUS_FLOW,
  getOrderStatusIndex,
} from '@/domains/admin/helpers/order.helpers'
import { OrderStatusProgress } from './OrderStatusProgress'
import { OrderStatusPreview } from './OrderStatusPreview'
import { OrderStatusSelector } from './OrderStatusSelector'
import { OrderCancelledAlert } from './OrderCancelledAlert'

interface UpdateOrderStatusDialogProps {
  orderId: string
  orderNumber: string
  currentStatus: OrderStatusType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateOrderStatusDialog({
  orderId,
  orderNumber,
  currentStatus,
  open,
  onOpenChange,
}: UpdateOrderStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<OrderStatusType | null>(null)
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = () => {
    if (!newStatus) return
    updateStatus.mutate(
      {
        orderId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setNewStatus(null)
        },
      }
    )
  }

  const handleClose = () => {
    onOpenChange(false)
    setNewStatus(null)
  }

  const currentIndex = getOrderStatusIndex(ORDER_STATUS_FLOW, currentStatus)
  const selectedIndex = getOrderStatusIndex(ORDER_STATUS_FLOW, newStatus)
  const isCancelled = currentStatus === ORDER_STATUS.CANCELLED

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className='max-w-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Order Status</AlertDialogTitle>
          <AlertDialogDescription>
            Change the status of order{' '}
            <span className='font-mono font-semibold text-foreground'>
              {orderNumber}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='py-6 space-y-8'>
          {/* Current Status Progress */}
          {!isCancelled && (
            <OrderStatusProgress
              steps={ORDER_STATUS_FLOW}
              currentStatus={currentStatus}
            />
          )}

          {/* Cancelled Alert */}
          {isCancelled && <OrderCancelledAlert />}

          {/* Status Selector */}
          {!isCancelled && (
            <OrderStatusSelector
              value={newStatus}
              onChange={setNewStatus}
            />
          )}

          {/* Preview Section */}
          {newStatus && !isCancelled && selectedIndex !== -1 && (
            <OrderStatusPreview
              steps={ORDER_STATUS_FLOW}
              selectedIndex={selectedIndex}
            />
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateStatus.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleStatusChange}
            disabled={!newStatus || updateStatus.isPending || isCancelled}
            className='min-w-25'
          >
            {updateStatus.isPending ? 'Updating...' : 'Update Status'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
