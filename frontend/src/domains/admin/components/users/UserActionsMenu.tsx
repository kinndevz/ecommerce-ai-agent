import { Edit, Eye, MoreHorizontal, Shield, ShieldOff, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { USER_STATUS } from '@/api/services/user.constants'
import type { User } from '@/api/user.api'

interface UserActionsMenuProps {
  user: User
  onToggleStatus: (user: User) => void
  onDelete: (user: User) => void
}

export function UserActionsMenu({
  user,
  onToggleStatus,
  onDelete,
}: UserActionsMenuProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
          <Eye className='w-4 h-4 mr-2' />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
          {user.status === USER_STATUS.ACTIVE ? (
            <>
              <ShieldOff className='w-4 h-4 mr-2' />
              Deactivate
            </>
          ) : (
            <>
              <Shield className='w-4 h-4 mr-2' />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-destructive' onClick={() => onDelete(user)}>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
