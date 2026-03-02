import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { Download } from 'lucide-react'
import { AnalyticsPeriod, type DateRangeParams } from '@/api/analytic.api'
import { OverviewStats } from './OverviewStats'
import { RevenueChart } from './RevenueChart'
import { MarketShareChart, OrderStatusChart } from './DistributionCharts'
import { CustomerInsights } from './CustomerInsights'
import { TopProductsTable } from './TopProductsTable'
import { InventoryAlerts } from './InventoryAlerts'

export default function DashboardPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(
    AnalyticsPeriod.THIRTY_DAYS
  )

  const params: DateRangeParams = {
    period: period,
  }

  return (
    <div className='flex flex-col space-y-6 p-8 bg-background min-h-screen animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            Analytics Overview
          </h1>
          <p className='text-muted-foreground mt-1'>
            Theo dõi sức khỏe và xu hướng kinh doanh của bạn.
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Select
            value={period}
            onValueChange={(val) => setPeriod(val as AnalyticsPeriod)}
          >
            <SelectTrigger className='w-45'>
              <SelectValue placeholder='Chọn kỳ báo cáo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AnalyticsPeriod.SEVEN_DAYS}>
                7 ngày qua
              </SelectItem>
              <SelectItem value={AnalyticsPeriod.THIRTY_DAYS}>
                30 ngày qua
              </SelectItem>
              <SelectItem value={AnalyticsPeriod.NINETY_DAYS}>
                3 tháng qua
              </SelectItem>
              <SelectItem value={AnalyticsPeriod.ONE_YEAR}>Năm qua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='default'>
            <Download className='mr-2 h-4 w-4' /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <OverviewStats params={params} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='col-span-1 lg:col-span-2'>
          <RevenueChart params={params} />
        </div>

        <div className='col-span-1'>
          <OrderStatusChart params={params} />
        </div>
        <div className='col-span-1'>
          <MarketShareChart params={params} />
        </div>

        <div className='col-span-1 lg:col-span-2'>
          <TopProductsTable params={params} />
        </div>

        <div className='col-span-1'>
          <CustomerInsights params={params} />
        </div>
        <div className='col-span-1'>
          <InventoryAlerts />
        </div>
      </div>
    </div>
  )
}
