import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Sparkles,
  Package,
  Home,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useCreateProduct } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'
import { productFormSchema } from './product.schema'
import { ProductForm } from '@/admin/components/products/ProductForm'
import { Form } from '@/shared/components/ui/form'

export function AddProductUI() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()

  // Load data from API
  const { brands, isLoading: loadingBrands } = useBrands()
  const { categories, isLoading: loadingCategories } = useCategories()

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      brand_id: '',
      category_id: '',
      price: 0,
      stock_quantity: 0,
      sale_price: null,
      is_featured: false,
      short_description: null,
      description: null,
      how_to_use: null,
      images: null,
      variants: null,
      skin_types: null,
      concerns: null,
      benefits: null,
      tag_ids: null,
      ingredients: null,
    },
  })

  // Submit
  const onSubmit = (data: any) => {
    createProduct.mutate(data)
  }

  // Save draft
  const saveDraft = () => {
    const values = form.getValues()
    localStorage.setItem('product-draft', JSON.stringify(values))
    toast.success('Draft saved!')
  }

  return (
    <div className='max-w-7xl mx-auto p-6 pb-20'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* HEADER */}
          <div className='sticky top-0 z-20 bg-background/95 backdrop-blur -mx-6 px-6 py-4 border-b shadow-sm'>
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
              <span className='text-foreground font-medium'>
                Add New Product
              </span>
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
                    Create New Product
                  </h1>
                  <div className='flex items-center gap-2 mt-1'>
                    <p className='text-sm text-muted-foreground'>
                      Add a new cosmetics product to your inventory
                    </p>
                    <Badge variant='secondary' className='ml-2'>
                      <Package className='w-3 h-3 mr-1' />
                      New
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={saveDraft}
                  className='gap-2'
                >
                  <Save className='w-4 h-4' />
                  Save Draft
                </Button>
                <Button
                  type='submit'
                  disabled={createProduct.isPending}
                  className='gap-2'
                >
                  {createProduct.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className='w-4 h-4' />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Product Form */}
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={createProduct.isPending}
            brands={brands}
            categories={categories}
            loadingBrands={loadingBrands}
            loadingCategories={loadingCategories}
            mode='create'
          />
        </form>
      </Form>
    </div>
  )
}
