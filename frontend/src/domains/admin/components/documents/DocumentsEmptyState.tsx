import { FileText } from 'lucide-react'

export function DocumentsEmptyState() {
  return (
    <div className='rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
        <FileText className='h-6 w-6 text-muted-foreground' />
      </div>
      <h3 className='mt-4 text-lg font-semibold'>No documents found</h3>
      <p className='mt-2 text-sm text-muted-foreground'>
        Upload your first document to get started.
      </p>
    </div>
  )
}
