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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import type { User } from '@/api/user.api'
import { useNavigate } from 'react-router-dom'
import {
  TFA_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  USER_STATUS,
  USER_STATUS_CONFIG,
} from '@/api/services/user.constants'

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
  const navigate = useNavigate()

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

  const handleSort = (columnKey: 'full_name' | 'email' | 'created_at') => {
    onSort(columnKey)
  }

  // const getSortIcon = (columnKey: 'full_name' | 'email' | 'created_at') => {
  //   if (sortBy !== columnKey) {
  //     return <ArrowUpDown className='ml-2 h-4 w-4' />
  //   }
  //   return sortOrder === 'asc' ? (
  //     <ArrowUp className='ml-2 h-4 w-4' />
  //   ) : (
  //     <ArrowDown className='ml-2 h-4 w-4' />
  //   )
  // }

  const allSelected = users.length > 0 && selectedRows.size === users.length
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
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='h-32 text-center text-muted-foreground'
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const initials = user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                // Normalize to UPPERCASE to match config keys
                const statusKey = user.status.toUpperCase()
                const roleKey = user.role.name.toUpperCase()

                const statusConfig = USER_STATUS_CONFIG[statusKey] || {
                  label: user.status,
                  className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                }
                const roleConfig = USER_ROLE_CONFIG[roleKey] || {
                  label: user.role.name,
                  className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                }
                const tfaConfig = user.is_2fa_enabled
                  ? TFA_STATUS_CONFIG.enabled
                  : TFA_STATUS_CONFIG.disabled

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
                          <p>
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                          <p className='text-muted-foreground'>
                            {new Date(user.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                    )}

                    {/* Actions */}
                    <TableCell className='w-12'>
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
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/users/${user.id}/edit`)
                            }
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(user)}
                          >
                            {user.status === USER_STATUS.ACTIVE ? (
                              <>
                                <ShieldOff className='w-4 h-4 mr-2' />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Shield className='w-4 h-4 mr-2' />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => onDelete(user)}
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
    </div>
  )
}
