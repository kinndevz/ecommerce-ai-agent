import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAddToCart } from '@/hooks/useCarts'
import { useProduct } from '@/hooks/useProducts'
import type { ProductData } from '@/api/chat.api'
import type {
  ProductDetail,
  ProductImageData,
  ProductVariantData,
} from '@/api/product.api'
import { toast } from 'sonner'

interface ProductDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  previewProduct?: ProductData | null
}

interface DisplayProduct {
  id: string
  name: string
  brandName: string
  categoryName: string
  description?: string | null
  price: number
  salePrice?: number | null
  rating: number
  reviewCount?: number
  stockQuantity: number
  isAvailable: boolean
  imageUrl?: string | null
  images: ProductImageData[]
  tags: string[]
  variants: ProductVariantData[]
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    price
  )

const getPrimaryImage = (detail?: ProductDetail | null) =>
  detail?.images?.find((img) => img.is_primary)?.image_url ||
  detail?.images?.[0]?.image_url ||
  null

const sortImages = (images: ProductImageData[]) =>
  [...images].sort((a, b) => a.display_order - b.display_order)

const buildImageGallery = (
  detail?: ProductDetail | null,
  preview?: ProductData | null
) => {
  if (detail?.images?.length) {
    return sortImages(detail.images)
  }

  if (preview?.product_image) {
    return [
      {
        id: preview.id,
        image_url: preview.product_image,
        alt_text: preview.name,
        is_primary: true,
        display_order: 0,
      },
    ]
  }

  return []
}

const buildDisplayProduct = (
  detail?: ProductDetail | null,
  preview?: ProductData | null
): DisplayProduct | null => {
  if (!detail && !preview) return null

  return {
    id: detail?.id || preview?.id || '',
    name: detail?.name || preview?.name || 'Unnamed product',
    brandName: detail?.brand?.name || preview?.brand_name || 'Unknown brand',
    categoryName:
      detail?.category?.name || preview?.category_name || 'Uncategorized',
    description: detail?.description || preview?.description || '',
    price: detail?.price ?? preview?.price ?? 0,
    salePrice: detail?.sale_price ?? null,
    rating: detail?.rating_average ?? preview?.rating_average ?? 0,
    reviewCount: detail?.review_count,
    stockQuantity: detail?.stock_quantity ?? preview?.stock_quantity ?? 0,
    isAvailable: detail?.is_available ?? preview?.is_available ?? false,
    imageUrl: getPrimaryImage(detail) || preview?.product_image || null,
    images: buildImageGallery(detail, preview),
    tags:
      detail?.tags?.map((tag) => tag.name) ||
      preview?.tags?.filter(Boolean) ||
      [],
    variants: detail?.variants || [],
  }
}

const QuantitySelector = ({
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

const VariantSelector = ({
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

const ProductImage = ({
  name,
  imageUrl,
}: {
  name: string
  imageUrl?: string | null
}) => (
  <div className='relative aspect-4/5 rounded-xl overflow-hidden bg-muted/40 border border-border/60'>
    {imageUrl ? (
      <img src={imageUrl} alt={name} className='w-full h-full object-cover' />
    ) : (
      <div className='w-full h-full flex items-center justify-center text-muted-foreground/40'>
        <ShoppingCart className='w-10 h-10' />
      </div>
    )}
  </div>
)

const Thumbnail = ({
  imageUrl,
  alt,
  isActive,
  onClick,
}: {
  imageUrl: string
  alt: string
  isActive: boolean
  onClick: () => void
}) => (
  <button
    type='button'
    className={`h-14 w-12 rounded-md overflow-hidden border transition-all ${
      isActive
        ? 'border-primary ring-2 ring-primary/20'
        : 'border-border/60 hover:border-primary/60'
    }`}
    onClick={onClick}
  >
    <img src={imageUrl} alt={alt} className='h-full w-full object-cover' />
  </button>
)

const ProductImageGallery = ({
  name,
  images,
  activeIndex,
  onChange,
}: {
  name: string
  images: ProductImageData[]
  activeIndex: number
  onChange: (index: number) => void
}) => {
  const hasMultiple = images.length > 1
  const safeIndex = Math.min(Math.max(activeIndex, 0), images.length - 1)
  const currentImage = images[safeIndex]

  if (!images.length) {
    return <ProductImage name={name} imageUrl={null} />
  }

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <ProductImage name={name} imageUrl={currentImage.image_url} />
        {hasMultiple && (
          <>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              className='absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-muted/90 shadow-md hover:bg-background'
              onClick={() => onChange((safeIndex - 1 + images.length) % images.length)}
            >
              <ChevronLeft className='w-4 h-4 text-muted-foreground' />
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-muted/90 shadow-md hover:bg-background'
              onClick={() => onChange((safeIndex + 1) % images.length)}
            >
              <ChevronRight className='w-4 h-4 text-muted-foreground' />
            </Button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {images.map((image, index) => (
            <Thumbnail
              key={image.id || image.image_url}
              imageUrl={image.image_url}
              alt={image.alt_text || name}
              isActive={index === safeIndex}
              onClick={() => onChange(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ProductHeader = ({
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

const PriceBlock = ({
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
          {formatPrice(finalPrice)}
        </span>
        {salePrice && (
          <span className='text-sm text-muted-foreground line-through'>
            {formatPrice(price)}
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

const ProductTags = ({ tags }: { tags: string[] }) => {
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

const ProductDetailSkeleton = () => (
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

export const ProductDetailSheet = ({
  open,
  onOpenChange,
  productId,
  previewProduct,
}: ProductDetailSheetProps) => {
  const { data, isLoading } = useProduct(productId || '')
  const { mutate: addToCart, isPending } = useAddToCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const displayProduct = useMemo(
    () => buildDisplayProduct(data?.data, previewProduct || null),
    [data?.data, previewProduct]
  )

  const selectedVariant = useMemo(
    () =>
      displayProduct?.variants.find((variant) => variant.id === selectedVariantId),
    [displayProduct?.variants, selectedVariantId]
  )

  useEffect(() => {
    setQuantity(1)
    setSelectedVariantId(
      displayProduct?.variants?.[0]?.id ? displayProduct.variants[0].id : null
    )
    setActiveImageIndex(0)
  }, [displayProduct?.id])

  const handleAddToCart = () => {
    if (!displayProduct) return
    if (!effectiveAvailability) {
      toast.error('Sản phẩm hiện đang hết hàng')
      return
    }

    addToCart({
      product_id: displayProduct.id,
      variant_id: selectedVariant?.id ?? null,
      quantity,
    })
  }


  const effectivePrice =
    selectedVariant?.sale_price ??
    selectedVariant?.price ??
    displayProduct?.salePrice ??
    displayProduct?.price ??
    0

  const effectiveStock =
    selectedVariant?.stock_quantity ?? displayProduct?.stockQuantity ?? 0

  const effectiveAvailability =
    selectedVariant?.is_available ?? displayProduct?.isAvailable ?? false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-xl px-0'>
        <div className='flex h-full flex-col'>
          <SheetHeader className='px-6 pt-6'>
            <SheetDescription className='text-xs uppercase tracking-[0.2em]'>
              Product details
            </SheetDescription>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto px-6 pb-8 space-y-6'>
            {isLoading || !displayProduct ? (
              <ProductDetailSkeleton />
            ) : (
              <>
                <ProductImageGallery
                  name={displayProduct.name}
                  images={displayProduct.images}
                  activeIndex={activeImageIndex}
                  onChange={setActiveImageIndex}
                />

                <ProductHeader
                  brandName={displayProduct.brandName}
                  name={displayProduct.name}
                  categoryName={displayProduct.categoryName}
                  rating={displayProduct.rating}
                  reviewCount={displayProduct.reviewCount}
                />

                <PriceBlock
                  price={displayProduct.price}
                  salePrice={displayProduct.salePrice}
                  isAvailable={effectiveAvailability}
                  stockQuantity={effectiveStock}
                />

                <VariantSelector
                  variants={displayProduct.variants}
                  selectedId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />

                <div className='space-y-2'>
                  <p className='text-sm font-semibold text-foreground'>
                    Description
                  </p>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {displayProduct.description || 'No description provided.'}
                  </p>
                </div>

                <ProductTags tags={displayProduct.tags} />
              </>
            )}
          </div>

          <SheetFooter className='border-t border-border/60 px-6 py-4'>
            {displayProduct && (
              <div className='w-full space-y-3'>
                <div className='flex items-center justify-between'>
                  <QuantitySelector
                    value={quantity}
                    max={Math.max(effectiveStock, 1)}
                    onChange={setQuantity}
                  />
                  <div className='text-right'>
                    <p className='text-xs text-muted-foreground'>Total</p>
                    <p className='text-lg font-bold text-foreground'>
                      {formatPrice(effectivePrice * quantity)}
                    </p>
                  </div>
                </div>

                <Button
                  className='h-11 w-full'
                  onClick={handleAddToCart}
                  disabled={!effectiveAvailability || isPending}
                >
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  {isPending ? 'Adding...' : 'Add to cart'}
                </Button>

                <Separator />
                <p className='text-[11px] text-muted-foreground'>
                  Prices and availability may change. Always check stock before
                  checkout.
                </p>
              </div>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
