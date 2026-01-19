import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import type { ProductListItem } from '@/api/product.api'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()

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

  const formatPrice = (price: number) => {
    const formattedNumber = new Intl.NumberFormat('vi-VN').format(price)
    return `${formattedNumber} đ`
  }

  const allSelected =
    products.length > 0 && selectedRows.size === products.length
  const someSelected = selectedRows.size > 0 && !allSelected

  // Initial loading - show skeletons
  if (isLoading && !isFetching) {
    return (
      <div className='space-y-3'>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    )
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
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='h-32 text-center text-muted-foreground'
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
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
                              {formatPrice(product.sale_price)}
                            </p>
                            <p className='text-xs text-muted-foreground line-through'>
                              {formatPrice(product.price)}
                            </p>
                          </>
                        ) : (
                          <p className='font-semibold'>
                            {formatPrice(product.price)}
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
                        className={
                          product.is_available
                            ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
                        }
                      >
                        {product.is_available ? 'Active' : 'Out Of Stock'}
                      </Badge>
                    </TableCell>
                  )}

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
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/products/${product.id}`)
                          }
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/products/${product.id}/edit`)
                          }
                        >
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Page {page} of {totalPages}
        </p>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className='h-4 w-4' />
            <span className='sr-only'>First page</span>
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous page</span>
          </Button>

          <div className='flex items-center gap-1'>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <Button
                  key={i}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Next page</span>
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className='h-4 w-4' />
            <span className='sr-only'>Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
