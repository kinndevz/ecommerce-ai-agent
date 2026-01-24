import { Shield } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'

interface RolesEmptyStateProps {
  colSpan: number
}

export function RolesEmptyState({ colSpan }: RolesEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-24 text-center'>
        <div className='flex flex-col items-center justify-center py-8'>
          <Shield className='h-12 w-12 text-muted-foreground/50 mb-2' />
          <p className='text-muted-foreground'>No roles found</p>
        </div>
      </TableCell>
    </TableRow>
  )
}
