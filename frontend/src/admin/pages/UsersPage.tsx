import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import {
  useUsers,
  useUserStats,
  userKeys,
  useDeleteUser,
  useToggleUserStatus,
} from '@/hooks/useUsers'
import { UserStatsCards } from '@/admin/components/users/UserStatsCards'
import { UserFilters } from '@/admin/components/users/UserFilters'
import { UsersTable } from '@/admin/components/users/UsersTable'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UserQueryParams, User } from '@/api/user.api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { USER_STATUS } from '@/api/services/user.constants'
interface UserFilters extends UserQueryParams {
  sort_by?: 'full_name' | 'email' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export default function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const { data, isLoading, isFetching } = useUsers(filters)
  const { data: stats, isLoading: statsLoading } = useUserStats()

  // Mutations
  const deleteUser = useDeleteUser()
  const toggleStatus = useToggleUserStatus()

  const handleFilterChange = (newFilters: UserQueryParams) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleSort = (sortBy: 'full_name' | 'email' | 'created_at') => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order:
        prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: userKeys.stats() }),
      ])
      toast.success('Data refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id, {
        onSuccess: () => {
          setUserToDelete(null)
        },
      })
    }
  }

  const handleToggleStatus = (user: User) => {
    // Normalize to UPPERCASE for comparison
    const currentStatus = user.status.toUpperCase()
    const newStatus =
      currentStatus === USER_STATUS.ACTIVE
        ? USER_STATUS.INACTIVE
        : USER_STATUS.ACTIVE

    toggleStatus.mutate({ id: user.id, status: newStatus as any })
  }

  const users = data?.data || []
  const pagination = {
    total: data?.meta.total || 0,
    page: data?.meta.page || 1,
    limit: data?.meta.limit || 12,
    totalPages: data?.meta.total_pages || 1,
  }

  return (
    <AdminLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              Users
            </h1>
            <p className='text-muted-foreground'>
              Manage user accounts and permissions
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Refresh Button */}
            <Button
              variant='outline'
              size='default'
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className='gap-2 hover:bg-primary/10 transition-colors'
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing || isFetching ? 'animate-spin' : ''
                }`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Add User Button */}
            <Button
              onClick={() => navigate('/admin/users/add')}
              className='gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5'
            >
              <Plus className='h-4 w-4' />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <UserStatsCards stats={stats} isLoading={statsLoading} />

        {/* Filters */}
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Users Table */}
        <UsersTable
          users={users}
          isLoading={isLoading}
          isFetching={isFetching}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          sortBy={filters.sort_by}
          sortOrder={filters.sort_order}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={() => setUserToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user{' '}
                <strong>{userToDelete?.full_name}</strong>. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {deleteUser.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
