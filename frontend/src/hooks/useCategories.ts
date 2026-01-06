import { useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  categoryAPI,
  type Category,
  type CategoryTreeNode,
  type CategoryQueryParams,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type MoveCategoryRequest,
} from '@/api/category.api'

// QUERY KEYS
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryQueryParams) =>
    [...categoryKeys.lists(), filters] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
}

// QUERY HOOKS

/**
 * Get category tree (for product dropdown)
 */
export function useCategories() {
  const query = useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const response = await categoryAPI.getTreeStructure({
        include_inactive: false,
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories')
      }

      return response.data || []
    },
    select: (data) => {
      return data.sort((a, b) => a.display_order - b.display_order)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const getCategoryBySlug = useCallback(
    (slug: string): CategoryTreeNode | null => {
      if (!query.data?.length) return null

      const findCategory = (
        cats: CategoryTreeNode[],
        targetSlug: string
      ): CategoryTreeNode | null => {
        for (const cat of cats) {
          if (cat.slug === targetSlug) return cat
          if (cat.children.length > 0) {
            const found = findCategory(cat.children, targetSlug)
            if (found) return found
          }
        }
        return null
      }

      return findCategory(query.data, slug)
    },
    [query.data]
  )

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    getCategoryBySlug,
  }
}

/**
 * Get all categories (flat list for admin)
 */
export function useCategoriesList(params?: CategoryQueryParams) {
  const query = useQuery({
    queryKey: categoryKeys.list(params || {}),
    queryFn: async () => {
      const response = await categoryAPI.getAll(params)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories')
      }

      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    categories: query.data?.categories || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Get category statistics
 */
export function useCategoryStats() {
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: async () => {
      const response = await categoryAPI.getStats()

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch category stats')
      }

      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Get single category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await categoryAPI.getById(id)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch category')
      }

      return response.data
    },
    enabled: !!id,
  })
}

// MUTATION HOOKS

/**
 * Create new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryAPI.create(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Category created successfully')
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
      navigate('/admin/categories')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create category')
    },
  })
}

/**
 * Update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryAPI.update(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Category updated successfully')
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
      navigate('/admin/categories')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update category')
    },
  })
}

/**
 * Delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryAPI.delete(id),
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() })

      // Snapshot previous
      const previousCategories = queryClient.getQueriesData({
        queryKey: categoryKeys.lists(),
      })

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: categoryKeys.lists() },
        (old: any) => {
          if (!old?.categories) return old
          return {
            ...old,
            categories: old.categories.filter(
              (cat: Category) => cat.id !== deletedId
            ),
            total: old.total - 1,
          }
        }
      )

      return { previousCategories }
    },
    onError: (err, deletedId, context: any) => {
      // Rollback
      if (context?.previousCategories) {
        context.previousCategories.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Failed to delete category')
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
    },
  })
}

/**
 * Toggle category status
 */
export function useToggleCategoryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryAPI.toggleStatus(id),
    onMutate: async (toggledId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() })

      // Snapshot previous
      const previousCategories = queryClient.getQueriesData({
        queryKey: categoryKeys.lists(),
      })

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: categoryKeys.lists() },
        (old: any) => {
          if (!old?.categories) return old
          return {
            ...old,
            categories: old.categories.map((cat: Category) =>
              cat.id === toggledId ? { ...cat, is_active: !cat.is_active } : cat
            ),
          }
        }
      )

      return { previousCategories }
    },
    onError: (err, toggledId, context: any) => {
      // Rollback
      if (context?.previousCategories) {
        context.previousCategories.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Failed to toggle category status')
    },
    onSuccess: (response, id) => {
      toast.success(response.message || 'Category status updated successfully')
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
    },
  })
}

/**
 * Move category to different parent
 */
export function useMoveCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveCategoryRequest }) =>
      categoryAPI.move(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Category moved successfully')
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to move category')
    },
  })
}

export type { Category, CategoryTreeNode }
