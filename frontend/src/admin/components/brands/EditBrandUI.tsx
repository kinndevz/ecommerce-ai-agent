import { useParams, useNavigate } from 'react-router-dom'
import { Home, ChevronRight, Save, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { BrandForm } from '@/admin/components/brands/BrandForm'
import { useBrand, useUpdateBrand } from '@/hooks/useBrands'
import type { BrandFormValues } from '@/admin/components/brands/BrandForm'

export default function EditBrandUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: brand, isLoading } = useBrand(id!)
  const updateBrand = useUpdateBrand()

  const handleSubmit = (data: BrandFormValues) => {
    if (!id) return
    updateBrand.mutate({ id, data })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!brand) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-2'>Brand Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The brand you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => navigate('/admin/brands')}>
            Back to Brands
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
            <Home className='w-4 h-4' />
            <ChevronRight className='w-4 h-4' />
            <button
              onClick={() => navigate('/admin/brands')}
              className='hover:text-foreground transition-colors'
            >
              Brands
            </button>
            <ChevronRight className='w-4 h-4' />
            <button
              onClick={() => navigate(`/admin/brands/${id}`)}
              className='hover:text-foreground transition-colors'
            >
              {brand.name}
            </button>
            <ChevronRight className='w-4 h-4' />
            <span className='text-foreground font-medium'>Edit</span>
          </div>

          {/* Header Actions */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <Save className='w-6 h-6 text-primary' />
                Edit Brand
              </h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Update information for {brand.name}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate(`/admin/brands/${id}`)}
                disabled={updateBrand.isPending}
              >
                <X className='w-4 h-4 mr-2' />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <Card>
          <CardContent className='pt-6'>
            <BrandForm
              initialData={brand}
              onSubmit={handleSubmit}
              isSubmitting={updateBrand.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <Skeleton className='h-4 w-64 mb-3' />
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-72' />
            </div>
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <Skeleton className='h-96 w-full' />
      </div>
    </div>
  )
}
