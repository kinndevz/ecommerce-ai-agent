import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useOrder } from '@/hooks/useOrders'
import { Navbar } from '../components/layout/Navbar'
import { OrderDetailSkeleton } from '../components/order/OrderSkeleton'

import { OrderInfoCards } from '../components/order/OrderInfoCards'
import { OrderSummary } from '../components/order/OrderSummary'
import { OrderHeader } from '../components/order/OrderHeader'
import { OrderProducts } from '../components/order/OrderProducts'
import { OrderTrackerCard } from '../components/order/OrderTrackerCard'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useOrder(id || '')

  const order = data

  if (isLoading) return <OrderDetailSkeleton />

  if (isError || !order) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center space-y-4 bg-background'>
        <div className='text-center space-y-3 animate-in fade-in duration-500'>
          <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
            <div className='h-8 w-8 text-destructive text-2xl font-bold'>✕</div>
          </div>
          <p className='text-lg font-semibold text-foreground'>
            Không tìm thấy thông tin đơn hàng
          </p>
          <p className='text-sm text-muted-foreground'>
            Đơn hàng này có thể đã bị xóa hoặc không tồn tại
          </p>
        </div>
        <Button asChild variant='outline'>
          <Link to='/orders'>Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
      </div>

      {/* Breadcrumb */}
      <div className='border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10'>
        <div className='container mx-auto max-w-7xl px-4 py-3'>
          <div className='flex items-center gap-2 text-sm'>
            <Link
              to='/'
              className='text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5'
            >
              <Home className='h-3.5 w-3.5' />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
            <Link
              to='/orders'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Đơn hàng
            </Link>
            <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-foreground font-medium'>
              {order.order_number}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className='container mx-auto max-w-7xl px-4 py-6 lg:py-8'>
        {/* Back Button */}
        <div className='mb-6'>
          <Button variant='ghost' size='sm' asChild className='h-9 -ml-3'>
            <Link to='/orders'>
              <ChevronLeft className='mr-1 h-4 w-4' /> Quay lại đơn hàng
            </Link>
          </Button>
        </div>

        {/* Header */}
        <OrderHeader order={order} />

        {/* Content Grid */}
        <div className='grid gap-6 lg:grid-cols-12 mt-6'>
          {/* Left Column - Main Content */}
          <div className='space-y-6 lg:col-span-8'>
            <OrderProducts items={order.items || []} />
            <OrderTrackerCard status={order.status} />
            <OrderInfoCards order={order} />
          </div>

          {/* Right Column - Sidebar */}
          <div className='lg:col-span-4'>
            <div className='lg:sticky lg:top-24'>
              <OrderSummary order={order} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
