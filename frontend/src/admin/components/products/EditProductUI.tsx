import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Package,
  Home,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Info,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import { useProduct } from '@/hooks/useProducts'
import { ProductBasicInfoTab } from './ProducBasicInfoTab'
import { ProductImagesTab } from './ProductImageTab'
import { ProductVariantsTab } from './ProductVariantsTab'

export function EditProductUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')

  // Load product data
  const { data: productData, isLoading: loadingProduct } = useProduct(id!)
  const product = productData?.data

  if (loadingProduct) {
    return (
      <div className='space-y-6 p-6'>
        <Skeleton className='h-24 w-full' />
        <div className='grid grid-cols-12 gap-6'>
          <div className='col-span-8 space-y-6'>
            <Skeleton className='h-96 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
          <div className='col-span-4 space-y-6'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <div className='inline-flex p-5 rounded-2xl bg-primary/10 mb-6'>
          <Package className='w-16 h-16 text-primary' />
        </div>
        <h2 className='text-2xl font-bold mb-3'>Product Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          The product you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/admin/products')}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className='w-full p-6 pb-20'>
      {/* HEADER */}
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur -mx-6 px-6 py-4 border-b shadow-sm mb-6'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
          <Home className='w-4 h-4' />
          <ChevronRight className='w-4 h-4' />
          <button
            type='button'
            onClick={() => navigate('/admin/products')}
            className='hover:text-foreground transition-colors'
          >
            Products
          </button>
          <ChevronRight className='w-4 h-4' />
          <span className='text-foreground font-medium'>{product.name}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              type='button'
              onClick={() => navigate('/admin/products')}
              className='rounded-full'
            >
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Edit Product
              </h1>
              <div className='flex items-center gap-2 mt-1'>
                <p className='text-sm text-muted-foreground'>
                  Manage product information, images, and variants
                </p>
                <Badge variant='outline' className='ml-2'>
                  <Edit className='w-3 h-3 mr-1' />
                  Editing
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        key={product.id}
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-3 h-12'>
          <TabsTrigger value='basic' className='gap-2'>
            <Info className='w-4 h-4' />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value='images' className='gap-2'>
            <ImageIcon className='w-4 h-4' />
            Images ({product.images?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='variants' className='gap-2'>
            <Layers className='w-4 h-4' />
            Variants ({product.variants?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='basic' className='space-y-6'>
          <ProductBasicInfoTab product={product} />
        </TabsContent>

        <TabsContent value='images' className='space-y-6'>
          <ProductImagesTab product={product} />
        </TabsContent>

        <TabsContent value='variants' className='space-y-6'>
          <ProductVariantsTab product={product} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
