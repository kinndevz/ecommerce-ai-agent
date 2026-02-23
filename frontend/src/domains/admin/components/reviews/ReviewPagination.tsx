import { Button } from '@/shared/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ReviewPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ReviewPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ReviewPaginationProps) {
  return (
    <div className='flex items-center justify-center gap-2 pt-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className='h-4 w-4 mr-1' />
        Previous
      </Button>

      <span className='text-sm text-muted-foreground px-4'>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className='h-4 w-4 ml-1' />
      </Button>
    </div>
  )
}
