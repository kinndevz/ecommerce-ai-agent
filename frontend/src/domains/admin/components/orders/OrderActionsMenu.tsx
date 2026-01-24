import { useNavigate } from 'react-router-dom'
import { Eye, MoreHorizontal, Package } from 'lucide-react'
import type { OrderListItem } from '@/api/order.api'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ORDER_STATUS } from '@/api/services/order.constants'

interface OrderActionsMenuProps {
  order: OrderListItem
  onUpdateStatus: (order: OrderListItem) => void
}

export function OrderActionsMenu({ order, onUpdateStatus }: OrderActionsMenuProps) {
  const navigate = useNavigate()
  const canUpdateStatus =
    order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-foreground'
        >
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem
          onClick={() => navigate(`/admin/orders/${order.id}`)}
          className='gap-2 cursor-pointer py-2.5 text-sm'
        >
          <Eye className='w-4 h-4 text-muted-foreground' />
          <span>View Details</span>
        </DropdownMenuItem>
        {canUpdateStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUpdateStatus(order)}
              className='gap-2 cursor-pointer py-2.5 text-sm'
            >
              <Package className='w-4 h-4 text-muted-foreground' />
              <span>Update Status</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
