import { Search, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface BrandFiltersProps {
  search: string
  status: 'all' | 'active' | 'inactive'
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  onClearFilters: () => void
}

export function BrandFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClearFilters,
}: BrandFiltersProps) {
  const hasActiveFilters = search !== '' || status !== 'all'

  return (
    <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
      {/* Search Input */}
      <div className='relative w-full sm:w-80'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search brands...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Filters */}
      <div className='flex items-center gap-2 w-full sm:w-auto'>
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) =>
            onStatusChange(value as 'all' | 'active' | 'inactive')
          }
        >
          <SelectTrigger className='w-full sm:w-32'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onClearFilters}
            className='h-10 px-3'
          >
            <X className='h-4 w-4 mr-1' />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
