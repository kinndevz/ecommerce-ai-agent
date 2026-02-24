import { useState, useEffect } from 'react'
import { Minus, Plus, Heart, Info, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import type { ProductDetail, ProductVariantData } from '@/api/product.api'
import { useAddToCart } from '@/hooks/useCarts'
import { ProductRating } from './ProductRating'
import { VariantSelector } from './VariantSelector'
import { TrustBadges } from './TrustBadges'
import { formatCurrencyVnd } from '../../helpers/formatters'

interface ProductInfoProps {
  product: ProductDetail
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantData | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { mutate: addToCart, isPending } = useAddToCart()

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])

  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentSalePrice = selectedVariant
    ? selectedVariant.sale_price
    : product.sale_price
  const hasDiscount = currentSalePrice && currentSalePrice < currentPrice

  const discountPercent = hasDiscount
    ? Math.round(((currentPrice - currentSalePrice!) / currentPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity: quantity,
    })
  }

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleQuantityIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  return (
    <div className='flex flex-col h-full space-y-6'>
      {/* Brand & Title */}
      <div>
        <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
          {product.brand.name}
        </h2>
        <h1 className='text-3xl md:text-4xl font-serif text-foreground mb-4'>
          {product.name}
        </h1>
        <ProductRating
          rating={product.rating_average}
          count={product.review_count}
        />
      </div>

      {/* Price */}
      <div className='flex items-center gap-3'>
        <span className='text-2xl font-bold text-foreground'>
          {formatCurrencyVnd(currentSalePrice || currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className='text-lg text-muted-foreground line-through decoration-muted-foreground/50'>
              {formatCurrencyVnd(currentPrice)}
            </span>
            <Badge variant='destructive'>-{discountPercent}%</Badge>
          </>
        )}
      </div>

      {/* Short Description */}
      <p className='text-muted-foreground leading-relaxed'>
        {product.short_description}
      </p>

      {/* Variant Selector */}
      <VariantSelector
        variants={product.variants}
        selectedVariantId={selectedVariant?.id || null}
        onSelect={setSelectedVariant}
      />

      {/* Add to Cart Section */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          {/* Quantity Selector */}
          <div className='flex items-center border border-input rounded-md'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleQuantityDecrease}
              disabled={quantity <= 1}
              className='h-12 w-12 rounded-none'
            >
              <Minus size={16} />
            </Button>
            <span className='w-12 text-center font-medium text-foreground'>
              {quantity}
            </span>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleQuantityIncrease}
              className='h-12 w-12 rounded-none'
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            size='lg'
            className='flex-1 h-12 uppercase tracking-wide font-bold'
            onClick={handleAddToCart}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className='mr-2 h-5 w-5' />
                Add to cart
              </>
            )}
          </Button>

          {/* Wishlist Button */}
          <Button variant='outline' size='icon' className='h-12 w-12 shrink-0'>
            <Heart size={20} />
          </Button>
        </div>

        {/* Shipping Info */}
        <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Info size={14} />
          <span>Ships for free the week of February 14th.</span>
        </div>
      </div>

      <Separator className='my-6' />
      <TrustBadges />
      <Separator className='my-6' />

      {/* Accordion Details */}
      <Accordion
        type='single'
        collapsible
        defaultValue='details'
        className='w-full'
      >
        <AccordionItem value='details' className='border-b-0'>
          <AccordionTrigger className='text-sm font-bold uppercase tracking-wide hover:no-underline py-2'>
            Details
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground leading-relaxed'>
            {product.description}
          </AccordionContent>
        </AccordionItem>

        {product.ingredients && (
          <AccordionItem value='ingredients' className='border-b-0'>
            <AccordionTrigger className='text-sm font-bold uppercase tracking-wide hover:no-underline py-2'>
              Ingredients
            </AccordionTrigger>
            <AccordionContent className='text-muted-foreground'>
              <p className='mb-2 font-medium text-foreground'>
                Key Ingredients:
              </p>
              <ul className='list-disc pl-5 mb-4 space-y-1'>
                {product.ingredients?.key?.map(
                  (ingredient: string, index: number) => (
                    <li key={index}>{ingredient}</li>
                  )
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}
