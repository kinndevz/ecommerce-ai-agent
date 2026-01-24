import { useState } from 'react'
import {
  Shield,
  Columns,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
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
import type { RoleDetailData } from '@/api/role.api'
import { ViewRoleDialog } from './ViewRoleDialog'
import { EditRoleDialog } from './EditRoleDialog'
import { RolesTableSkeleton } from './RolesTableSkeleton'
import { RolesEmptyState } from './RolesEmptyState'
import { RolesPaginationBar } from './RolesPaginationBar'
import { RoleActionsMenu } from './RoleActionsMenu'
import {
  formatRoleDate,
  getRoleStatusBadgeClass,
  getRoleStatusLabel,
} from '@/domains/admin/helpers/role.helpers'

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
    return <RolesTableSkeleton />
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
              <RolesEmptyState colSpan={COLUMNS.length + 2} />
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
                          className={getRoleStatusBadgeClass(role.is_active)}
                        >
                          {role.is_active ? (
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                          ) : (
                            <XCircle className='w-3 h-3 mr-1' />
                          )}
                          {getRoleStatusLabel(role.is_active)}
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
                        {formatRoleDate(role.created_at)}
                      </TableCell>
                    )}

                    <TableCell>
                      <RoleActionsMenu
                        onView={() => setViewRoleId(role.id)}
                        onEdit={() => setEditRoleId(role.id)}
                        onDelete={() => onDelete(role)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <RolesPaginationBar
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

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
