import { FileText, HardDrive, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'

interface DocumentStatsProps {
  totalDocuments: number
  storageUsed: string
  recentUploads: number
}

export function DocumentStats({
  totalDocuments,
  storageUsed,
  recentUploads,
}: DocumentStatsProps) {
  const stats = [
    {
      icon: FileText,
      label: 'Total Documents',
      value: totalDocuments.toLocaleString(),
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: storageUsed,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      icon: Clock,
      label: 'Recent Uploads',
      value: `${recentUploads} today`,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className='bg-card border-border'>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-muted-foreground mb-2'>
                    {stat.label}
                  </p>
                  <p className='text-3xl font-bold tracking-tight'>
                    {stat.value}
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-6 w-6', stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
