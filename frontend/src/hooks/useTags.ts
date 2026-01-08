import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  tagAPI,
  type TagCreateRequest,
  type TagUpdateRequest,
} from '@/api/tag.api'

// Query Keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  popular: (limit?: number) => [...tagKeys.all, 'popular', limit] as const,
  stats: () => [...tagKeys.all, 'stats'] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
  bySlug: (slug: string) => [...tagKeys.all, 'slug', slug] as const,
}

/**
 * Get all tags
 * Public endpoint
 */
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagAPI.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => ({
      tags: response.data.tags,
      total: response.data.total,
    }),
  })
}

/**
 * Get popular tags
 * Public endpoint
 */
export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: tagKeys.popular(limit),
    queryFn: () => tagAPI.getPopular(limit),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => ({
      tags: response.data.tags,
      total: response.data.total,
    }),
  })
}

/**
 * Get tag by ID
 * Public endpoint
 */
export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagAPI.getById(id),
    enabled: !!id,
    select: (response) => response.data,
  })
}

/**
 * Get tag by slug
 * Public endpoint
 */
export function useTagBySlug(slug: string) {
  return useQuery({
    queryKey: tagKeys.bySlug(slug),
    queryFn: () => tagAPI.getBySlug(slug),
    enabled: !!slug,
    select: (response) => response.data,
  })
}

/**
 * Get tag statistics
 * Admin only
 */
export function useTagStats() {
  return useQuery({
    queryKey: tagKeys.stats(),
    queryFn: () => tagAPI.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
  })
}

/**
 * Create new tag
 * Admin only
 */
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TagCreateRequest) => tagAPI.create(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Tag created successfully')
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create tag'
      )
    },
  })
}

/**
 * Update existing tag
 * Admin only
 */
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagUpdateRequest }) =>
      tagAPI.update(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Tag updated successfully')
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.stats() })
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update tag'
      )
    },
  })
}

/**
 * Delete tag
 * Admin only - Can only delete unused tags
 */
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tagAPI.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Tag deleted successfully')
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.stats() })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete tag'

      // Show different toast for constraint errors
      if (message.includes('used by') || message.includes('products')) {
        toast.error(message, { duration: 5000 })
      } else {
        toast.error(message)
      }
    },
  })
}

/**
 * Merge tags
 * Admin only - Merges source tag into target tag
 */
export function useMergeTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sourceTagId,
      targetTagId,
    }: {
      sourceTagId: string
      targetTagId: string
    }) => tagAPI.merge(sourceTagId, targetTagId),
    onSuccess: (response) => {
      toast.success(response.message || 'Tags merged successfully', {
        description: `${response.data.products_affected} products affected`,
        duration: 5000,
      })
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to merge tags'
      )
    },
  })
}
