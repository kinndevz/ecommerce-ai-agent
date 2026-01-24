import { Button } from '@/shared/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface UsersPaginationBarProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function UsersPaginationBar({
  page,
  totalPages,
  onPageChange,
}: UsersPaginationBarProps) {
  if (totalPages <= 1) return null

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className='flex items-center justify-between'>
      <p className='text-sm text-muted-foreground'>
        Page {page} of {totalPages}
      </p>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className='h-4 w-4' />
          <span className='sr-only'>First page</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='sr-only'>Previous page</span>
        </Button>

        <div className='flex items-center gap-1'>
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? 'default' : 'outline'}
              size='icon'
              className='h-8 w-8'
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className='h-4 w-4' />
          <span className='sr-only'>Next page</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className='h-4 w-4' />
          <span className='sr-only'>Last page</span>
        </Button>
      </div>
    </div>
  )
}
