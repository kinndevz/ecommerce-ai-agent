import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  Columns,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Settings,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/ui/skeleton'
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/shared/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { RoleDetailData } from '@/api/role.api'
import { ViewRoleDialog } from './ViewRoleDialog'
import { EditRoleDialog } from './EditRoleDialog'

interface RolesTableProps {
  roles: RoleDetailData[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  totalPages: number
  total: number
  sortBy?: 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (sortBy: 'name' | 'created_at') => void
  onDelete: (role: RoleDetailData) => void
}

const COLUMNS = [
  { key: 'role', label: 'Role', visible: true, sortable: false },
  { key: 'description', label: 'Description', visible: true, sortable: false },
  { key: 'status', label: 'Status', visible: true, sortable: false },
  { key: 'permissions', label: 'Permissions', visible: true, sortable: false },
  { key: 'created', label: 'Created', visible: true, sortable: false },
]

export function RolesTable({
  roles,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onPageChange,
  onSort,
  onDelete,
}: RolesTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState(() =>
    COLUMNS.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  )
  const [viewRoleId, setViewRoleId] = useState<string | null>(null)
  const [editRoleId, setEditRoleId] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(roles.map((r) => r.id)))
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

  const allSelected = roles.length > 0 && selectedRows.size === roles.length
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
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground'>
            {selectedRows.size > 0
              ? `${selectedRows.size} of ${roles.length} row(s) selected`
              : `Showing ${roles.length} of ${total} roles`}
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

              {visibleColumns.role && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                  >
                    <span>Role</span>
                  </Button>
                </TableHead>
              )}

              {visibleColumns.description && <TableHead>Description</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns.permissions && <TableHead>Permissions</TableHead>}

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
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 2}
                  className='h-24 text-center'
                >
                  <div className='flex flex-col items-center justify-center py-8'>
                    <Shield className='h-12 w-12 text-muted-foreground/50 mb-2' />
                    <p className='text-muted-foreground'>No roles found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const isSelected = selectedRows.has(role.id)

                return (
                  <TableRow
                    key={role.id}
                    className={`cursor-pointer ${
                      isSelected ? 'bg-muted/50' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(role.id, checked as boolean)
                        }
                        aria-label={`Select ${role.name}`}
                      />
                    </TableCell>

                    {visibleColumns.role && (
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-9 w-9 rounded-lg'>
                            <AvatarFallback className='rounded-lg bg-primary/10'>
                              <Shield className='h-5 w-5 text-primary' />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>{role.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              ID: {role.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.description && (
                      <TableCell>
                        <p className='text-sm text-muted-foreground line-clamp-2 max-w-md'>
                          {role.description || 'No description'}
                        </p>
                      </TableCell>
                    )}

                    {visibleColumns.status && (
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={
                            role.is_active
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                          }
                        >
                          {role.is_active ? (
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                          ) : (
                            <XCircle className='w-3 h-3 mr-1' />
                          )}
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.permissions && (
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm'>
                          <Lock className='w-3.5 h-3.5 text-muted-foreground' />
                          <span className='font-medium'>
                            {role.permissions?.length || 0} permissions
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.created && (
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                    )}

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => setViewRoleId(role.id)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditRoleId(role.id)}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => onDelete(role)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
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

      {/* Dialogs */}
      <ViewRoleDialog
        roleId={viewRoleId}
        open={!!viewRoleId}
        onOpenChange={(open) => !open && setViewRoleId(null)}
      />
      <EditRoleDialog
        roleId={editRoleId}
        open={!!editRoleId}
        onOpenChange={(open) => !open && setEditRoleId(null)}
      />
    </div>
  )
}
