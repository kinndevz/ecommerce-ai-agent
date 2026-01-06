import { useState } from 'react'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  ORDER_STATUS,
  ORDER_STATUS_CONFIG,
  type OrderStatusType,
} from '@/api/services/order.constants'
import { useUpdateOrderStatus } from '@/hooks/useOrders'

interface UpdateOrderStatusDialogProps {
  orderId: string
  orderNumber: string
  currentStatus: OrderStatusType
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Config giữ nguyên
const STATUS_FLOW = [
  {
    status: ORDER_STATUS.PENDING,
    label: 'Pending',
    icon: Clock,
    description: 'Awaiting confirmation',
  },
  {
    status: ORDER_STATUS.PROCESSING,
    label: 'Processing',
    icon: Package,
    description: 'Being prepared',
  },
  {
    status: ORDER_STATUS.SHIPPED,
    label: 'Shipped',
    icon: Truck,
    description: 'On delivery',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Delivered',
    icon: CheckCircle,
    description: 'Completed',
  },
]

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

  const getCurrentStatusIndex = () => {
    return STATUS_FLOW.findIndex((s) => s.status === currentStatus)
  }

  const getSelectedStatusIndex = () => {
    if (!newStatus) return -1
    return STATUS_FLOW.findIndex((s) => s.status === newStatus)
  }

  const currentIndex = getCurrentStatusIndex()
  const selectedIndex = getSelectedStatusIndex()
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
            <div className='space-y-4'>
              <div className='text-sm font-medium text-muted-foreground'>
                Current Progress
              </div>

              <div className='relative'>
                <div className='absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-muted -z-10'>
                  <div
                    className='h-full bg-primary transition-all duration-500 ease-in-out'
                    style={{
                      width: `${
                        (currentIndex / (STATUS_FLOW.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                {/* Grid Steps */}
                <div className='grid grid-cols-4 w-full'>
                  {STATUS_FLOW.map((step, index) => {
                    const isActive = index <= currentIndex
                    const isCurrent = index === currentIndex
                    const Icon = step.icon

                    return (
                      <div
                        key={step.status}
                        className='flex flex-col items-center text-center group'
                      >
                        {/* Icon Circle */}
                        <div
                          className={`
                            relative flex items-center justify-center
                            w-10 h-10 rounded-full border-2 transition-all duration-300 bg-background
                            ${
                              isActive
                                ? 'border-primary text-primary shadow-sm shadow-primary/25'
                                : 'border-muted text-muted-foreground'
                            }
                            ${
                              isCurrent
                                ? 'scale-110 ring-4 ring-primary/10'
                                : ''
                            }
                          `}
                        >
                          <Icon className='w-5 h-5' />
                        </div>

                        {/* Labels */}
                        <div className='mt-3 space-y-0.5 px-1'>
                          <p
                            className={`text-xs font-semibold transition-colors duration-300 ${
                              isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className='text-[10px] text-muted-foreground/80 leading-tight hidden sm:block'>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Alert */}
          {isCancelled && (
            <div className='p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-4'>
              <div className='p-2 bg-destructive/10 rounded-full'>
                <XCircle className='w-6 h-6 text-destructive' />
              </div>
              <div>
                <p className='font-semibold text-destructive'>
                  Order Cancelled
                </p>
                <p className='text-sm text-muted-foreground'>
                  This order has been cancelled and cannot be updated.
                </p>
              </div>
            </div>
          )}

          {/* Status Selector */}
          {!isCancelled && (
            <div className='space-y-3'>
              <div className='text-sm font-medium text-muted-foreground'>
                Select New Status
              </div>
              <Select
                value={newStatus || undefined}
                onValueChange={(value) =>
                  setNewStatus(value as OrderStatusType)
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue placeholder='Choose a status...' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            ORDER_STATUS_CONFIG[value]?.className.split(' ')[0]
                          }`}
                        />
                        <span className='text-sm font-medium'>
                          {ORDER_STATUS_CONFIG[value]?.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview Section */}
          {newStatus && !isCancelled && selectedIndex !== -1 && (
            <div className='rounded-xl border bg-muted/30 p-4 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-medium text-primary'>
                <ChevronRight className='w-4 h-4' />
                <span>Preview: After Update</span>
              </div>

              <div className='relative'>
                {/* Preview Line */}
                <div className='absolute top-3 left-[12.5%] right-[12.5%] h-0.5 bg-muted/50 -z-10'>
                  <div
                    className='h-full bg-primary/60 transition-all duration-500'
                    style={{
                      width: `${
                        (selectedIndex / (STATUS_FLOW.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                {/* Preview Grid */}
                <div className='grid grid-cols-4 w-full'>
                  {STATUS_FLOW.map((step, index) => {
                    const willBeActive = index <= selectedIndex
                    return (
                      <div key={step.status} className='flex justify-center'>
                        <div
                          className={`
                            flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] font-bold bg-background transition-colors
                            ${
                              willBeActive
                                ? 'border-primary text-primary'
                                : 'border-muted text-muted-foreground'
                            }
                          `}
                        >
                          {index + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
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
