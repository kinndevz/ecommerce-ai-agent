import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import {
  useRoles,
  useRoleStats,
  roleKeys,
  useDeleteRole,
} from '@/hooks/useRoles'
import { usePermissions, permissionKeys } from '@/hooks/usePermissions'
import { RolesTable } from '@/admin/components/roles/RolesTable'
import { PermissionsTable } from '@/admin/components/roles/PermissionsTable'
import { RoleFilters } from '@/admin/components/roles/RoleFilters'
import { PermissionFilters } from '@/admin/components/roles/PermissionFilters'
import AdminLayout from '@/admin/components/layout/AdminLayout'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { RoleQueryParams } from '@/api/role.api'
import type { PermissionQueryParams } from '@/api/permission.api'
import type { RoleDetailData } from '@/api/role.api'
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
import { Shield, Lock } from 'lucide-react'

interface RoleFilters extends RoleQueryParams {
  sort_by?: 'name' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

interface PermissionFilters extends PermissionQueryParams {
  sort_by?: 'name' | 'path' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export default function RolesPermissionsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleDetailData | null>(null)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')

  // Roles state
  const [roleFilters, setRoleFilters] = useState<RoleFilters>({
    page: 1,
    limit: 12,
    include_permissions: true,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  // Permissions state
  const [permissionFilters, setPermissionFilters] = useState<PermissionFilters>(
    {
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
    }
  )

  // Roles queries
  const {
    data: rolesData,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
  } = useRoles(roleFilters)
  const { data: roleStats, isLoading: statsLoading } = useRoleStats()

  // Permissions queries
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isFetching: permissionsFetching,
  } = usePermissions(permissionFilters)

  // Mutations
  const deleteRole = useDeleteRole()

  const handleRolePageChange = (page: number) => {
    setRoleFilters((prev) => ({ ...prev, page }))
  }

  const handleRoleFilterChange = (newFilters: RoleQueryParams) => {
    setRoleFilters({ ...newFilters, page: 1, include_permissions: true })
  }

  const handleRoleClearFilters = () => {
    setRoleFilters({
      page: 1,
      limit: 12,
      include_permissions: true,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const handleRoleSort = (sortBy: 'name' | 'created_at') => {
    setRoleFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order:
        prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const handlePermissionPageChange = (page: number) => {
    setPermissionFilters((prev) => ({ ...prev, page }))
  }

  const handlePermissionFilterChange = (newFilters: PermissionQueryParams) => {
    setPermissionFilters({ ...newFilters, page: 1 })
  }

  const handlePermissionClearFilters = () => {
    setPermissionFilters({
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const handlePermissionSort = (sortBy: 'name' | 'path' | 'created_at') => {
    setPermissionFilters((prev) => ({
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
        queryClient.invalidateQueries({ queryKey: roleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: roleKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: permissionKeys.lists() }),
      ])
      toast.success('Data refreshed successfully!')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteRole = (role: RoleDetailData) => {
    setRoleToDelete(role)
  }

  const confirmDelete = () => {
    if (!roleToDelete) return

    deleteRole.mutate(roleToDelete.id, {
      onSuccess: () => {
        setRoleToDelete(null)
      },
    })
  }

  const roles = (rolesData?.data as RoleDetailData[]) || []
  const rolesMeta = rolesData?.meta
  const permissions = permissionsData?.data || []
  const permissionsMeta = permissionsData?.meta

  // Extract unique modules from permissions for filter
  const availableModules = Array.from(
    new Set(permissions.map((p) => p.module))
  ).sort()

  return (
    <AdminLayout>
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Shield className='w-7 h-7 text-primary' />
              </div>
              Roles & Permissions
            </h1>
            <p className='text-muted-foreground'>
              Manage user roles and access permissions
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            {activeTab === 'roles' && (
              <Button onClick={() => navigate('/admin/roles/add')}>
                <Plus className='h-4 w-4 mr-2' />
                Add Role
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Only show for roles */}
        {activeTab === 'roles' && roleStats && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 border rounded-lg bg-card'>
              <div className='text-sm text-muted-foreground'>Total Roles</div>
              <div className='text-2xl font-bold'>{roleStats?.total_roles}</div>
            </div>
            <div className='p-4 border rounded-lg bg-card'>
              <div className='text-sm text-muted-foreground'>Active Roles</div>
              <div className='text-2xl font-bold text-green-600'>
                {roleStats?.active_roles}
              </div>
            </div>
            <div className='p-4 border rounded-lg bg-card'>
              <div className='text-sm text-muted-foreground'>
                Inactive Roles
              </div>
              <div className='text-2xl font-bold text-gray-600'>
                {roleStats?.inactive_roles}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value='roles' className='gap-2'>
              <Shield className='w-4 h-4' />
              Roles
            </TabsTrigger>
            <TabsTrigger value='permissions' className='gap-2'>
              <Lock className='w-4 h-4' />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value='roles' className='mt-6 space-y-4'>
            <RoleFilters
              filters={roleFilters}
              onFilterChange={handleRoleFilterChange}
              onClearFilters={handleRoleClearFilters}
            />
            <RolesTable
              roles={roles}
              isLoading={rolesLoading}
              isFetching={rolesFetching}
              page={roleFilters.page || 1}
              totalPages={rolesMeta?.total_pages || 1}
              total={rolesMeta?.total || 0}
              sortBy={roleFilters.sort_by}
              sortOrder={roleFilters.sort_order}
              onPageChange={handleRolePageChange}
              onSort={handleRoleSort}
              onDelete={handleDeleteRole}
            />
          </TabsContent>

          <TabsContent value='permissions' className='mt-6 space-y-4'>
            <PermissionFilters
              filters={permissionFilters}
              onFilterChange={handlePermissionFilterChange}
              onClearFilters={handlePermissionClearFilters}
              availableModules={availableModules}
            />
            <PermissionsTable
              permissions={permissions}
              isLoading={permissionsLoading}
              isFetching={permissionsFetching}
              page={permissionFilters.page || 1}
              totalPages={permissionsMeta?.total_pages || 1}
              total={permissionsMeta?.total || 0}
              sortBy={permissionFilters.sort_by}
              sortOrder={permissionFilters.sort_order}
              onPageChange={handlePermissionPageChange}
              onSort={handlePermissionSort}
            />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!roleToDelete}
          onOpenChange={() => setRoleToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the role "{roleToDelete?.name}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className='bg-destructive hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
