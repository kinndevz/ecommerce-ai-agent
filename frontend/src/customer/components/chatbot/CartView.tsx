import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
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
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCarts'
import { toast } from 'sonner'

interface CartItemData {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  price: number
  product_name: string
  product_slug: string
  product_image: string | null
  variant_name: string | null
  subtotal: number
  created_at: string
  updated_at: string
}

interface CartData {
  id: string
  user_id: string
  items: CartItemData[]
  total_items: number
  subtotal: number
  created_at: string
  updated_at: string
}

interface CartViewProps {
  cartData: CartData
}

export const CartView = ({ cartData }: CartViewProps) => {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItem({ itemId, data: { quantity: newQuantity } })
  }

  const handleRemoveItem = (itemId: string, productName: string) => {
    if (window.confirm(`Remove "${productName}" from cart?`)) {
      removeItem(itemId)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleCheckout = () => {
    toast.info('Redirecting to checkout...')
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
              Looks like you haven't added anything yet.
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
      <div className='flex items-center gap-2 mb-6'>
        <div className='p-2 bg-primary/10 rounded-lg'>
          <ShoppingCart className='w-5 h-5 text-primary' />
        </div>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>Shopping Cart</h2>
          <p className='text-xs text-muted-foreground'>
            {cartData.total_items} items in your bag
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-4'>
          <ScrollArea className='h-100 pr-4'>
            <div className='space-y-4'>
              {cartData.items.map((item) => (
                <div
                  key={item.id}
                  className='group flex gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300'
                >
                  {/* Product Image */}
                  <div className='w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50 relative'>
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

                  {/* Details */}
                  <div className='flex-1 flex flex-col justify-between py-0.5'>
                    <div className='space-y-1'>
                      <div className='flex justify-between items-start gap-2'>
                        <h4 className='font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors'>
                          {item.product_name}
                        </h4>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id, item.product_name)
                          }
                          disabled={isRemoving}
                          className='text-muted-foreground hover:text-destructive transition-colors p-1 -mr-2 -mt-1'
                          title='Remove item'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                      {item.variant_name && (
                        <p className='text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded w-fit'>
                          {item.variant_name}
                        </p>
                      )}
                    </div>

                    <div className='flex items-end justify-between mt-2'>
                      {/* Quantity Control */}
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center border rounded-lg h-8 bg-background'>
                          <button
                            className='px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className='w-3 h-3' />
                          </button>
                          <span className='w-8 text-center text-sm font-semibold select-none'>
                            {item.quantity}
                          </span>
                          <button
                            className='px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                          >
                            <Plus className='w-3 h-3' />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className='text-right'>
                        <p className='text-base font-bold text-primary'>
                          {formatPrice(item.subtotal)}
                        </p>
                        {item.quantity > 1 && (
                          <p className='text-[10px] text-muted-foreground'>
                            {formatPrice(item.price)} each
                          </p>
                        )}
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
              <CardTitle className='text-lg'>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Subtotal</span>
                  <span className='text-foreground'>
                    {formatPrice(cartData.subtotal)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Shipping estimate</span>
                  <span className='text-green-600 font-medium'>Free</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Tax estimate</span>
                  <span className='text-foreground'>
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <Separator />

              <div className='flex justify-between items-end'>
                <span className='text-base font-semibold'>Order Total</span>
                <span className='text-xl font-bold text-primary'>
                  {formatPrice(cartData.subtotal)}
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
                <span>Secure Checkout</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
