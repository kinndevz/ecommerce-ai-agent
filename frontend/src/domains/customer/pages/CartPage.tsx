import { useCart, useClearCart } from '@/hooks/useCarts'
import { Navbar } from '../components/layout/Navbar'
import { CartSkeleton } from '../components/cart/CartSkeleton'
import { EmptyCart } from '../components/cart/CartEmpty'
import { CartItem } from '../components/cart/CartItem'
import { ContinueShopping } from '../components/cart/ContinueShopping'
import { CartSummary } from '../components/cart/CartSummary'
import { ClearCartDialog } from '../components/cart/ClearCartDialog'
import { Footer } from '../components/layout/Footer'

export default function CartPage() {
  const { data: cartResponse, isLoading } = useCart()
  const { mutate: clearCart, isPending: isClearing } = useClearCart()

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <Navbar />
        <CartSkeleton />
      </div>
    )
  }

  const cart = cartResponse
  const hasItems = cart && cart.items.length > 0

  return (
    <div className='min-h-screen bg-[#fafafa] dark:bg-background flex flex-col'>
      <Navbar />

      <main className='flex-1 container mx-auto px-4 py-10 md:py-20'>
        {!hasItems ? (
          <EmptyCart />
        ) : (
          <div className='max-w-7xl mx-auto'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10'>
              <div className='space-y-1'>
                <h1 className='text-4xl font-medium tracking-tight'>
                  Shopping Bag
                </h1>
                <p className='text-muted-foreground text-lg'>
                  You have{' '}
                  <span className='text-foreground font-medium'>
                    {cart.total_items} items
                  </span>{' '}
                  in your cart
                </p>
              </div>

              <ClearCartDialog
                onConfirm={() => clearCart()}
                isPending={isClearing}
              />
            </div>

            <div className='grid gap-10 lg:grid-cols-12 items-start'>
              {/* Left Column: List Items */}
              <div className='lg:col-span-8'>
                <div className='bg-card rounded-md border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden'>
                  <div className='divide-y divide-border/60 px-6 sm:px-8'>
                    {cart.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                <div className='mt-8 flex justify-start'>
                  <ContinueShopping />
                </div>
              </div>

              {/* Right Column: Summary */}
              <aside className='lg:col-span-4 lg:sticky lg:top-28'>
                <CartSummary
                  subtotal={cart.subtotal}
                  totalItems={cart.total_items}
                />

                {/* Additional Info Under Summary */}
                <div className='mt-6 px-2 space-y-4'>
                  <div className='flex items-start gap-3 text-sm text-muted-foreground'>
                    <div className='h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0'>
                      <span className='text-[10px] text-primary font-bold'>
                        ✓
                      </span>
                    </div>
                    <p>Free returns within 30 days for all orders.</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
