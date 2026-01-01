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
import { useCategories } from '@/hooks/useCategories'
import type { ProductQueryParams } from '@/api/product.api'
import type { CategoryTreeNode } from '@/api/category.api'

interface ProductsFiltersProps {
  filters: ProductQueryParams
  onFilterChange: (filters: ProductQueryParams) => void
  onClearFilters: () => void
}

// Flatten category tree for dropdown
function flattenCategories(categories: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = []

  function traverse(cats: CategoryTreeNode[], depth = 0) {
    for (const cat of cats) {
      result.push({ ...cat, display_order: depth })
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children, depth + 1)
      }
    }
  }

  traverse(categories)
  return result
}

export function ProductsFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductsFiltersProps) {
  const { categories, isLoading: categoriesLoading } = useCategories()
  const flatCategories = flattenCategories(categories)

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      category_id: value === 'all' ? undefined : value,
    })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      is_available: value === 'all' ? undefined : value === 'available',
    })
  }

  const handleFeaturedChange = (value: string) => {
    onFilterChange({
      ...filters,
      is_featured: value === 'all' ? undefined : value === 'featured',
    })
  }

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    onFilterChange({
      ...filters,
      [type === 'min' ? 'min_price' : 'max_price']: numValue,
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.category_id,
    filters.is_available !== undefined,
    filters.is_featured !== undefined,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search products...'
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

        {/* Category Filter */}
        <Select
          value={filters.category_id || 'all'}
          onValueChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <SelectTrigger className='w-45'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {flatCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {'—'.repeat(cat.display_order)} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={
            filters.is_available === undefined
              ? 'all'
              : filters.is_available
              ? 'available'
              : 'unavailable'
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='available'>Active</SelectItem>
            <SelectItem value='unavailable'>Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select
          value={
            filters.is_featured === undefined
              ? 'all'
              : filters.is_featured
              ? 'featured'
              : 'not-featured'
          }
          onValueChange={handleFeaturedChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Featured' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Products</SelectItem>
            <SelectItem value='featured'>Featured</SelectItem>
            <SelectItem value='not-featured'>Not Featured</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Price:</span>
          <Input
            type='number'
            placeholder='Min'
            value={filters.min_price || ''}
            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
            className='w-24'
          />
          <span className='text-muted-foreground'>-</span>
          <Input
            type='number'
            placeholder='Max'
            value={filters.max_price || ''}
            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
            className='w-24'
          />
        </div>
      </div>
    </div>
  )
}
