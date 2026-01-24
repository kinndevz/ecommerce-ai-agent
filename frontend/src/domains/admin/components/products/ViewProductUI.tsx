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
    <div className='min-h-screen p-6 font-sans'>
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

      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight text-foreground mb-3'>
          {product.name}
        </h1>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground'>
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
        </div>
      </div>

      <div className='grid grid-cols-12 gap-8 items-start'>
        <ProductImageGallery
          images={images}
          currentIndex={currentImageIndex}
          onSelect={setCurrentImageIndex}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          productName={product.name}
        />

        <div className='col-span-12 lg:col-span-7 space-y-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
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
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='p-2 bg-muted rounded-md shrink-0'>
                      <stat.icon className='w-5 h-5 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        {stat.label}
                      </p>
                      <p className='text-lg font-bold text-foreground'>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='border bg-background shadow-sm'>
            <CardContent className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                <div className='md:col-span-2 space-y-8 min-w-0'>
                  <div className='min-w-0'>
                    <h3 className='font-bold text-base text-foreground mb-3'>
                      Description:
                    </h3>
                    <div className='text-sm text-muted-foreground leading-relaxed space-y-4 wrap-break-word'>
                      {product.short_description && (
                        <p>{product.short_description}</p>
                      )}
                      {product.description && (
                        <div
                          className='prose prose-sm dark:prose-invert max-w-none wrap-break-word'
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
                        className='text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 wrap-break-word'
                        dangerouslySetInnerHTML={{ __html: product.how_to_use }}
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Colors (Fix Unselect) */}
                  {uniqueColors.length > 0 && (
                    <div>
                      <h3 className='font-bold text-sm text-foreground mb-3'>
                        Colors:
                      </h3>
                      <div className='flex flex-wrap gap-3'>
                        {uniqueColors.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id
                          const bgHex = variant.shade_name || '#e2e8f0'

                          return (
                            <button
                              key={variant.id}
                              // Sửa logic onClick
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

                  <div className='flex gap-3 pt-2'>
                    <Button className='px-8 shadow-sm'>
                      <ShoppingCart className='w-4 h-4 mr-2' /> Add to Card
                    </Button>
                    <Button variant='outline'>
                      <Heart className='w-4 h-4 mr-2' /> Wishlist
                    </Button>
                  </div>
                </div>

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
        </div>
      </div>
    </div>
  )
}
