import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { Brand } from '@/api/brand.api'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface BrandActionsMenuProps {
  brand: Brand
  onToggleStatus: (brand: Brand) => void
  onDelete: (brand: Brand) => void
}

export function BrandActionsMenu({
  brand,
  onToggleStatus,
  onDelete,
}: BrandActionsMenuProps) {
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
        <DropdownMenuItem onClick={() => navigate(`/admin/brands/${brand.id}`)}>
          <Eye className='w-4 h-4 mr-2' />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/admin/brands/${brand.id}/edit`)}>
          <Edit className='w-4 h-4 mr-2' />
          Edit Brand
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(brand)}>
          {brand.is_active ? (
            <>
              <XCircle className='w-4 h-4 mr-2' />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircle className='w-4 h-4 mr-2' />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => onDelete(brand)}
        >
          <Trash2 className='w-4 h-4 mr-2' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
