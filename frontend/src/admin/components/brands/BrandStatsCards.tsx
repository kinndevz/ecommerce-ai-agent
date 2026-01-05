import { Store, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useBrandStats } from '@/hooks/useBrands'

export function BrandStatsCards() {
  const { data: stats, isLoading } = useBrandStats()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4 rounded-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const topBrand = stats.top_brands[0]

  const cards = [
    {
      title: 'Total Brands',
      value: stats.total_brands,
      description: 'All brands in system',
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Brands',
      value: stats.active_brands,
      description: 'Currently active',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Inactive Brands',
      value: stats.inactive_brands,
      description: 'Temporarily disabled',
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-500/10',
    },
    {
      title: 'Top Brand',
      value: topBrand?.name || 'N/A',
      description: topBrand ? `${topBrand.product_count} products` : 'No data',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      isText: true,
    },
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={index}
            className='hover:shadow-md transition-shadow duration-200'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {card.isText ? (
                  <span className='text-lg truncate block'>{card.value}</span>
                ) : (
                  card.value
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
