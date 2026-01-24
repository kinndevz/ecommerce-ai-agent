import { Package } from 'lucide-react'

export function OrdersEmptyState() {
  return (
    <div className='rounded-2xl border border-dashed bg-card/50'>
      <div className='text-center py-20 px-6'>
        <div className='inline-flex p-4 rounded-full bg-primary/10 mb-6'>
          <Package className='w-12 h-12 text-primary' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>No Orders Found</h3>
        <p className='text-muted-foreground text-sm max-w-sm mx-auto'>
          There are no orders matching your current filters. Try adjusting your
          search criteria.
        </p>
      </div>
    </div>
  )
}
