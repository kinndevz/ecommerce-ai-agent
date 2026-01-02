import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'
import {
  userAPI,
  type UserQueryParams,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/api/user.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { UserStatus } from '@/api/services/constants'

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserQueryParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
}

// Get all users with filters
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => userAPI.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get user stats
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const response = await userAPI.getStats()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user stats')
      }
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

// Get single user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userAPI.getById(id),
    enabled: !!id,
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userAPI.create(data),
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
      navigate('/admin/users')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create user')
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userAPI.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
      navigate('/admin/users')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user')
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userAPI.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user')
    },
  })
}

// Toggle user status mutation
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      userAPI.toggleStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success('User status updated successfully')
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update user status'
      )
    },
  })
}
