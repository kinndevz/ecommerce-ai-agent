import { Button } from '@/shared/components/ui/button'

interface OrdersPaginationBarProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function OrdersPaginationBar({
  page,
  total,
  limit,
  onPageChange,
}: OrdersPaginationBarProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className='flex items-center justify-between py-4 px-2'>
      <p className='text-sm text-muted-foreground font-medium'>
        Showing{' '}
        <span className='font-semibold text-foreground'>{(page - 1) * limit + 1}</span>{' '}
        to{' '}
        <span className='font-semibold text-foreground'>
          {Math.min(page * limit, total)}
        </span>{' '}
        of <span className='font-semibold text-foreground'>{total}</span> results
      </p>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className='h-9 px-4 text-sm font-medium'
        >
          Previous
        </Button>

        <div className='flex items-center gap-1'>
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 text-sm font-medium ${
                page === pageNum ? 'shadow-md' : 'text-muted-foreground'
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className='h-9 px-4 text-sm font-medium'
        >
          Next
        </Button>
      </div>
    </div>
  )
}
