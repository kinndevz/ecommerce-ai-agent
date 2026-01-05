import { useNavigate } from 'react-router-dom'
import { Home, ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { BrandForm } from '@/admin/components/brands/BrandForm'
import { useCreateBrand } from '@/hooks/useBrands'
import type { BrandFormValues } from '@/admin/components/brands/BrandForm'

export default function AddBrandUI() {
  const navigate = useNavigate()
  const createBrand = useCreateBrand()

  const handleSubmit = (data: BrandFormValues) => {
    createBrand.mutate(data)
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
            <span className='text-foreground font-medium'>Add New Brand</span>
          </div>

          {/* Header Actions */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <Sparkles className='w-6 h-6 text-primary' />
                Add New Brand
              </h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Create a new cosmetics brand
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate('/admin/brands')}
                disabled={createBrand.isPending}
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
              onSubmit={handleSubmit}
              isSubmitting={createBrand.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
