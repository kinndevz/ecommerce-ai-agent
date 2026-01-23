import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Home,
  ChevronRight,
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import { useAdminOrder } from '@/hooks/useOrders'
import { useUser } from '@/hooks/useUsers'
import { useProduct } from '@/hooks/useProducts'
import {
  ORDER_STATUS,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '@/api/services/order.constants'
import type { OrderItem } from '@/api/order.api'
import { UpdateOrderStatusDialog } from '@/domains/admin/components/orders/UpdateOrderStatusDialog'

// Component to fetch and display product image
function OrderItemRow({ item }: { item: OrderItem }) {
  const { data: productResponse } = useProduct(item.product_id)

  const getItemImage = () => {
    if (!productResponse?.data) return null
    const product = productResponse.data
    if (product.images && product.images.length > 0) {
      const primaryImg = product.images.find((img) => img.is_primary)
      return primaryImg?.image_url || product.images[0]?.image_url
    }
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const itemImage = getItemImage()

  return (
    <div className='flex items-center gap-4 p-4 bg-muted/30 rounded-lg'>
      <div className='w-16 h-16 rounded-lg border overflow-hidden bg-background shrink-0'>
        {itemImage ? (
          <img
            src={itemImage}
            alt={item.product_name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Package className='w-6 h-6 text-muted-foreground' />
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h4 className='font-medium text-sm mb-1'>{item.product_name}</h4>
        {item.variant_name && (
          <p className='text-xs text-muted-foreground mb-1'>
            {item.variant_name}
          </p>
        )}
        <div className='text-xs text-muted-foreground'>
          {formatCurrency(item.unit_price)} × {item.quantity}
        </div>
      </div>

      <div className='text-right'>
        <p className='font-bold text-sm'>{formatCurrency(item.subtotal)}</p>
      </div>
    </div>
  )
}

export default function ViewOrderUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useAdminOrder(id!)
  const { data: customerResponse } = useUser(order?.user_id || '')

  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const customer = customerResponse?.data

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

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!order) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Package className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Order Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The order you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const canUpdateStatus =
    order.status !== ORDER_STATUS.CANCELLED &&
    order.status !== ORDER_STATUS.DELIVERED

  return (
    <div className='min-h-screen'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
            <Home className='w-4 h-4' />
            <ChevronRight className='w-4 h-4' />
            <button
              onClick={() => navigate('/admin/orders')}
              className='hover:text-foreground transition-colors'
            >
              Orders
            </button>
            <ChevronRight className='w-4 h-4' />
            <span className='text-foreground font-medium'>
              {order.order_number}
            </span>
          </div>

          {/* Header Actions */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {order.order_number}
              </h1>
              <div className='flex items-center gap-2 mt-2'>
                <Badge
                  variant='outline'
                  className={`${
                    ORDER_STATUS_CONFIG[order.status]?.className
                  } gap-1.5`}
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
                  className={`${
                    PAYMENT_STATUS_CONFIG[order.payment_status]?.className
                  } gap-1.5`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                </Badge>
                <Badge variant='secondary' className='gap-1.5'>
                  <Calendar className='w-3.5 h-3.5' />
                  {formatDate(order.created_at)}
                </Badge>
              </div>
            </div>

            {canUpdateStatus && (
              <Button onClick={() => setShowStatusDialog(true)}>
                <Edit className='w-4 h-4 mr-2' />
                Update Status
              </Button>
            )}
          </div>
        </div>
      </div>

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
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                    <span className='text-sm text-muted-foreground'>
                      Shipping
                    </span>
                    <span className='text-sm font-medium'>
                      {formatCurrency(order.shipping_fee)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                      <span className='text-sm text-muted-foreground'>
                        Discount
                      </span>
                      <span className='text-sm font-medium text-green-600'>
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20'>
                    <span className='font-semibold'>Total</span>
                    <span className='text-lg font-bold'>
                      {formatCurrency(order.total)}
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
                    className={
                      order.payment_method
                        ? PAYMENT_METHOD_CONFIG[order.payment_method]?.className
                        : ''
                    }
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
                    className={
                      PAYMENT_STATUS_CONFIG[order.payment_status]?.className
                    }
                  >
                    {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                  </Badge>
                </div>
                <Separator />
                <div className='flex items-center justify-between p-3 bg-primary/5 rounded-lg border-2 border-primary/20'>
                  <span className='text-sm font-medium'>Total Amount</span>
                  <span className='text-lg font-bold'>
                    {formatCurrency(order.total)}
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
                      {new Date(order.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      Updated At
                    </div>
                    <p className='text-sm pl-6 font-medium'>
                      {new Date(order.updated_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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

function LoadingSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <Skeleton className='h-4 w-64 mb-3' />
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-32' />
              </div>
            </div>
            <Skeleton className='h-10 w-32' />
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-7 space-y-6'>
            <Skeleton className='h-96 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
          <div className='lg:col-span-5 space-y-6'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
        </div>
      </div>
    </div>
  )
}
