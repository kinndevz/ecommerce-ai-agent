import { useState } from 'react'
import { useLowStockProducts } from '@/hooks/useAnalytics'
import { DashboardCard } from './DashboardCard'
import { AlertTriangle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export function InventoryAlerts() {
  const [threshold, setThreshold] = useState('50')
  const { data, isLoading } = useLowStockProducts(Number(threshold), 5)

  return (
    <DashboardCard
      title='Cảnh báo tồn kho'
      loading={isLoading}
      className='col-span-4 lg:col-span-1'
      action={
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground whitespace-nowrap'>
            Mức báo động:
          </span>
          <Select value={threshold} onValueChange={setThreshold}>
            <SelectTrigger className='h-8 w-17.5'>
              <SelectValue placeholder='10' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className='space-y-4'>
        {data?.data.length === 0 ? (
          <p className='text-center text-sm text-muted-foreground py-4'>
            Kho hàng ổn định
          </p>
        ) : (
          data?.data.map((item) => (
            <div
              key={item.product_id}
              className='flex items-center justify-between p-3 border rounded-lg bg-card/50'
            >
              <div className='flex items-center gap-3 overflow-hidden'>
                <div className='h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0'>
                  <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
                </div>
                <div className='min-w-0'>
                  <p
                    className='font-medium text-sm truncate max-w-30'
                    title={item.product_name}
                  >
                    {item.product_name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Còn lại:{' '}
                    <span className='text-red-500 font-bold'>
                      {item.stock_quantity}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  )
}
