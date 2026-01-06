import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { CategoryFilters } from '@/admin/components/categories/CategoryFilters'
import { CategoryTreeTable } from '@/admin/components/categories/CategoryTreeTable'
import { useCategoriesList, useDeleteCategory } from '@/hooks/useCategories'
import type { Category } from '@/api/category.api'
import { CategoryStatsCards } from '../components/categories/CategoryStatCards'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )

  const { categories, isLoading, isFetching, refetch } = useCategoriesList({
    include_inactive: true,
  })

  const deleteCategory = useDeleteCategory()

  // Client-side filtering
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.slug.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && category.is_active) ||
        (status === 'inactive' && !category.is_active)

      return matchesSearch && matchesStatus
    })
  }, [categories, search, status])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch (error) {
      console.log(error)
    }
  }

  const hasProducts = categoryToDelete?.product_count || 0
  const hasChildren = categoryToDelete?.children_count || 0

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Categories</h1>
            <p className='text-muted-foreground mt-1'>
              Manage your product categories
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button onClick={() => navigate('/admin/categories/add')}>
              <Plus className='w-4 h-4 mr-2' />
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <CategoryStatsCards />

        {/* Filters */}
        <CategoryFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          onClearFilters={handleClearFilters}
        />

        {/* Categories Tree Table */}
        <CategoryTreeTable
          categories={filteredCategories}
          isLoading={isLoading && !categories.length}
          onDelete={setCategoryToDelete}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{categoryToDelete?.name}</strong>.
              {(hasProducts > 0 || hasChildren > 0) && (
                <span className='block mt-2 text-destructive font-medium'>
                  ⚠️ This category has{' '}
                  {hasProducts > 0 && `${hasProducts} product(s)`}
                  {hasProducts > 0 && hasChildren > 0 && ' and '}
                  {hasChildren > 0 && `${hasChildren} subcategories`}. You
                  cannot delete it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={hasProducts > 0 || hasChildren > 0}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
