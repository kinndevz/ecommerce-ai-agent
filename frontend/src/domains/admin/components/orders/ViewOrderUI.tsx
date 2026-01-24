import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Package,
  MapPin,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  Edit,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAdminOrder } from '@/hooks/useOrders'
import { useUser } from '@/hooks/useUsers'
import {
  ORDER_STATUS,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '@/api/services/order.constants'
import { UpdateOrderStatusDialog } from '@/domains/admin/components/orders/UpdateOrderStatusDialog'
import {
  formatOrderDate,
  formatOrderDateTime,
  formatVndCurrency,
  getOrderStatusBadgeClass,
  getPaymentMethodBadgeClass,
  getPaymentStatusBadgeClass,
} from '@/domains/admin/helpers/order.helpers'
import { OrderPageHeader } from './OrderPageHeader'
import { OrderDetailSkeleton } from './OrderDetailSkeleton'
import { OrderNotFoundState } from './OrderNotFoundState'
import { OrderItemRow } from './OrderItemRow'

export default function ViewOrderUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useAdminOrder(id!)
  const { data: customerResponse } = useUser(order?.user_id || '')

  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const customer = customerResponse?.data

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return (
      <OrderNotFoundState
        actionLabel='Back to Orders'
        onAction={() => navigate('/admin/orders')}
      />
    )
  }

  const canUpdateStatus =
    order.status !== ORDER_STATUS.CANCELLED &&
    order.status !== ORDER_STATUS.DELIVERED

  return (
    <div className='min-h-screen'>
      <OrderPageHeader
        breadcrumbs={[
          { label: 'Orders', onClick: () => navigate('/admin/orders') },
          { label: order.order_number },
        ]}
        title={order.order_number}
        meta={
          <>
            <Badge
              variant='outline'
              className={`${getOrderStatusBadgeClass(order.status)} gap-1.5`}
            >
              {order.status === ORDER_STATUS.DELIVERED ? (
                <CheckCircle className='w-3.5 h-3.5' />
              ) : order.status === ORDER_STATUS.CANCELLED ? (
                <XCircle className='w-3.5 h-3.5' />
              ) : (
                <Clock className='w-3.5 h-3.5' />
              )}
              {ORDER_STATUS_CONFIG[order.status]?.label}
            </Badge>
            <Badge
              variant='outline'
              className={`${getPaymentStatusBadgeClass(order.payment_status)} gap-1.5`}
            >
              {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
            </Badge>
            <Badge variant='secondary' className='gap-1.5'>
              <Calendar className='w-3.5 h-3.5' />
              {formatOrderDate(order.created_at)}
            </Badge>
          </>
        }
        actions={
          canUpdateStatus ? (
            <Button onClick={() => setShowStatusDialog(true)}>
              <Edit className='w-4 h-4 mr-2' />
              Update Status
            </Button>
          ) : null
        }
      />

      {/* Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left - Order Items */}
          <div className='lg:col-span-7 space-y-6'>
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {order.items.length}{' '}
                  {order.items.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {order.items.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </div>

                <Separator className='my-6' />

                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                    <span className='text-sm text-muted-foreground'>
                      Subtotal
                    </span>
                    <span className='text-sm font-medium'>
                      {formatVndCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                    <span className='text-sm text-muted-foreground'>
                      Shipping
                    </span>
                    <span className='text-sm font-medium'>
                      {formatVndCurrency(order.shipping_fee)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                      <span className='text-sm text-muted-foreground'>
                        Discount
                      </span>
                      <span className='text-sm font-medium text-green-600'>
                        -{formatVndCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20'>
                    <span className='font-semibold'>Total</span>
                    <span className='text-lg font-bold'>
                      {formatVndCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                    <User className='w-4 h-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      {order.shipping_address.name}
                    </span>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                    <Phone className='w-4 h-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      {order.shipping_address.phone}
                    </span>
                  </div>
                  <div className='flex items-start gap-3 p-3 bg-muted/30 rounded-lg'>
                    <MapPin className='w-4 h-4 text-muted-foreground mt-0.5' />
                    <div className='space-y-0.5 text-sm'>
                      <p className='font-medium'>
                        {order.shipping_address.address}
                      </p>
                      {order.shipping_address.ward && (
                        <p className='text-muted-foreground'>
                          {order.shipping_address.ward}
                        </p>
                      )}
                      {order.shipping_address.district && (
                        <p className='text-muted-foreground'>
                          {order.shipping_address.district}
                        </p>
                      )}
                      <p className='text-muted-foreground'>
                        {order.shipping_address.city},{' '}
                        {order.shipping_address.country}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='p-4 bg-muted/30 rounded-lg'>
                    <div className='flex items-start gap-3'>
                      <FileText className='w-4 h-4 text-muted-foreground mt-0.5' />
                      <p className='text-sm text-muted-foreground leading-relaxed'>
                        {order.notes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className='lg:col-span-5 space-y-6'>
            {/* Customer */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {customer ? (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.full_name}
                          className='h-12 w-12 rounded-full object-cover'
                        />
                      ) : (
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                          <User className='h-6 w-6 text-primary' />
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-sm truncate'>
                          {customer.full_name}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    {customer.phone_number && (
                      <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                        <Phone className='w-4 h-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          {customer.phone_number}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <Skeleton className='h-12 w-full' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Payment</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                  <span className='text-sm text-muted-foreground flex items-center gap-2'>
                    <CreditCard className='w-4 h-4' />
                    Payment Method
                  </span>
                  <Badge
                    variant='outline'
                    className={getPaymentMethodBadgeClass(order.payment_method)}
                  >
                    {order.payment_method
                      ? PAYMENT_METHOD_CONFIG[order.payment_method]?.label
                      : 'N/A'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                  <span className='text-sm text-muted-foreground'>Status</span>
                  <Badge
                    variant='outline'
                    className={getPaymentStatusBadgeClass(order.payment_status)}
                  >
                    {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                  </Badge>
                </div>
                <Separator />
                <div className='flex items-center justify-between p-3 bg-primary/5 rounded-lg border-2 border-primary/20'>
                  <span className='text-sm font-medium'>Total Amount</span>
                  <span className='text-lg font-bold'>
                    {formatVndCurrency(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Metadata</CardTitle>
                <CardDescription>System information</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      Created At
                    </div>
                    <p className='text-sm pl-6 font-medium'>
                      {formatOrderDateTime(order.created_at)}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      Updated At
                    </div>
                    <p className='text-sm pl-6 font-medium'>
                      {formatOrderDateTime(order.updated_at)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Order ID
                  </div>
                  <code className='text-xs bg-muted px-3 py-2 rounded-lg block font-mono break-all'>
                    {order.id}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Status Dialog */}
      <UpdateOrderStatusDialog
        orderId={id!}
        orderNumber={order.order_number}
        currentStatus={order.status}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
      />
    </div>
  )
}
