import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCarts'
import { useChatStore } from '@/stores/useChatStore'
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_CONFIG,
} from '@/api/services/order.constants'
import type { CartData } from '@/api/cart.api'
import { formatCurrencyVnd } from '../../helpers/formatters'
import { toast } from 'sonner'
import { useState } from 'react'

interface CartViewProps {
  cartData: CartData
}

interface OrderFormState {
  name: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
  country: string
  paymentMethod: string
  notes: string
}

export const CartView = ({ cartData }: CartViewProps) => {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem()
  const { sendMessageStreaming } = useChatStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    country: 'Vietnam',
    paymentMethod: PAYMENT_METHOD.COD,
    notes: '',
  })

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItem({ itemId, data: { quantity: newQuantity } })
  }

  const handleRemoveItem = (itemId: string, productName: string) => {
    if (window.confirm(`Remove "${productName}" from cart?`)) {
      removeItem(itemId)
    }
  }

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const handleOrderFieldChange = (
    key: keyof OrderFormState,
    value: string
  ) => {
    setOrderForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmitOrder = async () => {
    const requiredFields = [
      orderForm.name,
      orderForm.phone,
      orderForm.address,
      orderForm.city,
      orderForm.paymentMethod,
    ]

    if (requiredFields.some((value) => !value.trim())) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    const payload = {
      shipping_address: {
        name: orderForm.name.trim(),
        phone: orderForm.phone.trim(),
        address: orderForm.address.trim(),
        city: orderForm.city.trim(),
        district: orderForm.district.trim() || null,
        ward: orderForm.ward.trim() || null,
        country: orderForm.country.trim() || 'Vietnam',
      },
      payment_method: orderForm.paymentMethod,
      notes: orderForm.notes.trim() || null,
    }

    const orderPrompt = `Please create_order from the current cart with the following payload:
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\``

    setIsCheckoutOpen(false)
    await sendMessageStreaming(orderPrompt, { suppressUserMessage: true, isActive: false })
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <Card className='my-6 border-dashed bg-muted/10'>
        <CardContent className='flex flex-col items-center justify-center py-16 text-center space-y-4'>
          <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center'>
            <ShoppingCart className='w-8 h-8 text-muted-foreground' />
          </div>
          <div>
            <h3 className='font-semibold text-lg'>Your cart is empty</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Add items to see them here.
            </p>
          </div>
          <Button variant='outline' className='mt-2'>
            Start Shopping
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='w-full max-w-4xl mx-auto my-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-primary/10 rounded-xl'>
            <ShoppingCart className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h2 className='text-xl font-bold tracking-tight'>Your cart</h2>
            <p className='text-xs text-muted-foreground'>
              {cartData.total_items} items • {formatCurrencyVnd(cartData.subtotal)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-full w-fit'>
          <PackageCheck className='w-3.5 h-3.5 text-primary' />
          Secure checkout available
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-4'>
          <ScrollArea className='h-100 pr-4'>
            <div className='space-y-4'>
              {cartData.items.map((item) => (
                <div
                  key={item.id}
                  className='group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border bg-card/80 hover:bg-card transition-all duration-300 shadow-sm hover:shadow-md'
                >
                  <div className='w-full sm:w-28 sm:h-28 aspect-4/3 sm:aspect-square shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60 relative'>
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-muted/50'>
                        <ShoppingCart className='w-8 h-8 text-muted-foreground/20' />
                      </div>
                    )}
                  </div>

                  <div className='flex-1 flex flex-col justify-between gap-4'>
                    <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                      <div className='space-y-2'>
                        <h4 className='font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors'>
                          {item.product_name}
                        </h4>
                        <div className='flex flex-wrap items-center gap-2 text-xs'>
                          {item.variant_name && (
                            <span className='bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full'>
                              {item.variant_name}
                            </span>
                          )}
                          <span className='text-muted-foreground'>
                            {formatCurrencyVnd(item.price)} each
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 sm:justify-end'>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id, item.product_name)
                          }
                          disabled={isRemoving}
                          className='text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10'
                          title='Remove item'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center border rounded-lg h-9 bg-background'>
                          <button
                            className='px-3 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className='w-3.5 h-3.5' />
                          </button>
                          <span className='w-10 text-center text-sm font-semibold select-none'>
                            {item.quantity}
                          </span>
                          <button
                            className='px-3 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                          >
                            <Plus className='w-3.5 h-3.5' />
                          </button>
                        </div>
                      </div>

                      <div className='text-right'>
                        <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                          Item total
                        </p>
                        <p className='text-lg font-bold text-primary'>
                          {formatCurrencyVnd(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className='lg:col-span-4'>
          <Card className='sticky top-4 shadow-sm border-border/60 bg-muted/10'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg'>Order summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Subtotal</span>
                  <span className='text-foreground'>
                    {formatCurrencyVnd(cartData.subtotal)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Shipping</span>
                  <span className='text-green-600 font-medium'>Free</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Tax</span>
                  <span className='text-foreground'>
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <Separator />

              <div className='flex justify-between items-end'>
                <span className='text-base font-semibold'>Total</span>
                <span className='text-xl font-bold text-primary'>
                  {formatCurrencyVnd(cartData.subtotal)}
                </span>
              </div>
            </CardContent>

            <CardFooter className='flex-col gap-3 pt-2'>
              <Button
                className='w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all group'
                onClick={handleCheckout}
              >
                Checkout{' '}
                <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
              </Button>

              <div className='flex items-center justify-center gap-2 text-[10px] text-muted-foreground'>
                <ShieldCheck className='w-3 h-3' />
                <span>Secure checkout</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Checkout information</DialogTitle>
            <DialogDescription>
              Fill in shipping details to place your order.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]'>
            <div className='space-y-5'>
              <div className='space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                  Contact
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='grid gap-2'>
                    <Label htmlFor='checkout-name'>Full name</Label>
                    <Input
                      id='checkout-name'
                      value={orderForm.name}
                      onChange={(e) =>
                        handleOrderFieldChange('name', e.target.value)
                      }
                      placeholder='Nguyen Van A'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='checkout-phone'>Phone</Label>
                    <Input
                      id='checkout-phone'
                      value={orderForm.phone}
                      onChange={(e) =>
                        handleOrderFieldChange('phone', e.target.value)
                      }
                      placeholder='0901234567'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                  Shipping address
                </p>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='checkout-address'>Address</Label>
                    <Input
                      id='checkout-address'
                      value={orderForm.address}
                      onChange={(e) =>
                        handleOrderFieldChange('address', e.target.value)
                      }
                      placeholder='12 Nguyen Trai'
                    />
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='checkout-city'>City</Label>
                      <Input
                        id='checkout-city'
                        value={orderForm.city}
                        onChange={(e) =>
                          handleOrderFieldChange('city', e.target.value)
                        }
                        placeholder='Ho Chi Minh'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='checkout-district'>District</Label>
                      <Input
                        id='checkout-district'
                        value={orderForm.district}
                        onChange={(e) =>
                          handleOrderFieldChange('district', e.target.value)
                        }
                        placeholder='District 1'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='checkout-ward'>Ward</Label>
                      <Input
                        id='checkout-ward'
                        value={orderForm.ward}
                        onChange={(e) =>
                          handleOrderFieldChange('ward', e.target.value)
                        }
                        placeholder='Ward 5'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='checkout-country'>Country</Label>
                      <Input
                        id='checkout-country'
                        value={orderForm.country}
                        onChange={(e) =>
                          handleOrderFieldChange('country', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                  Payment
                </p>
                <div className='grid gap-2'>
                  <Label>Payment method</Label>
                  <Select
                    value={orderForm.paymentMethod}
                    onValueChange={(value) =>
                      handleOrderFieldChange('paymentMethod', value)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select payment method' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_CONFIG).map(
                        ([method, config]) => (
                          <SelectItem key={method} value={method}>
                            {config.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='checkout-notes'>Notes (optional)</Label>
                  <Textarea
                    id='checkout-notes'
                    value={orderForm.notes}
                    onChange={(e) =>
                      handleOrderFieldChange('notes', e.target.value)
                    }
                    placeholder='Giao giờ hành chính'
                  />
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4'>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-foreground'>
                  Order summary
                </p>
                <p className='text-xs text-muted-foreground'>
                  {cartData.total_items} items in cart
                </p>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Subtotal</span>
                  <span className='text-foreground'>
                    {formatCurrencyVnd(cartData.subtotal)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Shipping</span>
                  <span className='text-foreground'>Free</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Tax</span>
                  <span className='text-foreground'>Calculated at checkout</span>
                </div>
              </div>

              <Separator />

              <div className='flex justify-between items-end'>
                <span className='text-base font-semibold'>Total</span>
                <span className='text-xl font-bold text-primary'>
                  {formatCurrencyVnd(cartData.subtotal)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder}>Place order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
