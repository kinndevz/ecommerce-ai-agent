import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  brandAPI,
  type Brand,
  type BrandQueryParams,
  type CreateBrandRequest,
  type UpdateBrandRequest,
} from '@/api/brand.api'

// QUERY KEYS
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters: BrandQueryParams) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
  stats: () => [...brandKeys.all, 'stats'] as const,
}

// QUERY HOOKS

/**
 * Get all brands with optional filters
 * Returns flat array of brands for easy use in components
 */
export function useBrands(params?: BrandQueryParams) {
  const query = useQuery({
    queryKey: brandKeys.list(params || {}),
    queryFn: async () => {
      const response = await brandAPI.getAll(params)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch brands')
      }

      return response.data
    },
    select: (data) => {
      // Sort brands alphabetically by name
      const sortedBrands = [...data.brands].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      return {
        ...data,
        brands: sortedBrands,
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Return flat structure for backward compatibility
  return {
    brands: query.data?.brands || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Get brand statistics
 */
export function useBrandStats() {
  return useQuery({
    queryKey: brandKeys.stats(),
    queryFn: async () => {
      const response = await brandAPI.getStats()

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch brand stats')
      }

      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Get single brand by ID
 */
export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: async () => {
      const response = await brandAPI.getById(id)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch brand')
      }

      return response.data
    },
    enabled: !!id,
  })
}

// MUTATION HOOKS

/**
 * Create new brand mutation
 */
export function useCreateBrand() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandAPI.create(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Brand created successfully')
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandKeys.stats() })
      navigate('/admin/brands')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create brand')
    },
  })
}

/**
 * Update brand mutation
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      brandAPI.update(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Brand updated successfully')
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: brandKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: brandKeys.stats() })
      navigate('/admin/brands')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update brand')
    },
  })
}

/**
 * Delete brand mutation
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => brandAPI.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Brand deleted successfully')
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete brand')
    },
  })
}

/**
 * Toggle brand status mutation
 */
export function useToggleBrandStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => brandAPI.toggleStatus(id),
    onSuccess: (response, id) => {
      toast.success(response.message || 'Brand status updated successfully')
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: brandKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update brand status'
      )
    },
  })
}

//  HELPER FUNCTIONS

/**
 * Hook with helper functions to get brands from cache
 */
export function useBrandsHelpers() {
  const { brands } = useBrands({ include_inactive: false })

  const getBrandById = (id: string): Brand | null => {
    return brands.find((brand) => brand.id === id) || null
  }

  const getBrandBySlug = (slug: string): Brand | null => {
    return brands.find((brand) => brand.slug === slug) || null
  }

  return {
    brands,
    getBrandById,
    getBrandBySlug,
  }
}
