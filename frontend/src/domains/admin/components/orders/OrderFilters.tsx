import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  ORDER_STATUS,
  type OrderStatusType,
} from '@/api/services/order.constants'

interface OrderFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: OrderStatusType | 'all'
  onStatusFilterChange: (value: OrderStatusType | 'all') => void
  onClearFilters: () => void
  statusCounts?: Record<string, number>
}

export function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  statusCounts,
}: OrderFiltersProps) {
  const hasFilters = search || statusFilter !== 'all'

  const tabs = [
    {
      value: 'all',
      label: 'All orders',
      count: statusCounts?.total || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      value: ORDER_STATUS.PENDING,
      label: 'Pending',
      count: statusCounts?.pending || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      value: ORDER_STATUS.PROCESSING,
      label: 'Processing',
      count: statusCounts?.processing || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      value: ORDER_STATUS.SHIPPED,
      label: 'Shipped',
      count: statusCounts?.shipped || 0,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
    },
    {
      value: ORDER_STATUS.DELIVERED,
      label: 'Delivered',
      count: statusCounts?.delivered || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      value: ORDER_STATUS.CANCELLED,
      label: 'Cancelled',
      count: statusCounts?.cancelled || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className='space-y-4'>
      {/* Status Tabs */}
      <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide'>
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() =>
                onStatusFilterChange(tab.value as OrderStatusType | 'all')
              }
              className={`
                group flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200 border-2
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105'
                    : 'bg-card hover:bg-muted/50 text-muted-foreground border-transparent hover:border-border/50'
                }
              `}
            >
              <span className='font-semibold'>{tab.label}</span>
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className={`
                  ml-1 font-bold transition-all
                  ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : ''
                  }
                `}
              >
                {tab.count}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Search & Clear */}
      <div className='flex items-center gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <Input
            placeholder='Search by order number, customer name...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-12 h-12 text-base border-2 focus-visible:ring-2'
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant='outline'
            onClick={onClearFilters}
            className='h-12 px-5 border-2 hover:border-destructive/50 hover:text-destructive transition-colors'
          >
            <X className='w-4 h-4 mr-2' />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
