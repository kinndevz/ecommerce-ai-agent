import { TableCell, TableRow } from '@/shared/components/ui/table'

interface UsersEmptyStateProps {
  colSpan: number
}

export function UsersEmptyState({ colSpan }: UsersEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-32 text-center text-muted-foreground'>
        No users found.
      </TableCell>
    </TableRow>
  )
}
