import { ShoppingCart, Package, CheckCircle, Landmark } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useOrderStats } from '@/hooks/useOrders'
import { formatVndCurrency } from '@/domains/admin/helpers/order.helpers'

export function OrderStatsCards() {
  const { data: stats, isLoading } = useOrderStats()

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='overflow-hidden'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <Skeleton className='h-10 w-10 rounded-xl' />
              </div>
              <Skeleton className='h-8 w-32 mb-2' />
              <Skeleton className='h-4 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: 'Total Revenue',
      value: formatVndCurrency(stats.total_revenue),
      description: 'Awaiting confirmation',
      icon: Landmark,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      description: 'All time orders',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completed Orders',
      value: stats.delivered_orders,
      description: 'Successfully delivered',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Cancelled Orders',
      value: stats.cancelled_orders,
      description: 'Cancelled by customer',
      icon: Package,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card, index) => (
        <Card
          key={index}
          className='group overflow-hidden hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/20'
        >
          <CardContent className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div
                className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>
                {card.title}
              </p>
              <h3 className='text-2xl lg:text-3xl font-bold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight'>
                {card.value}
              </h3>
              <p className='text-xs font-medium text-muted-foreground/80'>
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
