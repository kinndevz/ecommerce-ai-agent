import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { useCart } from '@/hooks/useCarts'
import { useCreateOrder } from '@/hooks/useOrders'
import { useCreatePayment } from '@/hooks/usePayments'
import { CheckoutForm } from '../components/checkout/CheckoutForm'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import { CheckoutSteps } from '../components/checkout/CheckoutSteps'
import { Button } from '@/shared/components/ui/button'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { ShippingAddress } from '@/api/types/order.types'
import type { PaymentMethodType } from '@/api/services/order.constants'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading: isLoadingCart } = useCart()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutate: createPayment, isPending: isCreatingPayment } =
    useCreatePayment()

  const [currentStep, setCurrentStep] = useState(1)
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod')
  const [notes, setNotes] = useState('')

  // Redirect if cart is empty
  if (!isLoadingCart && (!cart || cart.items.length === 0)) {
    return (
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto max-w-4xl px-4 py-16'>
          <div className='text-center space-y-4 animate-in fade-in duration-500'>
            <div className='h-24 w-24 mx-auto rounded-full bg-muted flex items-center justify-center'>
              <ShoppingCart className='h-12 w-12 text-muted-foreground' />
            </div>
            <h2 className='text-2xl font-bold'>Giỏ hàng trống</h2>
            <p className='text-muted-foreground'>
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button asChild>
              <Link to='/products'>Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address)
    setCurrentStep(2)
    toast.success('Đã lưu thông tin giao hàng')
  }

  const handlePaymentSubmit = (
    method: PaymentMethodType,
    orderNotes: string
  ) => {
    setPaymentMethod(method)
    setNotes(orderNotes)
    setCurrentStep(3)
    toast.success('Đã lưu thông tin thanh toán')
  }

  const handlePlaceOrder = () => {
    if (!shippingAddress) {
      toast.error('Vui lòng nhập thông tin giao hàng')
      setCurrentStep(1)
      return
    }

    createOrder(
      {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: notes || null,
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            const orderId = response.data.id

            // VNPay - Create payment URL
            if (paymentMethod === 'vnpay') {
              createPayment({
                order_id: orderId,
                language: 'vn',
              })
              // useCreatePayment will auto redirect to payment_url
            } else {
              // COD - redirect to order detail
              navigate(`/orders/${orderId}`)
            }
          }
        },
      }
    )
  }

  const isProcessing = isCreatingOrder || isCreatingPayment

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
      </div>

      {/* Header */}
      <div className='border-b bg-card/50 backdrop-blur-sm'>
        <div className='container mx-auto max-w-7xl px-4 py-4'>
          <Button variant='ghost' size='sm' asChild className='-ml-3'>
            <Link to='/cart'>
              <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại giỏ hàng
            </Link>
          </Button>
        </div>
      </div>

      <main className='container mx-auto max-w-7xl px-4 py-8'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>Thanh toán</h1>
          <p className='text-muted-foreground'>
            Hoàn tất thông tin để đặt hàng
          </p>
        </div>

        {/* Steps */}
        <CheckoutSteps currentStep={currentStep} />

        {/* Main Content */}
        <div className='grid gap-8 lg:grid-cols-12 mt-8'>
          {/* Left - Form */}
          <div className='lg:col-span-7'>
            <CheckoutForm
              currentStep={currentStep}
              onShippingSubmit={handleShippingSubmit}
              onPaymentSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep(currentStep - 1)}
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              notes={notes}
            />
          </div>

          {/* Right - Summary */}
          <div className='lg:col-span-5'>
            <div className='lg:sticky lg:top-24'>
              <CheckoutSummary
                cart={cart ?? undefined}
                isLoading={isLoadingCart}
                currentStep={currentStep}
                onPlaceOrder={handlePlaceOrder}
                isPlacingOrder={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
