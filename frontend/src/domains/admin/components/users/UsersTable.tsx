import { useState } from 'react'
import {
  Columns,
  Loader2,
  Shield,
  ShieldOff,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import type { User } from '@/api/user.api'
import {
  USER_STATUS,
} from '@/api/services/user.constants'
import {
  formatUserDate,
  formatUserTime,
  getUserInitials,
  getUserRoleConfig,
  getUserStatusConfig,
  getUserTfaConfig,
} from '@/domains/admin/helpers/user.helpers'
import { UsersTableSkeleton } from './UsersTableSkeleton'
import { UsersEmptyState } from './UsersEmptyState'
import { UsersPaginationBar } from './UsersPaginationBar'
import { UserActionsMenu } from './UserActionsMenu'

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  totalPages: number
  total: number
  sortBy?: 'full_name' | 'email' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (sortBy: 'full_name' | 'email' | 'created_at') => void
  onDelete: (user: User) => void
  onToggleStatus: (user: User) => void
}

const COLUMNS = [
  { key: 'user', label: 'User', visible: true, sortable: false },
  { key: 'phone', label: 'Phone', visible: true, sortable: false },
  { key: 'role', label: 'Role', visible: true, sortable: false },
  { key: 'status', label: 'Status', visible: true, sortable: false },
  { key: '2fa', label: '2FA', visible: true, sortable: false },
  { key: 'created', label: 'Created', visible: true, sortable: false },
]

export function UsersTable({
  users,
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
  onToggleStatus,
}: UsersTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState(() =>
    COLUMNS.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<string, boolean>
    )
  )
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(users.map((u) => u.id)))
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

  const allSelected = users.length > 0 && selectedRows.size === users.length
  const someSelected = selectedRows.size > 0 && !allSelected

  // Initial loading - show skeletons
  if (isLoading && !isFetching) {
    return <UsersTableSkeleton />
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground'>
            {selectedRows.size > 0
              ? `${selectedRows.size} of ${users.length} row(s) selected`
              : `Showing ${users.length} of ${total} users`}
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

              {visibleColumns.user && (
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='-ml-3 h-8 data-[state=open]:bg-accent'
                  >
                    <span>User</span>
                  </Button>
                </TableHead>
              )}

              {visibleColumns.phone && <TableHead>Phone</TableHead>}
              {visibleColumns.role && <TableHead>Role</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns['2fa'] && <TableHead>2FA</TableHead>}

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
            {users.length === 0 ? (
              <UsersEmptyState colSpan={8} />
            ) : (
              users.map((user) => {
                const initials = getUserInitials(user.full_name)
                const statusConfig = getUserStatusConfig(user.status)
                const roleConfig = getUserRoleConfig(user.role.name)
                const tfaConfig = getUserTfaConfig(user.is_2fa_enabled)

                return (
                  <TableRow key={user.id} className='hover:bg-muted/50'>
                    {/* Checkbox */}
                    <TableCell className='w-12'>
                      <Checkbox
                        checked={selectedRows.has(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(user.id, checked as boolean)
                        }
                      />
                    </TableCell>

                    {/* User */}
                    {visibleColumns.user && (
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='w-10 h-10 shrink-0'>
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className='min-w-0'>
                            <p className='font-medium truncate'>
                              {user.full_name}
                            </p>
                            <p className='text-sm text-muted-foreground truncate'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Phone */}
                    {visibleColumns.phone && (
                      <TableCell>
                        {user.phone_number ? (
                          <span className='text-sm'>{user.phone_number}</span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>
                            —
                          </span>
                        )}
                      </TableCell>
                    )}

                    {/* Role */}
                    {visibleColumns.role && (
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={roleConfig.className}
                        >
                          {roleConfig.label}
                        </Badge>
                      </TableCell>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={statusConfig.className}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                    )}

                    {/* 2FA */}
                    {visibleColumns['2fa'] && (
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={tfaConfig.className}
                        >
                          {user.is_2fa_enabled ? (
                            <Shield className='w-3 h-3 mr-1' />
                          ) : (
                            <ShieldOff className='w-3 h-3 mr-1' />
                          )}
                          {tfaConfig.label}
                        </Badge>
                      </TableCell>
                    )}

                    {/* Created */}
                    {visibleColumns.created && (
                      <TableCell>
                        <div className='text-sm'>
                          <p>{formatUserDate(user.created_at)}</p>
                          <p className='text-muted-foreground'>
                            {formatUserTime(user.created_at)}
                          </p>
                        </div>
                      </TableCell>
                    )}

                    {/* Actions */}
                    <TableCell className='w-12'>
                      <UserActionsMenu
                        user={user}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <UsersPaginationBar
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
