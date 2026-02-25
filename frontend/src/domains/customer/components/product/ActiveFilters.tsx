import { X } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { SearchQueryParams } from '@/api/product.api'
import { getFilterLabel } from '@/domains/customer/helpers/productFilters.helpers'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { useCategories } from '@/hooks/useCategories'

interface ActiveFiltersProps {
  filters: SearchQueryParams
  onRemoveFilter: (key: keyof SearchQueryParams, value?: string) => void
  onClearAll: () => void
}

interface ActiveFilter {
  key: keyof SearchQueryParams
  value: string
  label: string
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const { getCategoryBySlug } = useCategories()

  const buildActiveFilters = (): ActiveFilter[] => {
    const result: ActiveFilter[] = []

    // In Stock
    if (filters.is_available) {
      result.push({ key: 'is_available', value: 'true', label: 'Hàng có sẵn' })
    }

    // Price Range
    if (filters.min_price || filters.max_price) {
      const min = filters.min_price || 0
      const max = filters.max_price || 5000000
      result.push({
        key: 'min_price',
        value: `${min}-${max}`,
        label: `${formatCurrencyVnd(min)} - ${formatCurrencyVnd(max)}`,
      })
    }

    // Category
    if (filters.category) {
      const category = getCategoryBySlug(filters.category)
      result.push({
        key: 'category',
        value: filters.category,
        label: category?.name || filters.category,
      })
    }

    // Array Filters
    const arrayFilters: Array<{ key: 'skin_types' | 'concerns' | 'benefits' }> =
      [{ key: 'skin_types' }, { key: 'concerns' }, { key: 'benefits' }]

    arrayFilters.forEach(({ key }) => {
      filters[key]?.forEach((value) => {
        result.push({
          key,
          value,
          label: getFilterLabel(key, value),
        })
      })
    })

    return result
  }

  const activeFilters = buildActiveFilters()

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className='flex items-center gap-2 flex-wrap pb-4 border-b'>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value}-${index}`}
          variant='secondary'
          className='gap-1 pr-1'
        >
          {filter.label}
          <Button
            variant='ghost'
            size='icon'
            className='h-4 w-4 p-0 hover:bg-transparent'
            onClick={() => onRemoveFilter(filter.key, filter.value)}
          >
            <X className='h-3 w-3' />
          </Button>
        </Badge>
      ))}
      <Button
        variant='ghost'
        size='sm'
        onClick={onClearAll}
        className='h-7 text-xs'
      >
        Xóa tất cả
      </Button>
    </div>
  )
}
