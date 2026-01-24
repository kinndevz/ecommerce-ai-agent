import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Star,
  Eye,
  Trophy,
  MoreHorizontal,
  Home,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useProductStats } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { formatUsdPrice } from '@/domains/admin/helpers/product.helpers'

export function ProductsStats() {
  const { data, isLoading } = useProductStats()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='h-8 w-48 bg-muted rounded-md animate-pulse' />{' '}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-32 rounded-xl bg-muted-foreground' />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className='h-96 rounded-xl bg-muted-foreground' />
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.data

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      change: '+20.1%',
      isPositive: true,
      icon: Package,
      textColor: 'text-blue-600',
    },
    {
      title: 'In Stock',
      value: stats.available_products,
      change: '+5.02%',
      isPositive: true,
      icon: CheckCircle,
      textColor: 'text-emerald-600',
    },
    {
      title: 'Avg. Price',
      value: formatUsdPrice(stats.average_price),
      change: '+3.1%',
      isPositive: true,
      icon: DollarSign,
      textColor: 'text-violet-600',
    },
    {
      title: 'Out of Stock',
      value: stats.out_of_stock,
      change: '-3.58%',
      isPositive: false,
      icon: AlertCircle,
      textColor: 'text-rose-600',
    },
  ]

  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 hover:bg-transparent pl-0'
          onClick={() => navigate('/admin/dashboard')}
        >
          <Home className='w-4 h-4' />
        </Button>
        <ChevronRight className='w-4 h-4 text-muted-foreground/50' />
        <span
          className='hover:text-foreground cursor-pointer transition-colors'
          onClick={() => navigate('/admin/products')}
        >
          Products
        </span>
        <ChevronRight className='w-4 h-4 text-muted-foreground/50' />
        <span className='font-medium text-foreground'>Overview</span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className='shadow-sm border-border/60 hover:shadow-md transition-all'
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between space-y-0 pb-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {stat.title}
                  </p>
                  <Icon className={cn('h-4 w-4', stat.textColor)} />
                </div>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-2xl font-bold tracking-tight'>
                    {stat.value}
                  </h3>
                  <div
                    className={cn(
                      'flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
                      stat.isPositive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                    )}
                  >
                    {stat.isPositive ? (
                      <TrendingUp className='h-3 w-3 mr-1' />
                    ) : (
                      <TrendingDown className='h-3 w-3 mr-1' />
                    )}
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='shadow-sm border-border/60 flex flex-col h-full'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div className='space-y-1'>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <Trophy className='w-4 h-4 text-amber-500' />
                Top Rated Products
              </CardTitle>
              <p className='text-xs text-muted-foreground'>
                Highest customer satisfaction
              </p>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent className='pt-2 flex-1'>
            <div className='space-y-4'>
              {stats.top_rated_products.map((product, index) => (
                <div
                  key={index}
                  className='flex items-center gap-4 group p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer'
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border shrink-0 transition-colors',
                      index === 0
                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                        : index === 1
                        ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        : index === 2
                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'bg-background text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>
                      {product.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {product.reviews.toLocaleString()} verified reviews
                    </p>
                  </div>

                  <div className='flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md'>
                    <Star className='w-3 h-3 fill-amber-500 text-amber-500' />
                    <span className='text-xs font-semibold text-amber-700 dark:text-amber-400'>
                      {product.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Viewed */}
        <Card className='shadow-sm border-border/60 flex flex-col h-full'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div className='space-y-1'>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <Eye className='w-4 h-4 text-indigo-500' />
                Most Viewed
              </CardTitle>
              <p className='text-xs text-muted-foreground'>
                Trending interest this month
              </p>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent className='pt-2 flex-1'>
            <div className='space-y-4'>
              {stats.top_viewed_products.map((product, index) => (
                <div
                  key={index}
                  className='flex items-center gap-4 group p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer'
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border shrink-0',
                      index < 3
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'bg-background text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>
                      {product.name}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-25'>
                        <div
                          className='h-full bg-indigo-500 rounded-full'
                          style={{
                            width: `${Math.min(
                              (product.views /
                                (stats.top_viewed_products[0]?.views || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant='secondary'
                    className='font-mono font-normal text-xs'
                  >
                    {product.views.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
