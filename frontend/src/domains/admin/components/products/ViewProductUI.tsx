import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit,
  Trash2,
  Package,
  Layers,
  ShoppingCart,
  Heart,
  Truck,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/lib/utils'
import { useProduct } from '@/hooks/useProducts'
import {
  formatProductDate,
  getUniqueVariantColors,
  getUniqueVariantSizes,
  sortProductImages,
} from '@/domains/admin/helpers/product.helpers'
import { ProductPageHeader } from './ProductPageHeader'
import { ProductDetailSkeleton } from './ProductDetailSkeleton'
import { ProductNotFoundState } from './ProductNotFoundState'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductReviews } from '../reviews/ProductReviews'

export function ViewProductUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const { data: productData, isLoading } = useProduct(id!)
  const product = productData?.data

  const images = useMemo(() => sortProductImages(product?.images), [product])
  const uniqueColors = useMemo(
    () => getUniqueVariantColors(product?.variants),
    [product]
  )
  const uniqueSizes = useMemo(
    () => getUniqueVariantSizes(product?.variants),
    [product]
  )

  const handleVariantSelect = (variant: any) => {
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null)
    } else {
      setSelectedVariant(variant)
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }
  const handleDelete = () => {
    toast.error('Delete functionality not implemented yet')
  }

  if (isLoading) return <ProductDetailSkeleton />
  if (!product) {
    return (
      <ProductNotFoundState
        actionLabel='Back to Products'
        onAction={() => navigate('/admin/products')}
      />
    )
  }

  const currentPrice = selectedVariant?.price || product.price
  const currentStock = selectedVariant?.stock_quantity || product.stock_quantity
  const displaySKU = selectedVariant?.sku || product.sku

  return (
    <div className='min-h-screen p-4 sm:p-6 font-sans bg-gray-50/50'>
      <ProductPageHeader
        breadcrumbs={[
          { label: 'Products', onClick: () => navigate('/admin/products') },
          { label: 'Details' },
        ]}
        title={product.name}
        actions={
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(`/admin/products/${id}/edit`)}
              className='bg-background'
            >
              <Edit className='w-4 h-4 mr-2' /> Edit
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={handleDelete}
              className='bg-background text-destructive hover:bg-destructive/10 border-destructive/20'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </>
        }
      />

      {/* Product Header */}
      <div className='mb-6 sm:mb-8'>
        {/* <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3'>
          {product.name}
        </h1>
        <div className='flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-foreground'>Seller:</span>
            <span>{product.brand?.name || 'N/A'}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-foreground'>Published:</span>
            <span>{formatProductDate(product.created_at)}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-foreground'>SKU:</span>
            <Badge
              variant='outline'
              className='font-mono bg-background font-normal'
            >
              {displaySKU}
            </Badge>
          </div>
        </div> */}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
        {/* Left: Image Gallery - Sticky on desktop, normal on mobile */}
        <div className='lg:col-span-5 lg:sticky lg:top-6 lg:self-start'>
          <ProductImageGallery
            images={images}
            currentIndex={currentImageIndex}
            onSelect={setCurrentImageIndex}
            onPrev={handlePrevImage}
            onNext={handleNextImage}
            productName={product.name}
          />
        </div>

        {/* Right: Details & Reviews */}
        <div className='lg:col-span-7 space-y-6 sm:space-y-8'>
          {/* Stats Cards */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
            {[
              {
                icon: DollarSign,
                label: 'Price',
                value: `$${currentPrice.toLocaleString()}`,
              },
              { icon: Truck, label: 'Orders', value: '250' },
              {
                icon: Layers,
                label: 'Stock',
                value: currentStock.toLocaleString(),
              },
              { icon: Package, label: 'Revenue', value: '$45,938' },
            ].map((stat, i) => (
              <Card key={i} className='shadow-sm border bg-background'>
                <CardContent className='p-3 sm:p-4'>
                  <div className='flex items-start gap-2 sm:gap-3'>
                    <div className='p-1.5 sm:p-2 bg-muted rounded-md shrink-0'>
                      <stat.icon className='w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-xs font-medium text-muted-foreground mb-1 truncate'>
                        {stat.label}
                      </p>
                      <p className='text-base sm:text-lg font-bold text-foreground truncate'>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Product Details Card */}
          <Card className='border bg-background shadow-sm'>
            <CardContent className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
                <div className='md:col-span-2 space-y-6 sm:space-y-8 min-w-0'>
                  {/* Description */}
                  <div className='min-w-0'>
                    <h3 className='font-bold text-base text-foreground mb-3'>
                      Description:
                    </h3>
                    <div className='text-sm text-muted-foreground leading-relaxed space-y-4'>
                      {product.short_description && (
                        <p>{product.short_description}</p>
                      )}
                      {product.description && (
                        <div
                          className='prose prose-sm dark:prose-invert max-w-none'
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Key Features */}
                  {product.how_to_use && (
                    <div className='min-w-0'>
                      <h3 className='font-bold text-base text-foreground mb-3'>
                        Key Features:
                      </h3>
                      <div
                        className='text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5'
                        dangerouslySetInnerHTML={{ __html: product.how_to_use }}
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Colors */}
                  {uniqueColors.length > 0 && (
                    <div>
                      <h3 className='font-bold text-sm text-foreground mb-3'>
                        Colors:
                      </h3>
                      <div className='flex flex-wrap gap-2 sm:gap-3'>
                        {uniqueColors.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id
                          const bgHex = variant.shade_name || '#e2e8f0'

                          return (
                            <button
                              key={variant.id}
                              onClick={() => handleVariantSelect(variant)}
                              className={cn(
                                'w-8 h-8 rounded-full border shadow-sm transition-all',
                                isSelected
                                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 border-transparent'
                                  : 'border-border hover:border-primary/50'
                              )}
                              style={{ backgroundColor: bgHex }}
                              title={variant.shade_name || 'Color'}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {uniqueSizes.length > 0 && (
                    <div>
                      <h3 className='font-bold text-sm text-foreground mb-3'>
                        Sizes:
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {uniqueSizes.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id
                          return (
                            <button
                              key={variant.id}
                              onClick={() => handleVariantSelect(variant)}
                              className={cn(
                                'min-w-12 px-3 py-1.5 border rounded-md text-sm font-medium transition-colors',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-background hover:bg-muted text-muted-foreground'
                              )}
                            >
                              {variant.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2'>
                    <Button className='w-full sm:w-auto px-8 shadow-sm'>
                      <ShoppingCart className='w-4 h-4 mr-2' /> Add to Cart
                    </Button>
                    <Button variant='outline' className='w-full sm:w-auto'>
                      <Heart className='w-4 h-4 mr-2' /> Wishlist
                    </Button>
                  </div>
                </div>

                {/* Right Info Panel */}
                <div className='md:col-span-1'>
                  <div className='rounded-lg border border-border overflow-hidden text-sm shadow-sm'>
                    {[
                      { label: 'Category', value: product.category?.name },
                      { label: 'Brand', value: product.brand?.name },
                      {
                        label: 'Color',
                        value:
                          selectedVariant?.shade_name ||
                          selectedVariant?.color ||
                          'Mixed',
                      },
                      {
                        label: 'Weight',
                        value:
                          selectedVariant?.size && selectedVariant?.size_unit
                            ? `${selectedVariant.size} ${selectedVariant.size_unit}`
                            : 'N/A',
                      },
                    ].map((item, i, arr) => (
                      <div
                        key={item.label}
                        className={cn(
                          'flex justify-between p-3 bg-muted/10',
                          i !== arr.length - 1 && 'border-b border-border'
                        )}
                      >
                        <span className='font-semibold text-foreground'>
                          {item.label}
                        </span>
                        <span className='text-muted-foreground text-right truncate pl-2'>
                          {item.value || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <div className='border-t pt-6 sm:pt-8 bg-background rounded-lg p-4 sm:p-6 shadow-sm border'>
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
