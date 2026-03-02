import { useCustomerAnalytics } from '@/hooks/useAnalytics'
import { DashboardCard } from './DashboardCard'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { Medal, Trophy } from 'lucide-react'
import type { DateRangeParams } from '@/api/analytic.api'
import { getUserInitials } from '../../helpers/user.helpers'

export function CustomerInsights({ params }: { params: DateRangeParams }) {
  const { data, isLoading } = useCustomerAnalytics(params, 5)
  const topSpenders = data?.data.top_spenders || []

  const renderRank = (index: number) => {
    switch (index) {
      case 0:
        return <Medal className='h-6 w-6 text-yellow-500 fill-yellow-500/20' />
      case 1:
        return <Medal className='h-6 w-6 text-slate-400 fill-slate-400/20' />
      case 2: // Top 3: Đồng
        return <Medal className='h-6 w-6 text-amber-700 fill-amber-700/20' />
      default:
        return (
          <span className='h-6 w-6 flex items-center justify-center font-bold text-muted-foreground text-sm'>
            #{index + 1}
          </span>
        )
    }
  }

  return (
    <DashboardCard
      title='Khách hàng VIP'
      loading={isLoading}
      className='col-span-1'
    >
      <div className='space-y-5'>
        {topSpenders.map((customer, index) => (
          <div
            key={customer.user_id}
            className='flex items-center justify-between'
          >
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className='shrink-0 w-8 flex justify-center'>
                {renderRank(index)}
              </div>

              <Avatar className='h-10 w-10 border-2 border-background shadow-sm'>
                {/* Nếu có url ảnh thì uncomment dòng dưới */}
                {/* <AvatarImage src={customer.avatar_url} /> */}
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                  {getUserInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className='min-w-0 flex flex-col'>
                <span className='font-semibold text-sm truncate max-w-30 text-foreground'>
                  {customer.full_name}
                </span>
                <span className='text-xs text-muted-foreground truncate'>
                  {customer.total_orders} đơn hàng
                </span>
              </div>
            </div>

            <div className='text-right shrink-0'>
              <p className='font-bold text-sm text-primary'>
                {formatCurrencyVnd(customer.total_spent)}
              </p>
            </div>
          </div>
        ))}

        {topSpenders.length === 0 && (
          <p className='text-center text-sm text-muted-foreground py-10'>
            Chưa có dữ liệu khách hàng
          </p>
        )}
      </div>
    </DashboardCard>
  )
}
