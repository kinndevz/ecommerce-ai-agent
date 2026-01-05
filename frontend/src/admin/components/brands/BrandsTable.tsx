import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Globe,
  Package,
  Plus,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { Brand } from '@/api/brand.api'

interface BrandsTableProps {
  brands: Brand[]
  isLoading: boolean
  onDelete: (brand: Brand) => void
  onToggleStatus: (brand: Brand) => void
}

export function BrandsTable({
  brands,
  isLoading,
  onDelete,
  onToggleStatus,
}: BrandsTableProps) {
  const navigate = useNavigate()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(brands.map((b) => b.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className='text-center py-12 border border-dashed rounded-lg'>
        <Package className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
        <h3 className='text-lg font-semibold mb-1'>No brands found</h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Get started by creating your first brand
        </p>
        <Button onClick={() => navigate('/admin/brands/add')}>
          <Plus className='w-4 h-4 mr-2' />
          Add Brand
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={selectedRows.size === brands.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-center'>Products</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                {/* Checkbox */}
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(brand.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(brand.id, checked as boolean)
                    }
                  />
                </TableCell>

                {/* Brand Name with Logo */}
                <TableCell>
                  <div className='flex items-center gap-3'>
                    {/* Logo */}
                    <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0'>
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <Package className='w-5 h-5 text-muted-foreground' />
                      )}
                    </div>
                    {/* Name & Website */}
                    <div className='min-w-0'>
                      <button
                        onClick={() => navigate(`/admin/brands/${brand.id}`)}
                        className='font-medium hover:underline text-left truncate block'
                      >
                        {brand.name}
                      </button>
                      {brand.website_url && (
                        <a
                          href={brand.website_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className='w-3 h-3' />
                          <span className='truncate'>{brand.website_url}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Country */}
                <TableCell>
                  <span className='text-sm'>
                    {brand.country || (
                      <span className='text-muted-foreground'>—</span>
                    )}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant='outline'
                    className={
                      brand.is_active
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                    }
                  >
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* Product Count */}
                <TableCell className='text-center'>
                  <Badge variant='secondary'>{brand.product_count}</Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/brands/${brand.id}`)}
                      >
                        <Eye className='w-4 h-4 mr-2' />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/admin/brands/${brand.id}/edit`)
                        }
                      >
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Selection Info */}
      {selectedRows.size > 0 && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>
            {selectedRows.size} of {brands.length} row(s) selected
          </span>
        </div>
      )}
    </div>
  )
}
