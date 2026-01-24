import { useState } from 'react'
import { Columns, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/shared/components/ui/dropdown-menu'
import type { PermissionData } from '@/api/permission.api'
import { HTTP_METHOD_CONFIG } from '@/api/services/http-method.constants'
import { PermissionsTableSkeleton } from './PermissionsTableSkeleton'
import { PermissionsEmptyState } from './PermissionsEmptyState'
import { PermissionsPaginationBar } from './PermissionsPaginationBar'
import { PermissionsActionsMenu } from './PermissionsActionsMenu'
import { formatRoleDate } from '@/domains/admin/helpers/role.helpers'

interface PermissionsTableProps {
  permissions: PermissionData[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  totalPages: number
  total: number
  sortBy?: 'name' | 'path' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (sortBy: 'name' | 'path' | 'created_at') => void
}

const COLUMNS = [
  { key: 'method', label: 'Method', visible: true, sortable: false },
  { key: 'path', label: 'Path', visible: true, sortable: false },
  { key: 'name', label: 'Name', visible: true, sortable: false },
  { key: 'module', label: 'Module', visible: true, sortable: false },
  { key: 'created', label: 'Created', visible: true, sortable: false },
]

export function PermissionsTable({
  permissions,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onPageChange,
  onSort,
}: PermissionsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState(() =>
    COLUMNS.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(permissions.map((p) => p.id)))
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

  const allSelected =
    permissions.length > 0 && selectedRows.size === permissions.length
  const someSelected = selectedRows.size > 0 && !allSelected

  // Initial loading - show skeletons
  if (isLoading && !isFetching) {
    return <PermissionsTableSkeleton />
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground'>
            {selectedRows.size > 0
              ? `${selectedRows.size} of ${permissions.length} row(s) selected`
              : `Showing ${permissions.length} of ${total} permissions`}
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

              {visibleColumns.method && <TableHead>Method</TableHead>}
              {visibleColumns.path && <TableHead>Path</TableHead>}
              {visibleColumns.name && <TableHead>Name & Description</TableHead>}
              {visibleColumns.module && <TableHead>Module</TableHead>}

              {visibleColumns.created && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                  >
                    <span>Created</span>
                  </Button>
                </TableHead>
              )}

              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <PermissionsEmptyState colSpan={COLUMNS.length + 2} />
            ) : (
              permissions.map((permission) => {
                const isSelected = selectedRows.has(permission.id)
                const methodConfig =
                  HTTP_METHOD_CONFIG[
                    permission.method as keyof typeof HTTP_METHOD_CONFIG
                  ]

                return (
                  <TableRow
                    key={permission.id}
                    className={`cursor-pointer ${
                      isSelected ? 'bg-muted/50' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(permission.id, checked as boolean)
                        }
                        aria-label={`Select ${permission.name}`}
                      />
                    </TableCell>

                    {visibleColumns.method && (
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={`${methodConfig.className} font-mono font-bold text-xs`}
                        >
                          {methodConfig.label}
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.path && (
                      <TableCell>
                        <code className='text-xs font-mono bg-muted px-2 py-1 rounded border'>
                          {permission.path}
                        </code>
                      </TableCell>
                    )}

                    {visibleColumns.name && (
                      <TableCell>
                        <div>
                          <div className='font-medium text-sm'>
                            {permission.name}
                          </div>
                          {permission.description && (
                            <div className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.module && (
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className='bg-primary/10 text-primary'
                        >
                          {permission.module}
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.created && (
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatRoleDate(permission.created_at)}
                      </TableCell>
                    )}

                    <TableCell>
                      <PermissionsActionsMenu />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PermissionsPaginationBar
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
