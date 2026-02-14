import { Package as PackageIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { OrderItemRow } from './OrderItemRow'
import type { OrderItem } from '@/api/types/order.types'

interface OrderProductsProps {
  items: OrderItem[]
}

export function OrderProducts({ items }: OrderProductsProps) {
  return (
    <Card className='shadow-md border-border/50 overflow-hidden backdrop-blur-sm bg-card/80'>
      <CardHeader className='border-b bg-linear-to-r from-card to-muted/20'>
        <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
          <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
            <PackageIcon className='h-4 w-4 text-primary' />
          </div>
          <span>Sản phẩm</span>
          <span className='ml-auto text-sm font-normal text-muted-foreground'>
            ({items.length} sản phẩm)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='divide-y divide-border/50'>
          {items.map((item) => (
            <div
              key={item.id}
              className='px-6 hover:bg-muted/30 transition-colors'
            >
              <OrderItemRow item={item} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
