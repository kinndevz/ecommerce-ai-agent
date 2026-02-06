import { Minus, Plus, Star } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { SheetTitle } from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { ProductVariantData } from '@/api/product.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

export const QuantitySelector = ({
  value,
  min = 1,
  max,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}) => (
  <div className='flex items-center border rounded-lg h-9 bg-background'>
    <button
      className='px-3 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
    >
      <Minus className='w-3.5 h-3.5' />
    </button>
    <span className='w-10 text-center text-sm font-semibold select-none'>
      {value}
    </span>
    <button
      className='px-3 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors h-full flex items-center'
      onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
      disabled={typeof max === 'number' && value >= max}
    >
      <Plus className='w-3.5 h-3.5' />
    </button>
  </div>
)

export const VariantSelector = ({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariantData[]
  selectedId: string | null
  onSelect: (id: string) => void
}) => {
  if (!variants.length) return null
  return (
    <div className='space-y-2'>
      <p className='text-sm font-semibold text-foreground'>Variants</p>
      <div className='flex flex-wrap gap-2'>
        {variants.map((variant) => (
          <Button
            key={variant.id}
            type='button'
            variant={variant.id === selectedId ? 'default' : 'outline'}
            size='sm'
            className='h-8 px-3 text-xs'
            onClick={() => onSelect(variant.id)}
          >
            {variant.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

export const ProductHeader = ({
  brandName,
  name,
  categoryName,
  rating,
  reviewCount,
}: {
  brandName: string
  name: string
  categoryName: string
  rating: number
  reviewCount?: number
}) => (
  <div className='space-y-2'>
    <p className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold'>
      {brandName}
    </p>
    <SheetTitle className='text-xl'>{name}</SheetTitle>
    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
      <div className='flex items-center gap-1 text-amber-500'>
        <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
        <span className='font-semibold text-foreground'>
          {rating.toFixed(1)}
        </span>
      </div>
      <span>•</span>
      <span>{categoryName}</span>
      {typeof reviewCount === 'number' && (
        <>
          <span>•</span>
          <span>{reviewCount} reviews</span>
        </>
      )}
    </div>
  </div>
)

export const PriceBlock = ({
  price,
  salePrice,
  isAvailable,
  stockQuantity,
}: {
  price: number
  salePrice?: number | null
  isAvailable: boolean
  stockQuantity: number
}) => {
  const finalPrice = salePrice ?? price
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <span className='text-2xl font-bold text-foreground'>
          {formatCurrencyVnd(finalPrice)}
        </span>
        {salePrice && (
          <span className='text-sm text-muted-foreground line-through'>
            {formatCurrencyVnd(price)}
          </span>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Badge
          variant={isAvailable ? 'outline' : 'destructive'}
          className='text-xs'
        >
          {isAvailable ? 'In stock' : 'Out of stock'}
        </Badge>
        {isAvailable && (
          <span className='text-xs text-muted-foreground'>
            {stockQuantity} available
          </span>
        )}
      </div>
    </div>
  )
}

export const ProductTags = ({ tags }: { tags: string[] }) => {
  if (!tags.length) return null
  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map((tag) => (
        <Badge key={tag} variant='outline' className='text-[10px]'>
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export const ProductDetailSkeleton = () => (
  <div className='space-y-6'>
    <Skeleton className='h-64 w-full rounded-xl' />
    <div className='space-y-3'>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-6 w-4/5' />
      <Skeleton className='h-4 w-40' />
    </div>
    <Skeleton className='h-10 w-32' />
    <div className='space-y-2'>
      <Skeleton className='h-3 w-28' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-5/6' />
    </div>
  </div>
)
