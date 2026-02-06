import { ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'

export const CartEmptyState = () => {
  return (
    <Card className='w-full border-dashed shadow-sm'>
      <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4'>
          <ShoppingCart className='w-8 h-8 text-muted-foreground' />
        </div>
        <h3 className='font-semibold text-lg'>Giỏ hàng trống</h3>
        <p className='text-sm text-muted-foreground mt-1'>
          Hãy thêm sản phẩm để bắt đầu mua sắm
        </p>
      </CardContent>
    </Card>
  )
}
