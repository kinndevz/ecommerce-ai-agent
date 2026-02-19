import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useVerifyPayment, useTriggerIPN } from '@/hooks/usePayments'
import { PaymentLoading } from '../components/payment/PaymentLoading'
import { PaymentSuccess } from '../components/payment/PaymentSuccess'
import { PaymentFailed } from '../components/payment/PaymentFailed'
import { PaymentError } from '../components/payment/PaymentError'

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, isError, error } = useVerifyPayment(searchParams)
  const { mutate: triggerIPN } = useTriggerIPN()

  useEffect(() => {
    // Trigger IPN when verify is successful
    if (data && data.response_code === '00') {
      triggerIPN(searchParams)
    }
  }, [data, searchParams, triggerIPN])

  // Loading state
  if (isLoading) {
    return <PaymentLoading />
  }

  // Error state
  if (isError) {
    return <PaymentError error={error as Error} />
  }

  // Success state
  if (data && data.response_code === '00') {
    return <PaymentSuccess data={data} />
  }

  // Failed payment state
  return <PaymentFailed data={data} />
}
