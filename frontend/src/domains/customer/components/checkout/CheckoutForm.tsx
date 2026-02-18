import { ShippingAddressForm } from './ShippingAddressForm'
import { PaymentMethodForm } from './PaymentMethodForm'
import { OrderReview } from './OrderReview'
import type { ShippingAddress } from '@/api/types/order.types'
import type { PaymentMethodType } from '@/api/services/order.constants'

interface CheckoutFormProps {
  currentStep: number
  onShippingSubmit: (address: ShippingAddress) => void
  onPaymentSubmit: (method: PaymentMethodType, notes: string) => void
  onBack: () => void
  shippingAddress: ShippingAddress | null
  paymentMethod: PaymentMethodType
  notes: string
}

export function CheckoutForm({
  currentStep,
  onShippingSubmit,
  onPaymentSubmit,
  onBack,
  shippingAddress,
  paymentMethod,
  notes,
}: CheckoutFormProps) {
  return (
    <div className='space-y-6'>
      {currentStep === 1 && (
        <ShippingAddressForm
          onSubmit={onShippingSubmit}
          initialData={shippingAddress}
        />
      )}

      {currentStep === 2 && (
        <PaymentMethodForm
          onSubmit={onPaymentSubmit}
          onBack={onBack}
          initialMethod={paymentMethod}
          initialNotes={notes}
        />
      )}

      {currentStep === 3 && shippingAddress && (
        <OrderReview
          shippingAddress={shippingAddress}
          paymentMethod={paymentMethod}
          notes={notes}
          onBack={onBack}
        />
      )}
    </div>
  )
}
