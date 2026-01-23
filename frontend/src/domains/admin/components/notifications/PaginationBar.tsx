import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useMemo } from 'react'

interface PaginationBarProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
}: PaginationBarProps) {
  const pageNumbers = useMemo(() => {
    const pages = Math.min(5, totalPages)
    return Array.from({ length: pages }, (_, index) => {
      if (totalPages <= 5) return index + 1
      if (page <= 3) return index + 1
      if (page >= totalPages - 2) return totalPages - 4 + index
      return page - 2 + index
    })
  }, [page, totalPages])

  return (
    <div className='flex items-center justify-between'>
      <p className='text-sm text-muted-foreground'>
        Page {page} of {Math.max(totalPages, 1)}
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
