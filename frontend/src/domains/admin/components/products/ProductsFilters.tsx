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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { useCategories } from '@/hooks/useCategories'
import type { ProductQueryParams } from '@/api/product.api'
import { useState } from 'react'
import { flattenCategoryOptions } from '@/domains/admin/helpers/product.helpers'

interface ProductsFiltersProps {
  filters: ProductQueryParams
  onFilterChange: (filters: ProductQueryParams) => void
  onClearFilters: () => void
}

export function ProductsFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductsFiltersProps) {
  const { categories, isLoading: categoriesLoading } = useCategories()
  const flatCategories = flattenCategoryOptions(categories)

  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category_id ? [filters.category_id] : []
  )

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]

    setSelectedCategories(newSelected)

    // For now, only use first selected category
    onFilterChange({
      ...filters,
      category_id: newSelected[0] || undefined,
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

  const handlePriceFromChange = (value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    onFilterChange({
      ...filters,
      min_price: numValue,
    })
  }

  const handlePriceToChange = (value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    onFilterChange({
      ...filters,
      max_price: numValue,
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

  const filteredCategories = flatCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const selectedCategoryNames = flatCategories
    .filter((cat) => selectedCategories.includes(cat.id))
    .map((cat) => cat.name)

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

        {/* Category Filter - UPDATED WITH SEARCH & CHECKBOXES */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='w-45 justify-between'
              disabled={categoriesLoading}
            >
              <span className='truncate'>
                {selectedCategories.length > 0
                  ? `${selectedCategoryNames[0]}${
                      selectedCategories.length > 1
                        ? ` +${selectedCategories.length - 1}`
                        : ''
                    }`
                  : 'All Categories'}
              </span>
              {selectedCategories.length > 0 && (
                <Badge variant='secondary' className='ml-2 px-1.5 rounded-sm'>
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-64 p-0' align='start'>
            {/* Search inside popover */}
            <div className='p-2 border-b'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground' />
                <Input
                  placeholder='Search category...'
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className='h-8 pl-8 text-sm'
                />
              </div>
            </div>

            {/* Categories list */}
            <div className='max-h-64 overflow-y-auto p-2'>
              <div className='space-y-1'>
                {filteredCategories.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    No categories found
                  </p>
                ) : (
                  filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      className='w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent'
                      style={{ paddingLeft: `${cat.level * 12 + 8}px` }}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        className='pointer-events-none'
                      />
                      <span className='flex-1 text-left'>{cat.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Status Filter - KEEP ORIGINAL */}
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

        {/* Featured Filter - KEEP ORIGINAL */}
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

        {/* Price Range - UPDATED WITH POPOVER */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='gap-2'>
              <span className='text-sm text-muted-foreground'>Price:</span>
              {filters.min_price || filters.max_price ? (
                <span className='font-medium'>
                  {filters.min_price && filters.max_price
                    ? `$${filters.min_price}-$${filters.max_price}`
                    : filters.min_price
                    ? `$${filters.min_price}+`
                    : `<$${filters.max_price}`}
                </span>
              ) : (
                <span>All</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-72 p-4' align='start'>
            <div className='space-y-4'>
              <div>
                <Label className='text-sm font-medium mb-3 block'>
                  Price Range
                </Label>
                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <Label
                      htmlFor='price-from'
                      className='text-xs text-muted-foreground mb-1.5 block'
                    >
                      From
                    </Label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                        $
                      </span>
                      <Input
                        id='price-from'
                        type='number'
                        placeholder='0'
                        value={filters.min_price || ''}
                        onChange={(e) => handlePriceFromChange(e.target.value)}
                        className='pl-6 h-9'
                      />
                    </div>
                  </div>

                  <div className='pt-5'>
                    <div className='w-3 h-px bg-border' />
                  </div>

                  <div className='flex-1'>
                    <Label
                      htmlFor='price-to'
                      className='text-xs text-muted-foreground mb-1.5 block'
                    >
                      To
                    </Label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                        $
                      </span>
                      <Input
                        id='price-to'
                        type='number'
                        placeholder='1000'
                        value={filters.max_price || ''}
                        onChange={(e) => handlePriceToChange(e.target.value)}
                        className='pl-6 h-9'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
