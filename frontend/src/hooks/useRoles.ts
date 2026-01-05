import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'
import {
  roleAPI,
  type RoleQueryParams,
  type RoleCreateRequest,
  type RoleUpdateRequest,
  type AssignPermissionsRequest,
  type RemovePermissionsRequest,
} from '@/api/role.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// QUERY KEYS
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: RoleQueryParams) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  stats: () => [...roleKeys.all, 'stats'] as const,
  active: () => [...roleKeys.all, 'active'] as const,
}

// QUERY HOOKS

/**
 * Get all roles with filters
 */
export function useRoles(params?: RoleQueryParams) {
  return useQuery({
    queryKey: roleKeys.list(params || {}),
    queryFn: () => roleAPI.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get active roles only (for dropdowns)
 */
export function useActiveRoles() {
  return useQuery({
    queryKey: roleKeys.active(),
    queryFn: () => roleAPI.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
  })
}

/**
 * Get role statistics
 */
export function useRoleStats() {
  return useQuery({
    queryKey: roleKeys.stats(),
    queryFn: async () => {
      const response = await roleAPI.getStats()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch role stats')
      }
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Get single role by ID
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleAPI.getById(id),
    enabled: !!id,
  })
}

// MUTATION HOOKS

/**
 * Create role mutation
 */
export function useCreateRole() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RoleCreateRequest) => roleAPI.create(data),
    onSuccess: () => {
      toast.success('Role created successfully')
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: roleKeys.active() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role')
    },
  })
}

/**
 * Update role mutation
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateRequest }) =>
      roleAPI.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Role updated successfully')
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: roleKeys.active() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role')
    },
  })
}

/**
 * Delete role mutation
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roleAPI.delete(id),
    onSuccess: () => {
      toast.success('Role deleted successfully')
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: roleKeys.active() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role')
    },
  })
}

/**
 * Assign permissions to role
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: string
      permissions: AssignPermissionsRequest
    }) => roleAPI.assignPermissions(id, permissions),
    onSuccess: (_, variables) => {
      toast.success('Permissions assigned successfully')
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to assign permissions'
      )
    },
  })
}

/**
 * Remove permissions from role
 */
export function useRemovePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: string
      permissions: RemovePermissionsRequest
    }) => roleAPI.removePermissions(id, permissions),
    onSuccess: (_, variables) => {
      toast.success('Permissions removed successfully')
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to remove permissions'
      )
    },
  })
}
