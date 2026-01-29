import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/lib/utils'
import type { ProductVariantData } from '@/api/product.api'

interface VariantSelectorProps {
  variants: ProductVariantData[]
  selectedVariantId: string | null
  onSelect: (variant: ProductVariantData) => void
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  if (!variants.length) return null

  return (
    <div className='mb-6 space-y-3'>
      <Label className='text-base'>Size</Label>
      <div className='flex flex-wrap gap-3'>
        {variants.map((variant) => (
          <Button
            key={variant.id}
            variant={selectedVariantId === variant.id ? 'default' : 'outline'}
            onClick={() => onSelect(variant)}
            className={cn(
              'h-auto py-3 px-6 min-w-25',
              selectedVariantId === variant.id
                ? 'border-primary'
                : 'border-input'
            )}
          >
            {variant.size}
            {variant.size_unit}
          </Button>
        ))}
      </div>
    </div>
  )
}
