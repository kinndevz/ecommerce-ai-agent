import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import type { RoleQueryParams } from '@/api/role.api'

interface RoleFiltersProps {
  filters: RoleQueryParams
  onFilterChange: (filters: RoleQueryParams) => void
  onClearFilters: () => void
}

export function RoleFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: RoleFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      is_active: value === 'all' ? undefined : value === 'active',
    })
  }

  const activeFiltersCount = [filters.search, filters.is_active].filter(
    (v) => v !== undefined
  ).length

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search by role name...'
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant='outline'
            size='sm'
            onClick={onClearFilters}
            className='gap-2'
          >
            <X className='w-4 h-4' />
            Clear Filters
            <Badge variant='secondary' className='ml-1'>
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className='flex items-center gap-3 flex-wrap'>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-muted-foreground' />
          <span className='text-sm font-medium text-muted-foreground'>
            Filters:
          </span>
        </div>

        {/* Status Filter */}
        <Select
          value={
            filters.is_active === undefined
              ? 'all'
              : filters.is_active
              ? 'active'
              : 'inactive'
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
