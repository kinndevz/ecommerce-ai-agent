import { useState, useEffect } from 'react'
import { Minus, Plus, Heart, Info } from 'lucide-react'
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
import { ProductRating } from './ProductRating'
import { VariantSelector } from './VariantSelector'
import { TrustBadges } from './TrustBadges'

interface ProductInfoProps {
  product: ProductDetail
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantData | null>(null)
  const [quantity, setQuantity] = useState(1)

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val)
  const discountPercent = hasDiscount
    ? Math.round(((currentPrice - currentSalePrice!) / currentPrice) * 100)
    : 0

  return (
    <div className='flex flex-col h-full space-y-6'>
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

      <div className='flex items-center gap-3'>
        <span className='text-2xl font-bold text-foreground'>
          {formatCurrency(currentSalePrice || currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className='text-lg text-muted-foreground line-through decoration-muted-foreground/50'>
              {formatCurrency(currentPrice)}
            </span>
            <Badge variant='destructive'>-{discountPercent}%</Badge>
          </>
        )}
      </div>

      <p className='text-muted-foreground leading-relaxed'>
        {product.short_description}
      </p>

      <VariantSelector
        variants={product.variants}
        selectedVariantId={selectedVariant?.id || null}
        onSelect={setSelectedVariant}
      />

      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center border border-input rounded-md'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
              onClick={() => setQuantity(quantity + 1)}
              className='h-12 w-12 rounded-none'
            >
              <Plus size={16} />
            </Button>
          </div>

          <Button
            size='lg'
            className='flex-1 h-12 uppercase tracking-wide font-bold'
          >
            Add to cart
          </Button>

          <Button variant='outline' size='icon' className='h-12 w-12 shrink-0'>
            <Heart size={20} />
          </Button>
        </div>

        <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Info size={14} />
          <span>Ships for free the week of February 14th.</span>
        </div>
      </div>

      <Separator className='my-6' />
      <TrustBadges />
      <Separator className='my-6' />

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
        <AccordionItem value='ingredients' className='border-b-0'>
          <AccordionTrigger className='text-sm font-bold uppercase tracking-wide hover:no-underline py-2'>
            Ingredients
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            <p className='mb-2 font-medium text-foreground'>Key Ingredients:</p>
            <ul className='list-disc pl-5 mb-4 space-y-1'>
              {product.ingredients?.key.map((i: any) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
