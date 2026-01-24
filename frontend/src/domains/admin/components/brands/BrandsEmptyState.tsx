import { Package, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface BrandsEmptyStateProps {
  onCreate: () => void
}

export function BrandsEmptyState({ onCreate }: BrandsEmptyStateProps) {
  return (
    <div className='text-center py-12 border border-dashed rounded-lg'>
      <Package className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
      <h3 className='text-lg font-semibold mb-1'>No brands found</h3>
      <p className='text-sm text-muted-foreground mb-4'>
        Get started by creating your first brand
      </p>
      <Button onClick={onCreate}>
        <Plus className='w-4 h-4 mr-2' />
        Add Brand
      </Button>
    </div>
  )
}
