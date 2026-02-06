import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'

import { useAddToCart } from '@/hooks/useCarts'
import { useProduct } from '@/hooks/useProducts'
import type { ProductData } from '@/api/chat.api'

import { ProductGallery } from './ProductGallery'
import {
  ProductHeader,
  PriceBlock,
  VariantSelector,
  ProductTags,
  QuantitySelector,
  ProductDetailSkeleton,
} from './ProductInfoComponents'
import { buildDisplayProduct } from '@/domains/customer/helpers/productDetail'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface ProductDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  previewProduct?: ProductData | null
}

export const ProductDetailSheet = ({
  open,
  onOpenChange,
  productId,
  previewProduct,
}: ProductDetailSheetProps) => {
  const { data, isLoading } = useProduct(productId || '')
  const { mutate: addToCart, isPending } = useAddToCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  )
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const displayProduct = useMemo(
    () => buildDisplayProduct(data?.data, previewProduct || null),
    [data?.data, previewProduct]
  )

  const selectedVariant = useMemo(
    () =>
      displayProduct?.variants.find(
        (variant) => variant.id === selectedVariantId
      ),
    [displayProduct?.variants, selectedVariantId]
  )

  useEffect(() => {
    setQuantity(1)
    setSelectedVariantId(
      displayProduct?.variants?.[0]?.id ? displayProduct.variants[0].id : null
    )
    setActiveImageIndex(0)
  }, [displayProduct?.id])

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
                <ProductGallery
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
                      {formatCurrencyVnd(effectivePrice * quantity)}
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
