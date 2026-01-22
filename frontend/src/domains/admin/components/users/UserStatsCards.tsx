import { Users, UserCheck, UserX, Shield } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'
import type { UserStats } from '@/api/user.api'

interface UserStatsCardsProps {
  stats?: UserStats
  isLoading?: boolean
}

export function UserStatsCards({ stats, isLoading }: UserStatsCardsProps) {
  const statsData = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.total_users || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: UserCheck,
      label: 'Active Users',
      value: stats?.active_users || 0,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: UserX,
      label: 'Inactive Users',
      value: stats?.inactive_users || 0,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Shield,
      label: '2FA Enabled',
      value: stats?.users_with_2fa || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='animate-pulse'>
                <div className='w-10 h-10 bg-muted rounded-lg mb-3' />
                <div className='h-4 bg-muted rounded w-20 mb-2' />
                <div className='h-8 bg-muted rounded w-16' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className='border-2'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{stat.label}</p>
                  <p className='text-2xl font-bold'>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
