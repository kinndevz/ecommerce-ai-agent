import { useNavigate } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CategoryForm } from '@/domains/admin/components/categories/CategoryForm'
import { useCreateCategory } from '@/hooks/useCategories'
import type { CategoryFormValues } from '@/domains/admin/components/categories/CategoryForm'
import { CategoryPageHeader } from './CategoryPageHeader'

export default function AddCategoryUI() {
  const navigate = useNavigate()
  const createCategory = useCreateCategory()

  const handleSubmit = (data: CategoryFormValues) => {
    createCategory.mutate(data)
  }

  return (
    <div className='min-h-screen'>
      <CategoryPageHeader
        breadcrumbs={[
          { label: 'Categories', onClick: () => navigate('/admin/categories') },
          { label: 'Add New Category' },
        ]}
        title='Add New Category'
        subtitle='Create a new product category'
        icon={<Sparkles className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='outline'
            onClick={() => navigate('/admin/categories')}
            disabled={createCategory.isPending}
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
            <CategoryForm
              onSubmit={handleSubmit}
              isSubmitting={createCategory.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
