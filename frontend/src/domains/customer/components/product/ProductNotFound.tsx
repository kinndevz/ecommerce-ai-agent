import { PackageX } from 'lucide-react'

export function ProductNotFound() {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4'>
      <div className='p-6 bg-muted/30 rounded-full mb-4'>
        <PackageX className='w-12 h-12 text-muted-foreground' />
      </div>
      <h2 className='text-2xl font-bold tracking-tight mb-2'>
        Product not found
      </h2>
      <p className='text-muted-foreground max-w-md'>
        The product you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
    </div>
  )
}
