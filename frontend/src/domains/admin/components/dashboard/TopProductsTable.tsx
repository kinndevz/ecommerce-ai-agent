import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useTopSellingProducts } from '@/hooks/useAnalytics'
import { DashboardCard } from './DashboardCard'
import { Package } from 'lucide-react'
import type { DateRangeParams } from '@/api/analytic.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

export function TopProductsTable({ params }: { params: DateRangeParams }) {
  const { data, isLoading } = useTopSellingProducts(params, 8)

  return (
    <DashboardCard
      title='Top Selling Products'
      loading={isLoading}
      className='col-span-4 lg:col-span-3'
      action={
        <Button
          variant='ghost'
          size='sm'
          className='text-primary hover:text-primary/80'
        >
          View All
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead className='text-right'>Đã bán</TableHead>
            <TableHead className='text-right'>Doanh thu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((product) => (
            <TableRow key={product.product_id}>
              <TableCell className='font-medium'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0'>
                    <Package className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='overflow-hidden'>
                    <div
                      className='font-semibold truncate max-w-50'
                      title={product.product_name}
                    >
                      {product.product_name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      ID: {product.product_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{product.category_name}</Badge>
              </TableCell>
              <TableCell className='text-right font-bold'>
                {product.total_quantity_sold}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrencyVnd(product.total_revenue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}
