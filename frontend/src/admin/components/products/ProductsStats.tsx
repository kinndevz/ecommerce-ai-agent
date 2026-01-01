import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useProductStats } from '@/hooks/useProducts'

export function ProductsStats() {
  const { data, isLoading } = useProductStats()

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-36 rounded-2xl' />
        ))}
      </div>
    )
  }

  const stats = data?.data

  if (!stats) {
    return null
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      change: '+20.1%',
      isPositive: true,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      bgPattern: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Available Products',
      value: stats.available_products,
      change: '+5.02%',
      isPositive: true,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bgPattern: 'bg-green-500/10',
      iconColor: 'text-green-500',
      lightBg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Average Price',
      value: formatPrice(stats.average_price),
      change: '+3.1%',
      isPositive: true,
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgPattern: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Out of Stock',
      value: stats.out_of_stock,
      change: '-3.58%',
      isPositive: false,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      bgPattern: 'bg-red-500/10',
      iconColor: 'text-red-500',
      lightBg: 'bg-red-50 dark:bg-red-950',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`
              relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 
              hover:-translate-y-1 group ${stat.lightBg}
            `}
          >
            <div
              className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
            />

            <div
              className='absolute -right-8 -top-8 w-32 h-32 rounded-full bg-linear-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-500'
              style={{
                background: `linear-gradient(135deg, currentColor 0%, transparent 70%)`,
              }}
            />

            <div className='relative p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <div
                  className={`p-3 rounded-xl ${stat.bgPattern} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>

                <div className='flex items-center gap-1'>
                  {stat.isPositive ? (
                    <TrendingUp className='w-4 h-4 text-green-500' />
                  ) : (
                    <TrendingDown className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      stat.isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>

              <div>
                <p className='text-3xl font-bold bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent'>
                  {stat.value}
                </p>
                <p className='text-sm text-muted-foreground font-medium mt-1'>
                  {stat.title}
                </p>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-1 bg-linear-to-r ${stat.gradient} w-0 group-hover:w-full transition-all duration-500`}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
