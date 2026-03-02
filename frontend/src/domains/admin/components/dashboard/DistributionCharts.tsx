import * as React from 'react'
import { Label, Pie, PieChart, Sector } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/components/ui/chart'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import {
  useOrderAnalytics,
  useCategoryRevenue,
  useBrandRevenue,
} from '@/hooks/useAnalytics'
import type { DateRangeParams } from '@/api/analytic.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function translateStatus(status: string) {
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    returned: 'Trả hàng',
  }
  return map[status.toLowerCase()] || status
}

export function OrderStatusChart({ params }: { params: DateRangeParams }) {
  const { data, isLoading } = useOrderAnalytics(params)

  const { chartData, chartConfig } = React.useMemo(() => {
    if (!data?.data.by_status) return { chartData: [], chartConfig: {} }

    const config: ChartConfig = {}
    const processedData = data.data.by_status.map((item, index) => {
      const statusKey = item.status
      const label = translateStatus(item.status)
      const color = CHART_COLORS[index % CHART_COLORS.length]

      config[statusKey] = {
        label: label,
        color: color,
      }

      return {
        ...item,
        status: statusKey,
        fill: color,
      }
    })

    return { chartData: processedData, chartConfig: config }
  }, [data])

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  if (isLoading) return <LoadingSkeleton />

  return (
    <Card className='col-span-1 flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Trạng thái đơn hàng</CardTitle>
        <CardDescription>Phân bố theo trạng thái xử lý</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-75'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='status'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Đơn hàng
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey='status' />}
              className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function MarketShareChart({ params }: { params: DateRangeParams }) {
  const { data: catData, isLoading: catLoading } = useCategoryRevenue(params)
  const { data: brandData, isLoading: brandLoading } = useBrandRevenue(params)

  const processDynamicData = (items: any[]) => {
    if (!items) return { chartData: [], chartConfig: {} }

    const config: ChartConfig = {}
    const chartData = items.map((item, index) => {
      const safeKey = `item_${index}`
      const color = CHART_COLORS[index % CHART_COLORS.length]

      // Setup Config
      config[safeKey] = {
        label: item.label,
        color: color,
      }

      return {
        keyConfig: safeKey,
        value: item.value,
        label: item.label,
        fill: color,
      }
    })

    return { chartData, chartConfig: config }
  }

  const categoryProcessed = React.useMemo(
    () => processDynamicData(catData?.data.breakdown || []),
    [catData]
  )
  const brandProcessed = React.useMemo(
    () => processDynamicData(brandData?.data.breakdown || []),
    [brandData]
  )

  if (catLoading || brandLoading) return <LoadingSkeleton />

  return (
    <Card className='col-span-1 flex flex-col'>
      <CardHeader className='items-center pb-4'>
        <CardTitle>Thị phần doanh thu</CardTitle>
        <CardDescription>Theo Danh mục & Thương hiệu</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <Tabs defaultValue='category' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 mb-4'>
            <TabsTrigger value='category'>Danh mục</TabsTrigger>
            <TabsTrigger value='brand'>Thương hiệu</TabsTrigger>
          </TabsList>

          {/* TAB DANH MỤC */}
          <TabsContent value='category' className='outline-none'>
            {categoryProcessed.chartData.length > 0 ? (
              <ChartContainer
                config={categoryProcessed.chartConfig}
                className='mx-auto aspect-square max-h-75'
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrencyVnd(Number(value))}
                      />
                    }
                  />
                  <Pie
                    data={categoryProcessed.chartData}
                    dataKey='value'
                    nameKey='keyConfig'
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey='keyConfig' />}
                    className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center'
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value='brand' className='outline-none'>
            {brandProcessed.chartData.length > 0 ? (
              <ChartContainer
                config={brandProcessed.chartConfig}
                className='mx-auto aspect-square max-h-75'
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrencyVnd(Number(value))}
                      />
                    }
                  />
                  <Pie
                    data={brandProcessed.chartData}
                    dataKey='value'
                    nameKey='keyConfig'
                    innerRadius={60}
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey='keyConfig' />}
                    className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center'
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <Card className='col-span-1 flex flex-col justify-center items-center h-87.5'>
      <div className='animate-pulse text-muted-foreground'>Đang tải...</div>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className='flex h-75 items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg'>
      Chưa có dữ liệu
    </div>
  )
}
