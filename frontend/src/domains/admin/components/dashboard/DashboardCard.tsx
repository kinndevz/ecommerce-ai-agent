import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  loading?: boolean
  className?: string
  action?: ReactNode
}

export function DashboardCard({
  title,
  subtitle,
  children,
  loading,
  className,
  action,
}: DashboardCardProps) {
  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <Skeleton className='h-5 w-37.5' />
          {subtitle && <Skeleton className='h-4 w-25 mt-2' />}
        </CardHeader>
        <CardContent>
          <Skeleton className='h-50 w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-base font-semibold'>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className='flex-1 pt-4 min-h-0'>{children}</CardContent>
    </Card>
  )
}
