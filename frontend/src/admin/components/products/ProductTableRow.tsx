import { MoreHorizontal, Star, Edit, Trash2, Eye } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Checkbox } from '@/shared/components/ui/checkbox'
import type { ProductListItem } from '@/api/product.api'

interface ProductTableRowProps {
  product: ProductListItem
  isSelected: boolean
  onSelect: (checked: boolean) => void
}

export function ProductTableRow({
  product,
  isSelected,
  onSelect,
}: ProductTableRowProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <TableRow className='hover:bg-muted/50'>
      {/* Checkbox */}
      <TableCell className='w-12'>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>

      {/* Product Info */}
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0'>
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt={product.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-muted-foreground text-xs'>
                No image
              </div>
            )}
          </div>
          <div className='min-w-0'>
            <p className='font-medium truncate'>{product.name}</p>
            <p className='text-sm text-muted-foreground truncate'>
              {product.brand.name}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell>
        <div>
          <p className='font-semibold'>{formatPrice(product.price)}</p>
          {product.sale_price && (
            <p className='text-sm text-muted-foreground line-through'>
              {formatPrice(product.sale_price)}
            </p>
          )}
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <Badge variant='outline'>{product.category.name}</Badge>
      </TableCell>

      {/* Stock */}
      <TableCell>
        <span
          className={`font-medium ${
            product.stock_quantity > 10
              ? 'text-green-600'
              : product.stock_quantity > 0
              ? 'text-amber-600'
              : 'text-red-600'
          }`}
        >
          {product.stock_quantity}
        </span>
      </TableCell>

      {/* SKU */}
      <TableCell>
        <code className='text-xs bg-muted px-2 py-1 rounded'>
          {product.sku}
        </code>
      </TableCell>

      {/* Rating */}
      <TableCell>
        <div className='flex items-center gap-1'>
          <Star className='w-4 h-4 fill-amber-500 text-amber-500' />
          <span className='font-medium'>{product.rating_average}</span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge
          variant={product.is_available ? 'default' : 'destructive'}
          className={
            product.is_available
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }
        >
          {product.is_available ? 'Active' : 'Out of Stock'}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className='w-12'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
