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
import type { PermissionQueryParams } from '@/api/permission.api'
import {
  HTTP_METHOD,
  HTTP_METHOD_CONFIG,
} from '@/api/services/http-method.constants'

interface PermissionFiltersProps {
  filters: PermissionQueryParams
  onFilterChange: (filters: PermissionQueryParams) => void
  onClearFilters: () => void
  availableModules: string[]
}

export function PermissionFilters({
  filters,
  onFilterChange,
  onClearFilters,
  availableModules,
}: PermissionFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handleMethodChange = (value: string) => {
    onFilterChange({
      ...filters,
      method: value === 'all' ? undefined : value,
    })
  }

  const handleModuleChange = (value: string) => {
    onFilterChange({
      ...filters,
      module: value === 'all' ? undefined : value,
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.method,
    filters.module,
  ].filter(Boolean).length

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search by name or path...'
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

        {/* Method Filter */}
        <Select
          value={filters.method || 'all'}
          onValueChange={handleMethodChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Method' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Methods</SelectItem>
            {Object.values(HTTP_METHOD).map((method) => {
              const config = HTTP_METHOD_CONFIG[method]
              return (
                <SelectItem key={method} value={method}>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${config.badgeColor}`}
                    />
                    {method}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Module Filter */}
        <Select
          value={filters.module || 'all'}
          onValueChange={handleModuleChange}
        >
          <SelectTrigger className='w-45'>
            <SelectValue placeholder='Module' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Modules</SelectItem>
            {availableModules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
