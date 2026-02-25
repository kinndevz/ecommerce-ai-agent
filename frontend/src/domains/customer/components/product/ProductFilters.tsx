import { useState } from 'react'
import { Slider } from '@/shared/components/ui/slider'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Switch } from '@/shared/components/ui/switch'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import type { SearchQueryParams } from '@/api/product.api'
import { SkinType, SkinConcern, ProductBenefit } from '@/api/services/enums'
import {
  SKIN_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  PRODUCT_BENEFIT_OPTIONS,
  flattenCategories,
  countActiveFilters,
} from '@/domains/customer/helpers/productFilters.helpers'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { useCategories } from '@/hooks/useCategories'
import { FilterSection } from './FilterSection'
import { FilterCheckbox } from './FilterCheckbox'

interface ProductFiltersProps {
  filters: SearchQueryParams
  onFiltersChange: (filters: SearchQueryParams) => void
  onReset: () => void
}

export function ProductFilters({
  filters,
  onFiltersChange,
  onReset,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 5000000,
  ])

  const { categories } = useCategories()
  const flatCategories = flattenCategories(categories)
  const activeCount = countActiveFilters(filters)

  const handlePriceCommit = (values: number[]) => {
    setPriceRange(values)
    onFiltersChange({
      ...filters,
      min_price: values[0] || undefined,
      max_price: values[1] || undefined,
    })
  }

  const toggleSkinType = (value: string) => {
    const current = filters.skin_types || []
    const updated = current.includes(value as SkinType)
      ? current.filter((v) => v !== value)
      : [...current, value as SkinType]

    onFiltersChange({
      ...filters,
      skin_types: updated.length > 0 ? updated : undefined,
    })
  }

  const toggleConcern = (value: string) => {
    const current = filters.concerns || []
    const updated = current.includes(value as SkinConcern)
      ? current.filter((v) => v !== value)
      : [...current, value as SkinConcern]

    onFiltersChange({
      ...filters,
      concerns: updated.length > 0 ? updated : undefined,
    })
  }

  const toggleBenefit = (value: string) => {
    const current = filters.benefits || []
    const updated = current.includes(value as ProductBenefit)
      ? current.filter((v) => v !== value)
      : [...current, value as ProductBenefit]

    onFiltersChange({
      ...filters,
      benefits: updated.length > 0 ? updated : undefined,
    })
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>BỘ LỌC</h2>
          {activeCount > 0 && (
            <Badge variant='secondary' className='rounded-full'>
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onReset}
            className='text-primary'
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      <ScrollArea className='h-[calc(100vh-200px)]'>
        <div className='space-y-6 pr-4'>
          {/* In Stock Only */}
          <div className='flex items-center justify-between py-3 border-b'>
            <Label htmlFor='in-stock' className='font-medium cursor-pointer'>
              Chỉ hiện hàng có sẵn
            </Label>
            <Switch
              id='in-stock'
              checked={filters.is_available || false}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  is_available: checked || undefined,
                })
              }
            />
          </div>

          {/* Price Range */}
          <FilterSection title='Khoảng giá' defaultOpen>
            <Slider
              min={0}
              max={5000000}
              step={50000}
              value={priceRange}
              onValueChange={setPriceRange}
              onValueCommit={handlePriceCommit}
              className='w-full'
            />
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                {formatCurrencyVnd(priceRange[0])}
              </span>
              <span className='text-muted-foreground'>
                {formatCurrencyVnd(priceRange[1])}
              </span>
            </div>
          </FilterSection>

          {/* Categories */}
          {flatCategories.length > 0 && (
            <FilterSection title='Danh mục' defaultOpen>
              {flatCategories.slice(0, 10).map((category) => (
                <FilterCheckbox
                  key={category.id}
                  id={`cat-${category.id}`}
                  label={category.name}
                  checked={filters.category === category.name}
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      category:
                        filters.category === category.name
                          ? undefined
                          : category.name,
                    })
                  }
                  indent={category.level * 12}
                />
              ))}
            </FilterSection>
          )}

          {/* Skin Types */}
          <FilterSection title='Loại da' defaultOpen>
            {SKIN_TYPE_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option.value}
                id={`skin-${option.value}`}
                label={option.label}
                checked={
                  filters.skin_types?.includes(option.value as SkinType) ||
                  false
                }
                onCheckedChange={() => toggleSkinType(option.value)}
              />
            ))}
          </FilterSection>

          {/* Skin Concerns */}
          <FilterSection title='Vấn đề da'>
            {SKIN_CONCERN_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option.value}
                id={`concern-${option.value}`}
                label={option.label}
                checked={
                  filters.concerns?.includes(option.value as SkinConcern) ||
                  false
                }
                onCheckedChange={() => toggleConcern(option.value)}
              />
            ))}
          </FilterSection>

          {/* Benefits */}
          <FilterSection title='Công dụng'>
            {PRODUCT_BENEFIT_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option.value}
                id={`benefit-${option.value}`}
                label={option.label}
                checked={
                  filters.benefits?.includes(option.value as ProductBenefit) ||
                  false
                }
                onCheckedChange={() => toggleBenefit(option.value)}
              />
            ))}
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  )
}
