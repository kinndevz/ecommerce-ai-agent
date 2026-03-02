import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useRevenueAnalytics, useOrderAnalytics } from '@/hooks/useAnalytics'
import type { DateRangeParams } from '@/api/analytic.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

const chartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: 'var(--primary)',
  },
  orders: {
    label: 'Đơn hàng',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function RevenueChart({ params }: { params: DateRangeParams }) {
  const { data: revenueData, isLoading: revLoading } =
    useRevenueAnalytics(params)
  const { data: orderData, isLoading: ordLoading } = useOrderAnalytics(params)

  const [activeMetric, setActiveMetric] = React.useState<
    'all' | 'revenue' | 'orders'
  >('all')

  const chartData = React.useMemo(() => {
    if (!revenueData?.data.trend || !orderData?.data.trend) return []
    return revenueData.data.trend.map((item, index) => ({
      date: item.date,
      displayDate: new Date(item.date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      }),
      revenue: item.value,
      orders: orderData.data.trend[index]?.value || 0,
    }))
  }, [revenueData, orderData])

  if (revLoading || ordLoading) {
    return (
      <Card className='col-span-1 lg:col-span-2 h-100 flex items-center justify-center'>
        <div className='text-muted-foreground animate-pulse'>
          Đang tải dữ liệu...
        </div>
      </Card>
    )
  }

  return (
    <Card className='col-span-1 lg:col-span-2 shadow-sm'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1 text-center sm:text-left'>
          <CardTitle>Hiệu quả kinh doanh</CardTitle>
          <CardDescription>
            Theo dõi chi tiết Doanh thu và Đơn hàng theo thời gian
          </CardDescription>
        </div>

        <Select
          value={activeMetric}
          onValueChange={(val: any) => setActiveMetric(val)}
        >
          <SelectTrigger
            className='w-40 rounded-lg sm:ml-auto'
            aria-label='Select a value'
          >
            <SelectValue placeholder='Hiển thị' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='all' className='rounded-lg'>
              Tất cả chỉ số
            </SelectItem>
            <SelectItem value='revenue' className='rounded-lg'>
              Chỉ Doanh thu
            </SelectItem>
            <SelectItem value='orders' className='rounded-lg'>
              Chỉ Đơn hàng
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-87.5 w-full'
        >
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-revenue)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-revenue)'
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id='fillOrders' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-orders)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-orders)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray='3 3'
              stroke='var(--border)'
            />

            <XAxis
              dataKey='displayDate'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: 'var(--muted-foreground)' }}
            />

            <YAxis
              yAxisId='revenue'
              orientation='left'
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              tick={{ fill: 'var(--primary)', fontSize: 12 }}
              width={50}
              hide={activeMetric === 'orders'}
              domain={[0, 'auto']}
            />

            <YAxis
              yAxisId='orders'
              orientation='right'
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, 'auto']}
              tickFormatter={(value) => value.toString()}
              tick={{ fill: 'var(--chart-2)', fontSize: 12 }}
              width={30}
              hide={activeMetric === 'revenue'}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Ngày ${value}`}
                  indicator='dot'
                  formatter={(value, name) => (
                    <div className='flex min-w-32.5 items-center gap-2 text-xs text-muted-foreground'>
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className='ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground'>
                        {name === 'revenue'
                          ? formatCurrencyVnd(Number(value))
                          : value}
                      </div>
                    </div>
                  )}
                />
              }
            />

            {(activeMetric === 'all' || activeMetric === 'revenue') && (
              <Area
                yAxisId='revenue'
                dataKey='revenue'
                type='monotone'
                fill='url(#fillRevenue)'
                stroke='var(--color-revenue)'
                strokeWidth={2}
                stackId='1'
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'orders') && (
              <Area
                yAxisId='orders'
                dataKey='orders'
                type='monotone'
                fill='url(#fillOrders)'
                stroke='var(--color-orders)'
                strokeWidth={2}
                stackId='2'
              />
            )}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
