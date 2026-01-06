import { FolderTree, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCategoryStats } from '@/hooks/useCategories'

export function CategoryStatsCards() {
  const { data: stats, isLoading } = useCategoryStats()

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <Skeleton className='h-4 w-24 mb-2' />
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: 'Total Categories',
      value: stats.total_categories,
      description: 'All categories',
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active',
      value: stats.active_categories,
      description: 'Currently active',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Parent Categories',
      value: stats.parent_categories,
      description: 'Top level categories',
      icon: FolderTree,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Top Category',
      value: stats.top_categories[0]?.product_count || 0,
      description: stats.top_categories[0]?.name || 'N/A',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card, index) => (
        <Card
          key={index}
          className='overflow-hidden hover:shadow-md transition-shadow'
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-3'>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>
                {card.title}
              </p>
              <h3 className='text-2xl font-bold mb-1'>{card.value}</h3>
              <p className='text-xs text-muted-foreground truncate'>
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
