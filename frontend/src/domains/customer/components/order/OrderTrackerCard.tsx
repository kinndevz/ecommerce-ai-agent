import { TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { OrderTracker } from './OrderTracker'

interface OrderTrackerCardProps {
  status: string
}

export function OrderTrackerCard({ status }: OrderTrackerCardProps) {
  return (
    <Card className='shadow-md border-border/50 overflow-hidden backdrop-blur-sm bg-card/80'>
      <CardHeader className='border-b bg-linear-to-r from-card to-muted/20'>
        <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
          <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
            <TrendingUp className='h-4 w-4 text-primary' />
          </div>
          <span>Trạng thái vận chuyển</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <OrderTracker status={status} />
      </CardContent>
    </Card>
  )
}
