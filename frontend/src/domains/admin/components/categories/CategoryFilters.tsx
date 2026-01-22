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

interface CategoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: 'all' | 'active' | 'inactive'
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  onClearFilters: () => void
}

export function CategoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onClearFilters,
}: CategoryFiltersProps) {
  const hasFilters = search || status !== 'all'

  return (
    <div className='flex flex-col sm:flex-row gap-3'>
      {/* Search */}
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Search categories...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant='ghost'
          onClick={onClearFilters}
          className='whitespace-nowrap'
        >
          <X className='w-4 h-4 mr-2' />
          Clear
        </Button>
      )}
    </div>
  )
}
