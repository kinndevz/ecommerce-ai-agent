import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Truck,
  DollarSign,
  Home,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/lib/utils'
import { useProduct } from '@/hooks/useProducts'

export function ViewProductUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const { data: productData, isLoading } = useProduct(id!)
  const product = productData?.data

  const images = useMemo(
    () =>
      product?.images?.sort((a, b) => a.display_order - b.display_order) || [],
    [product]
  )

  const uniqueColors = useMemo(() => {
    if (!product?.variants) return []
    const map = new Map()
    product.variants.forEach((v) => {
      if (v.shade_name && !map.has(v.shade_name)) {
        map.set(v.shade_name, v)
      }
    })
    return Array.from(map.values())
  }, [product])

  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return []
    const map = new Map()
    product.variants.forEach((v) => {
      const key = v.size && v.size_unit ? `${v.size}${v.size_unit}` : v.name
      if (!map.has(key)) map.set(key, { ...v, label: key })
    })
    return Array.from(map.values())
  }, [product])

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

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  if (!product) return <div>Product not found</div>

  const currentPrice = selectedVariant?.price || product.price
  const currentStock = selectedVariant?.stock_quantity || product.stock_quantity
  const displaySKU = selectedVariant?.sku || product.sku

  return (
    <div className='min-h-screen p-6 font-sans'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => navigate('/admin')}
          >
            <Home className='w-4 h-4' />
          </Button>
          <ChevronRight className='w-4 h-4' />
          <span
            className='hover:text-foreground cursor-pointer transition-colors'
            onClick={() => navigate('/admin/products')}
          >
            Products
          </span>
          <ChevronRight className='w-4 h-4' />
          <span className='font-medium text-foreground'>Details</span>
        </div>
        <div className='flex items-center gap-2'>
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
        </div>
      </div>

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
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
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
        <div className='col-span-12 lg:col-span-5 sticky top-6 z-0'>
          <div className='relative aspect-4/5 bg-background rounded-xl border border-border shadow-sm overflow-hidden group'>
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt={product.name}
                  className='w-full h-full object-cover'
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border'
                    >
                      <ChevronLeft className='w-5 h-5' />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border'
                    >
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className='flex items-center justify-center h-full text-muted-foreground'>
                <ImageIcon className='w-16 h-16' />
              </div>
            )}
          </div>
          <div className='grid grid-cols-4 gap-4 mt-4'>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border-2 bg-background transition-all',
                  index === currentImageIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-border'
                )}
              >
                <img
                  src={image.image_url}
                  alt='thumbnail'
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        </div>

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
