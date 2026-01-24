import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CategoryForm } from '@/domains/admin/components/categories/CategoryForm'
import { useCategory, useUpdateCategory } from '@/hooks/useCategories'
import type { CategoryFormValues } from '@/domains/admin/components/categories/CategoryForm'
import { CategoryPageHeader } from './CategoryPageHeader'
import { CategoryFormSkeleton } from './CategoryFormSkeleton'
import { CategoryNotFoundState } from './CategoryNotFoundState'

export default function EditCategoryUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: category, isLoading } = useCategory(id!)
  const updateCategory = useUpdateCategory()

  const handleSubmit = (data: CategoryFormValues) => {
    if (!id) return
    updateCategory.mutate({ id, data })
  }

  if (isLoading) {
    return <CategoryFormSkeleton />
  }

  if (!category) {
    return (
      <CategoryNotFoundState
        description="The category you're trying to edit doesn't exist."
        actionLabel='Back to Categories'
        onAction={() => navigate('/admin/categories')}
      />
    )
  }

  return (
    <div className='min-h-screen'>
      <CategoryPageHeader
        breadcrumbs={[
          { label: 'Categories', onClick: () => navigate('/admin/categories') },
          {
            label: category.name,
            onClick: () => navigate(`/admin/categories/${id}`),
          },
          { label: 'Edit' },
        ]}
        title='Edit Category'
        subtitle={`Update information for ${category.name}`}
        icon={<Save className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='outline'
            onClick={() => navigate(`/admin/categories/${id}`)}
            disabled={updateCategory.isPending}
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
              initialData={category}
              onSubmit={handleSubmit}
              isSubmitting={updateCategory.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
