import { useNavigate } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { BrandForm } from '@/domains/admin/components/brands/BrandForm'
import { useCreateBrand } from '@/hooks/useBrands'
import type { BrandFormValues } from '@/domains/admin/components/brands/BrandForm'
import { BrandPageHeader } from './BrandPageHeader'

export default function AddBrandUI() {
  const navigate = useNavigate()
  const createBrand = useCreateBrand()

  const handleSubmit = (data: BrandFormValues) => {
    createBrand.mutate(data)
  }

  return (
    <div className='min-h-screen'>
      <BrandPageHeader
        breadcrumbs={[
          { label: 'Brands', onClick: () => navigate('/admin/brands') },
          { label: 'Add New Brand' },
        ]}
        title='Add New Brand'
        subtitle='Create a new cosmetics brand'
        icon={<Sparkles className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='outline'
            onClick={() => navigate('/admin/brands')}
            disabled={createBrand.isPending}
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
              onSubmit={handleSubmit}
              isSubmitting={createBrand.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
