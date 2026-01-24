import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Layers,
  Info,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
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
import { ProductFormSkeleton } from './ProductFormSkeleton'
import { ProductNotFoundState } from './ProductNotFoundState'
import { ProductPageHeader } from './ProductPageHeader'

export function EditProductUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')

  // Load product data
  const { data: productData, isLoading: loadingProduct } = useProduct(id!)
  const product = productData?.data

  if (loadingProduct) {
    return <ProductFormSkeleton />
  }

  if (!product) {
    return (
      <ProductNotFoundState
        actionLabel='Back to Products'
        onAction={() => navigate('/admin/products')}
      />
    )
  }

  return (
    <div className='w-full p-6 pb-20'>
      <ProductPageHeader
        breadcrumbs={[
          { label: 'Products', onClick: () => navigate('/admin/products') },
          { label: product.name },
        ]}
        title='Edit Product'
        subtitle='Manage product information, images, and variants'
        meta={
          <Badge variant='outline' className='ml-2'>
            <Edit className='w-3 h-3 mr-1' />
            Editing
          </Badge>
        }
        actions={
          <Button
            variant='ghost'
            size='icon'
            type='button'
            onClick={() => navigate('/admin/products')}
            className='rounded-full'
          >
            <ArrowLeft className='w-5 h-5' />
          </Button>
        }
      />

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
