import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Printer, HelpCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { useOrder } from '@/hooks/useOrders'
import { Navbar } from '../components/layout/Navbar'
import { formatShortDate } from '../helpers/formatters'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '../components/order/OrderStatusBadge'
import { OrderItemRow } from '../components/order/OrderItemRow'
import { OrderTracker } from '../components/order/OrderTracker'
import { OrderInfoCards } from '../components/order/OrderInfoCards'
import { OrderSummary } from '../components/order/OrderSummary'
import { OrderDetailSkeleton } from '../components/order/OrderSkeleton'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useOrder(id || '')

  const order = data

  if (isLoading) return <OrderDetailSkeleton />

  if (isError || !order) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center space-y-4 bg-muted/40'>
        <p className='text-destructive font-medium'>
          Không tìm thấy thông tin đơn hàng
        </p>
        <Button asChild variant='outline'>
          <Link to='/orders'>Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-muted/30 pb-20'>
      <Navbar />
      <main className='container mx-auto max-w-5xl px-4 py-8'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='-ml-2 pl-0 hover:bg-transparent hover:text-primary transition-colors'
            >
              <Link to='/orders' className='text-muted-foreground'>
                <ChevronLeft className='mr-1 h-5 w-5' /> Quay lại
              </Link>
            </Button>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm text-muted-foreground hidden sm:inline'>
              Mã đơn:{' '}
              <span className='font-mono text-foreground font-medium'>
                {order.order_number}
              </span>
            </span>
            <div className='h-4 w-px bg-border hidden sm:block'></div>
            <Button
              variant='outline'
              size='sm'
              className='h-9 bg-background shadow-sm hover:bg-muted/50'
            >
              <Printer className='mr-2 h-4 w-4 text-muted-foreground' /> In hóa
              đơn
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-9 bg-background shadow-sm hover:bg-muted/50'
            >
              <HelpCircle className='mr-2 h-4 w-4 text-muted-foreground' /> Trợ
              giúp
            </Button>
          </div>
        </div>

        <div className='mb-6 space-y-1.5'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
            Chi tiết đơn hàng
          </h1>
          <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
            <span>Đặt ngày {formatShortDate(order.created_at)}</span>
            <div className='flex items-center gap-2'>
              <PaymentStatusBadge status={order.payment_status} />
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3 items-start'>
          <div className='space-y-6 lg:col-span-2'>
            <Card className='shadow-sm border-muted-foreground/20 overflow-hidden'>
              <CardHeader className='bg-muted/50 py-4 px-6 border-b'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base font-medium'>
                    Sản phẩm ({order.items?.length || 0})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  {order.items?.map((item) => (
                    <div key={item.id} className='px-6'>
                      <OrderItemRow item={item} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-sm border-muted-foreground/20'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base font-medium'>
                  Trạng thái vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTracker status={order.status} />
              </CardContent>
            </Card>

            <OrderInfoCards order={order} />
          </div>

          <div className='lg:col-span-1 space-y-6 lg:sticky lg:top-4'>
            <OrderSummary order={order} />
          </div>
        </div>
      </main>
    </div>
  )
}
