import { Link } from 'react-router-dom'
import { Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function OrderEmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-20 px-4'>
      <div className='relative mb-8'>
        <div className='absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse' />
        <div className='relative h-32 w-32 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center'>
          <Package className='h-16 w-16 text-primary/60' />
        </div>
      </div>

      <div className='text-center space-y-3 max-w-md'>
        <h3 className='text-2xl font-bold'>Chưa có đơn hàng nào</h3>
        <p className='text-muted-foreground leading-relaxed'>
          Bạn chưa thực hiện đơn hàng nào. Hãy khám phá các sản phẩm tuyệt vời
          của chúng tôi!
        </p>
      </div>

      <Button
        asChild
        size='lg'
        className='mt-8 shadow-lg hover:shadow-xl transition-all'
      >
        <Link to='/products'>
          <ShoppingBag className='mr-2 h-5 w-5' />
          Khám phá sản phẩm
        </Link>
      </Button>
    </div>
  )
}
