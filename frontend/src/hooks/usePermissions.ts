import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'
import {
  permissionAPI,
  type PermissionQueryParams,
  type PermissionCreateRequest,
  type PermissionUpdateRequest,
} from '@/api/permission.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// QUERY KEYS
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (filters: PermissionQueryParams) =>
    [...permissionKeys.lists(), filters] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionKeys.details(), id] as const,
  grouped: () => [...permissionKeys.all, 'grouped'] as const,
}

// QUERY HOOKS

/**
 * Get all permissions with filters
 */
export function usePermissions(params?: PermissionQueryParams) {
  return useQuery({
    queryKey: permissionKeys.list(params || {}),
    queryFn: () => permissionAPI.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute - permissions don't change often
  })
}

/**
 * Get permissions grouped by module
 */
export function usePermissionsByModule() {
  return useQuery({
    queryKey: permissionKeys.grouped(),
    queryFn: () => permissionAPI.getGroupedByModule(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single permission by ID
 */
export function usePermission(id: string) {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: () => permissionAPI.getById(id),
    enabled: !!id,
  })
}

// MUTATION HOOKS

/**
 * Create permission mutation
 * Note: Usually permissions are auto-synced, manual creation is rare
 */
export function useCreatePermission() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: PermissionCreateRequest) => permissionAPI.create(data),
    onSuccess: () => {
      toast.success('Permission created successfully')
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: permissionKeys.grouped() })
      navigate('/admin/permissions')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create permission'
      )
    },
  })
}

/**
 * Update permission mutation
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PermissionUpdateRequest }) =>
      permissionAPI.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Permission updated successfully')
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: permissionKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: permissionKeys.grouped() })
      navigate('/admin/permissions')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update permission'
      )
    },
  })
}

/**
 * Delete permission mutation
 */
export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => permissionAPI.delete(id),
    onSuccess: () => {
      toast.success('Permission deleted successfully')
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: permissionKeys.grouped() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete permission'
      )
    },
  })
}
