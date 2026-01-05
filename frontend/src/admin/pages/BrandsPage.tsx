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
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { BrandStatsCards } from '@/admin/components/brands/BrandStatsCards'
import { BrandFilters } from '@/admin/components/brands/BrandFilters'
import { BrandsTable } from '@/admin/components/brands/BrandsTable'
import {
  useBrands,
  useDeleteBrand,
  useToggleBrandStatus,
  brandKeys,
} from '@/hooks/useBrands'
import type { Brand } from '@/api/brand.api'

export default function BrandsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch data
  const { brands, isLoading, isFetching } = useBrands({
    include_inactive: true,
  })

  // Mutations
  const deleteBrand = useDeleteBrand()
  const toggleStatus = useToggleBrandStatus()

  // Filtered brands
  const filteredBrands = useMemo(() => {
    if (!brands || brands.length === 0) return []

    return brands.filter((brand) => {
      // Search filter
      const matchesSearch =
        search === '' ||
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.country?.toLowerCase().includes(search.toLowerCase())

      // Status filter
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && brand.is_active) ||
        (status === 'inactive' && !brand.is_active)

      return matchesSearch && matchesStatus
    })
  }, [brands, search, status])

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: brandKeys.stats() })
      toast.success('Data refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
  }

  const handleDelete = (brand: Brand) => {
    setBrandToDelete(brand)
  }

  const confirmDelete = async () => {
    if (!brandToDelete) return

    try {
      await deleteBrand.mutateAsync(brandToDelete.id)
      setBrandToDelete(null)
    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleStatus = async (brand: Brand) => {
    try {
      await toggleStatus.mutateAsync(brand.id)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AdminLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              Brands
            </h1>
            <p className='text-muted-foreground'>
              Manage your brand portfolio and partnerships
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Refresh Button */}
            <Button
              variant='outline'
              size='default'
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className='gap-2 hover:bg-primary/10 transition-colors'
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing || isFetching ? 'animate-spin' : ''
                }`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Add Brand Button */}
            <Button
              onClick={() => navigate('/admin/brands/add')}
              className='gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5'
            >
              <Plus className='h-4 w-4' />
              Add Brand
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <BrandStatsCards />

        {/* Filters */}
        <BrandFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onClearFilters={handleClearFilters}
        />

        {/* Table */}
        <BrandsTable
          brands={filteredBrands}
          isLoading={isLoading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!brandToDelete}
          onOpenChange={(open) => !open && setBrandToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{' '}
                <strong>{brandToDelete?.name}</strong>.
                {brandToDelete && brandToDelete.product_count > 0 && (
                  <span className='block mt-2 text-destructive font-medium'>
                    ⚠️ This brand has {brandToDelete.product_count} product(s).
                    You cannot delete it.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={
                  brandToDelete ? brandToDelete.product_count > 0 : false
                }
                className='bg-destructive hover:bg-destructive/90'
              >
                {deleteBrand.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
