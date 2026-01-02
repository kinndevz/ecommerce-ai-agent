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
import type { UserQueryParams } from '@/api/user.api'
import {
  USER_ROLE,
  USER_ROLE_CONFIG,
  USER_STATUS,
  USER_STATUS_CONFIG,
} from '@/api/services/user.constants'

interface UserFiltersProps {
  filters: UserQueryParams
  onFilterChange: (filters: UserQueryParams) => void
  onClearFilters: () => void
}

export function UserFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: UserFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as any),
    })
  }

  const handleRoleChange = (value: string) => {
    onFilterChange({
      ...filters,
      role: value === 'all' ? undefined : (value as any),
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.status,
    filters.role,
  ].filter(Boolean).length

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search by name or email...'
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
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            {Object.entries(USER_STATUS).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {USER_STATUS_CONFIG[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Filter */}
        <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            {Object.entries(USER_ROLE).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {USER_ROLE_CONFIG[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
