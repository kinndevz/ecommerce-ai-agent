import { Lock } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'

interface PermissionsEmptyStateProps {
  colSpan: number
}

export function PermissionsEmptyState({ colSpan }: PermissionsEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-24 text-center'>
        <div className='flex flex-col items-center justify-center py-8'>
          <Lock className='h-12 w-12 text-muted-foreground/50 mb-2' />
          <p className='text-muted-foreground'>No permissions found</p>
        </div>
      </TableCell>
    </TableRow>
  )
}
