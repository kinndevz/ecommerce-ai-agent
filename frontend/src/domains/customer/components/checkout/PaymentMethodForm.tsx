import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { CreditCard as CreditCardIcon, Wallet, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PAYMENT_METHOD,
  type PaymentMethodType,
} from '@/api/services/order.constants'
import {
  CreditCard,
  CreditCardFlipper,
  CreditCardFront,
  CreditCardBack,
  CreditCardChip,
  CreditCardLogo,
  CreditCardNumber,
  CreditCardName,
  CreditCardExpiry,
  CreditCardMagStripe,
  CreditCardCvv,
} from '@/shared/components/ui/credit-card'

const paymentMethodSchema = z.object({
  paymentMethod: z.enum([PAYMENT_METHOD.COD, PAYMENT_METHOD.VNPAY]),
  notes: z
    .string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional(),
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
  onSubmit: (method: PaymentMethodType, notes: string) => void
  onBack: () => void
  initialMethod: PaymentMethodType
  initialNotes: string
}

const PAYMENT_METHODS = [
  {
    value: PAYMENT_METHOD.COD,
    label: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: Wallet,
  },
  {
    value: PAYMENT_METHOD.VNPAY,
    label: 'Thanh toán qua VNPay',
    description: 'Thanh toán trực tuyến qua cổng VNPay',
    icon: CreditCardIcon,
  },
] as const

// VNPay Credit Card Preview
function VNPayCreditCard() {
  return (
    <div className='w-full max-w-sm mx-auto'>
      <CreditCard>
        <CreditCardFlipper>
          <CreditCardFront className='bg-linear-to-br from-red-600 via-blue-700 to-blue-900'>
            <CreditCardChip />
            <CreditCardLogo>
              <div className='flex items-center justify-end'>
                <span className='text-xl font-black text-red-500'>VN</span>
                <span className='text-xl font-black text-blue-400'>PAY</span>
              </div>
            </CreditCardLogo>
            <div className='absolute bottom-0 left-0 right-0 flex flex-col gap-2'>
              <CreditCardNumber>•••• •••• •••• ••••</CreditCardNumber>
              <div className='flex items-end justify-between'>
                <CreditCardName>YOUR NAME</CreditCardName>
                <CreditCardExpiry>MM/YY</CreditCardExpiry>
              </div>
            </div>

            {/* Decorative elements */}
            <div className='absolute top-1/4 right-8 h-32 w-32 rounded-full bg-red-500/20 blur-3xl' />
            <div className='absolute bottom-1/4 left-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl' />
          </CreditCardFront>

          <CreditCardBack className='bg-linear-to-br from-red-600 via-blue-700 to-blue-900'>
            <CreditCardMagStripe />
            <div className='absolute bottom-1/4 right-0 flex items-center gap-2'>
              <div className='h-8 w-3/4 bg-white/90 rounded' />
              <CreditCardCvv className='text-foreground'>123</CreditCardCvv>
            </div>

            {/* VNPay logo on back */}
            <div className='absolute bottom-6 left-0 flex items-center text-xs opacity-70'>
              <span className='font-black text-red-400'>VN</span>
              <span className='font-black text-blue-300'>PAY</span>
            </div>
          </CreditCardBack>
        </CreditCardFlipper>
      </CreditCard>
    </div>
  )
}
// COD Icon
function CODIcon() {
  return (
    <div className='w-full max-w-sm mx-auto flex items-center justify-center h-48'>
      <div className='relative'>
        <div className='h-32 w-32 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl'>
          <Wallet className='h-16 w-16 text-white' />
        </div>
        <div className='absolute -top-2 -right-2 h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-bounce'>
          <span className='text-2xl'>💵</span>
        </div>
      </div>
    </div>
  )
}

export function PaymentMethodForm({
  onSubmit,
  onBack,
  initialMethod,
  initialNotes,
}: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentMethod:
        initialMethod === PAYMENT_METHOD.COD ||
        initialMethod === PAYMENT_METHOD.VNPAY
          ? initialMethod
          : PAYMENT_METHOD.COD,
      notes: initialNotes ?? '',
    },
  })

  const selectedMethod = form.watch('paymentMethod')

  const handleSubmit = (values: PaymentMethodFormValues) => {
    onSubmit(values.paymentMethod, values.notes ?? '')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Payment Method */}
        <Card className='shadow-lg border-0 overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

          <CardHeader className='border-b bg-linear-to-r from-card to-primary/5 pb-4 pt-5'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
              <div className='h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center'>
                <CreditCardIcon className='h-5 w-5 text-primary' />
              </div>
              <span>Phương thức thanh toán</span>
            </CardTitle>
          </CardHeader>

          <CardContent className='p-6'>
            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='space-y-4'
                    >
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon
                        const isSelected = field.value === method.value

                        return (
                          <label
                            key={method.value}
                            className='space-y-3 block cursor-pointer'
                          >
                            <div
                              className={cn(
                                'relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
                              )}
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={method.value}
                                  className='mt-0.5'
                                />
                              </FormControl>

                              <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-1'>
                                  <div
                                    className={cn(
                                      'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                                      isSelected ? 'bg-primary/10' : 'bg-muted'
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        'h-5 w-5 transition-colors',
                                        isSelected
                                          ? 'text-primary'
                                          : 'text-muted-foreground'
                                      )}
                                    />
                                  </div>
                                  <span className='font-semibold text-base'>
                                    {method.label}
                                  </span>
                                </div>
                                <p className='text-sm text-muted-foreground ml-13'>
                                  {method.description}
                                </p>
                              </div>
                            </div>

                            {/* Preview */}
                            {isSelected && (
                              <div className='animate-in fade-in slide-in-from-top-4 duration-500 px-4 py-4'>
                                {method.value === PAYMENT_METHOD.VNPAY ? (
                                  <VNPayCreditCard />
                                ) : (
                                  <CODIcon />
                                )}
                              </div>
                            )}
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className='text-xs mt-2' />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className='shadow-lg border-0 overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

          <CardHeader className='border-b bg-linear-to-r from-card to-primary/5 pb-4 pt-5'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
              <div className='h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center'>
                <StickyNote className='h-5 w-5 text-primary' />
              </div>
              <span>Ghi chú đơn hàng</span>
              <span className='ml-auto text-xs font-normal text-muted-foreground'>
                (Tùy chọn)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className='p-6'>
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm text-muted-foreground'>
                    Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm
                    giao hàng chi tiết hơn
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ví dụ: Giao hàng buổi sáng, gọi trước 15 phút...'
                      rows={4}
                      className='resize-none bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onBack}
            className='h-11 px-8'
          >
            Quay lại
          </Button>
          <Button type='submit' className='h-11 px-8 flex-1 sm:flex-none'>
            Tiếp tục
          </Button>
        </div>
      </form>
    </Form>
  )
}
