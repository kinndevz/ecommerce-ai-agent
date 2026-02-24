import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'

export function DocumentsTableSkeleton() {
  return (
    <div className='rounded-xl border border-border overflow-hidden bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            <TableHead>Document Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>File Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-12'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-lg' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-24' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-16' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-6 w-16 rounded-full' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-6 w-20 rounded-full' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-8 w-8' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
