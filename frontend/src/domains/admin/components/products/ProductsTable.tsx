import { useState } from 'react'
import {
  Columns,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Star,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Badge } from '@/shared/components/ui/badge'
import type { ProductListItem } from '@/api/product.api'
import {
  formatVndPrice,
  getAvailabilityBadgeClass,
  getStockTextClass,
} from '@/domains/admin/helpers/product.helpers'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'
import { ProductsEmptyState } from './ProductsEmptyState'
import { ProductsPaginationBar } from './ProductsPaginationBar'
import { ProductActionsMenu } from './ProductActionsMenu'

interface ProductsTableProps {
  products: ProductListItem[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  totalPages: number
  total: number
  sortBy?: 'name' | 'price' | 'created_at' | 'rating' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (
    sortBy: 'name' | 'price' | 'created_at' | 'rating' | 'popularity'
  ) => void
}

const COLUMNS = [
  { key: 'name', label: 'Product Name', visible: true, sortable: true },
  { key: 'price', label: 'Price', visible: true, sortable: true },
  { key: 'category', label: 'Category', visible: true, sortable: false },
  { key: 'stock', label: 'Stock', visible: true, sortable: false },
  { key: 'sku', label: 'SKU', visible: true, sortable: false },
  { key: 'rating', label: 'Rating', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: false },
]

export function ProductsTable({
  products,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onPageChange,
  onSort,
}: ProductsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState(() =>
    COLUMNS.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  )
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(products.map((p) => p.id)))
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

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSort = (
    columnKey: 'name' | 'price' | 'created_at' | 'rating' | 'popularity'
  ) => {
    onSort(columnKey)
  }

  const getSortIcon = (
    columnKey: 'name' | 'price' | 'created_at' | 'rating' | 'popularity'
  ) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className='ml-2 h-4 w-4' />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className='ml-2 h-4 w-4' />
    ) : (
      <ArrowDown className='ml-2 h-4 w-4' />
    )
  }

  const allSelected =
    products.length > 0 && selectedRows.size === products.length
  const someSelected = selectedRows.size > 0 && !allSelected

  // Initial loading - show skeletons
  if (isLoading && !isFetching) {
    return <ProductsTableSkeleton />
  }

  if (products.length === 0) {
    return <ProductsEmptyState />
  }

  return (
    <div className='space-y-4'>
      {/* Column Visibility Dropdown */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground'>
            {selectedRows.size > 0
              ? `${selectedRows.size} of ${products.length} row(s) selected`
              : `Showing ${products.length} of ${total} products`}
          </p>
          {/* Subtle loading indicator */}
          {isFetching && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Updating...</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <Columns className='h-4 w-4' />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            {COLUMNS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns[column.key]}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='w-12'>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label='Select all'
                  className={someSelected ? 'opacity-50' : ''}
                />
              </TableHead>

              {visibleColumns.name && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                    onClick={() => handleSort('name')}
                  >
                    <span>Product Name</span>
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
              )}

              {visibleColumns.price && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                    onClick={() => handleSort('price')}
                  >
                    <span>Price</span>
                    {getSortIcon('price')}
                  </Button>
                </TableHead>
              )}

              {visibleColumns.category && <TableHead>Category</TableHead>}
              {visibleColumns.stock && <TableHead>Stock</TableHead>}
              {visibleColumns.sku && <TableHead>SKU</TableHead>}

              {visibleColumns.rating && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                    onClick={() => handleSort('rating')}
                  >
                    <span>Rating</span>
                    {getSortIcon('rating')}
                  </Button>
                </TableHead>
              )}

              {visibleColumns.status && <TableHead>Status</TableHead>}
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
                <TableRow key={product.id} className='hover:bg-muted/50'>
                  {/* Checkbox */}
                  <TableCell className='w-12'>
                    <Checkbox
                      checked={selectedRows.has(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(product.id, checked as boolean)
                      }
                    />
                  </TableCell>

                  {/* Product Name */}
                  {visibleColumns.name && (
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0'>
                          {product.product_image ? (
                            <img
                              src={product.product_image}
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
                  )}

                  {/* Price */}
                  {visibleColumns.price && (
                    <TableCell>
                      <div>
                        {product.sale_price ? (
                          <>
                            <p className='font-semibold'>
                              {formatVndPrice(product.sale_price)}
                            </p>
                            <p className='text-xs text-muted-foreground line-through'>
                              {formatVndPrice(product.price)}
                            </p>
                          </>
                        ) : (
                          <p className='font-semibold'>
                            {formatVndPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Category */}
                  {visibleColumns.category && (
                    <TableCell>
                      <Badge variant='outline'>{product.category.name}</Badge>
                    </TableCell>
                  )}

                  {/* Stock */}
                  {visibleColumns.stock && (
                    <TableCell>
                      <span className={`font-medium ${getStockTextClass(product.stock_quantity)}`}>
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                  )}

                  {/* SKU */}
                  {visibleColumns.sku && (
                    <TableCell>
                      <code className='text-xs bg-muted px-2 py-1 rounded'>
                        {product.sku}
                      </code>
                    </TableCell>
                  )}

                  {/* Rating */}
                  {visibleColumns.rating && (
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 fill-amber-500 text-amber-500' />
                        <span className='font-medium'>
                          {product.rating_average}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={getAvailabilityBadgeClass(product.is_available)}
                      >
                        {product.is_available ? 'Active' : 'Out Of Stock'}
                      </Badge>
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell className='w-12'>
                    <ProductActionsMenu productId={product.id} />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductsPaginationBar
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
