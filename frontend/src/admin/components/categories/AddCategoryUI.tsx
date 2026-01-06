import { useNavigate } from 'react-router-dom'
import { Home, ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CategoryForm } from '@/admin/components/categories/CategoryForm'
import { useCreateCategory } from '@/hooks/useCategories'
import type { CategoryFormValues } from '@/admin/components/categories/CategoryForm'

export default function AddCategoryUI() {
  const navigate = useNavigate()
  const createCategory = useCreateCategory()

  const handleSubmit = (data: CategoryFormValues) => {
    createCategory.mutate(data)
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
              onClick={() => navigate('/admin/categories')}
              className='hover:text-foreground transition-colors'
            >
              Categories
            </button>
            <ChevronRight className='w-4 h-4' />
            <span className='text-foreground font-medium'>
              Add New Category
            </span>
          </div>

          {/* Header Actions */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <Sparkles className='w-6 h-6 text-primary' />
                Add New Category
              </h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Create a new product category
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate('/admin/categories')}
                disabled={createCategory.isPending}
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
