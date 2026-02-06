import { useState } from 'react'
import { ShoppingCart, Package } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useChatStore } from '@/stores/useChatStore'
import type { CartData } from '@/api/cart.api'

import { CheckoutDialog } from './CheckoutDialog'
import { CartEmptyState } from './CartEmptyState'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'

interface CartViewProps {
  cartData: CartData
}

export const CartView = ({ cartData }: CartViewProps) => {
  const { sendMessageStreaming } = useChatStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleOrderSubmit = async (payload: any) => {
    const orderPrompt = `Please create_order from the current cart with the following payload:
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\``

    setIsCheckoutOpen(false)
    await sendMessageStreaming(orderPrompt, {
      suppressUserMessage: true,
      isActive: false,
    })
  }

  if (!cartData || cartData.items.length === 0) {
    return <CartEmptyState />
  }

  return (
    <div className='w-full py-4'>
      <Card className='w-full shadow-xl overflow-hidden rounded-2xl border bg-card text-card-foreground'>
        <CardHeader className='pb-4 pt-6 px-6 border-b bg-muted/30 space-y-0'>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-xl font-bold tracking-tight'>
                Giỏ hàng
              </CardTitle>
              <p className='text-xs text-primary font-semibold mt-1 flex items-center gap-1'>
                <Package className='w-3 h-3' />
                {cartData.total_items} sản phẩm
              </p>
            </div>
            <div className='bg-primary/10 p-2.5 rounded-full'>
              <ShoppingCart className='w-5 h-5 text-primary' />
            </div>
          </div>
        </CardHeader>

        {/* ITEMS LIST */}
        <CardContent className='p-0'>
          <ScrollArea className='h-87.5 px-6 py-4'>
            <div className='space-y-4'>
              {cartData.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        {/* SUMMARY & FOOTER */}
        <CartSummary
          subtotal={cartData.subtotal}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      </Card>

      {/* CHECKOUT DIALOG */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        totalItems={cartData.total_items}
        subtotal={cartData.subtotal}
        onSubmitOrder={handleOrderSubmit}
      />
    </div>
  )
}
