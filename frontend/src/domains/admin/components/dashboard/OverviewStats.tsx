import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingBag,
  Users,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAnalyticsOverview } from '@/hooks/useAnalytics'
import type { DateRangeParams } from '@/api/analytic.api'

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  trend: number
  loading?: boolean
  colorClass: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  loading,
  colorClass,
}: StatCardProps) {
  if (loading) return <Skeleton className='h-30 w-full rounded-xl' />

  const isPositive = trend >= 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className='h-4 w-4' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <div className='flex items-center text-xs mt-1'>
          {isPositive ? (
            <ArrowUp className='mr-1 h-4 w-4 text-emerald-500' />
          ) : (
            <ArrowDown className='mr-1 h-4 w-4 text-red-500' />
          )}
          <span
            className={`font-bold ${
              isPositive ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {Math.abs(trend)}%
          </span>
          <span className='text-muted-foreground ml-1'>so với kỳ trước</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function OverviewStats({ params }: { params: DateRangeParams }) {
  const { data, isLoading } = useAnalyticsOverview(params)

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='Tổng Doanh Thu'
        value={data?.data.revenue.formatted_current || '0 ₫'}
        icon={DollarSign}
        trend={data?.data.revenue.growth_rate || 0}
        loading={isLoading}
        colorClass='text-primary bg-primary/10'
      />
      <StatCard
        title='Tổng Đơn Hàng'
        value={data?.data.orders.formatted_current || '0'}
        icon={ShoppingBag}
        trend={data?.data.orders.growth_rate || 0}
        loading={isLoading}
        colorClass='text-blue-500 bg-blue-500/10'
      />
      <StatCard
        title='Khách Hàng Mới'
        value={data?.data.customers.formatted_current || '0'}
        icon={Users}
        trend={data?.data.customers.growth_rate || 0}
        loading={isLoading}
        colorClass='text-orange-500 bg-orange-500/10'
      />
      <StatCard
        title='Giá Trị TB Đơn'
        value={data?.data.avg_order_value.formatted_current || '0 ₫'}
        icon={Activity}
        trend={data?.data.avg_order_value.growth_rate || 0}
        loading={isLoading}
        colorClass='text-emerald-500 bg-emerald-500/10'
      />
    </div>
  )
}
