import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { BrandForm } from '@/domains/admin/components/brands/BrandForm'
import { useBrand, useUpdateBrand } from '@/hooks/useBrands'
import type { BrandFormValues } from '@/domains/admin/components/brands/BrandForm'
import { BrandPageHeader } from './BrandPageHeader'
import { BrandFormSkeleton } from './BrandFormSkeleton'
import { BrandNotFoundState } from './BrandNotFoundState'

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
    return <BrandFormSkeleton />
  }

  if (!brand) {
    return (
      <BrandNotFoundState
        description="The brand you're trying to edit doesn't exist."
        actionLabel='Back to Brands'
        onAction={() => navigate('/admin/brands')}
      />
    )
  }

  return (
    <div className='min-h-screen'>
      <BrandPageHeader
        breadcrumbs={[
          { label: 'Brands', onClick: () => navigate('/admin/brands') },
          { label: brand.name, onClick: () => navigate(`/admin/brands/${id}`) },
          { label: 'Edit' },
        ]}
        title='Edit Brand'
        subtitle={`Update information for ${brand.name}`}
        icon={<Save className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='outline'
            onClick={() => navigate(`/admin/brands/${id}`)}
            disabled={updateBrand.isPending}
          >
            <X className='w-4 h-4 mr-2' />
            Cancel
          </Button>
        }
      />

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
