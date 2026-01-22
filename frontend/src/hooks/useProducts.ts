import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'
import {
  productAPI,
  type CreateProductRequest,
  type UpdateProductRequest,
  type ProductQueryParams,
  type SearchQueryParams,
} from '@/api/product.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductQueryParams) =>
    [...productKeys.lists(), filters] as const,
  search: (filters: SearchQueryParams) =>
    [...productKeys.all, 'search', filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  variants: (productId: string) =>
    [...productKeys.detail(productId), 'variants'] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
  discovery: () => [...productKeys.all, 'discovery'] as const,
  featured: (limit: number) =>
    [...productKeys.discovery(), 'featured', limit] as const,
  trending: (days: number, limit: number) =>
    [...productKeys.discovery(), 'trending', { days, limit }] as const,
  newArrivals: (days: number, limit: number) =>
    [...productKeys.discovery(), 'new-arrivals', { days, limit }] as const,
  onSale: (limit: number) =>
    [...productKeys.discovery(), 'on-sale', limit] as const,
  byBrand: (brandSlug: string, page: number, limit: number) =>
    [...productKeys.discovery(), 'by-brand', brandSlug, page, limit] as const,
  byCategory: (categorySlug: string, page: number, limit: number) =>
    [...productKeys.discovery(), 'by-category', categorySlug, page, limit] as const,
  related: (productId: string, limit: number) =>
    [...productKeys.discovery(), 'related', productId, limit] as const,
  inventory: () => [...productKeys.all, 'inventory'] as const,
  lowStock: (threshold: number) =>
    [...productKeys.inventory(), 'low-stock', threshold] as const,
  outOfStock: () => [...productKeys.inventory(), 'out-of-stock'] as const,
}

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => productAPI.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productAPI.getStats(),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productAPI.getById(id),
    enabled: !!id,
  })
}

export function useSearchProducts(params?: SearchQueryParams) {
  return useQuery({
    queryKey: productKeys.search(params || {}),
    queryFn: () => productAPI.search(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useFeaturedProducts(limit: number = 10) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productAPI.getFeatured(limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useTrendingProducts(days: number = 7, limit: number = 10) {
  return useQuery({
    queryKey: productKeys.trending(days, limit),
    queryFn: () => productAPI.getTrending(days, limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useNewArrivalsProducts(days: number = 30, limit: number = 10) {
  return useQuery({
    queryKey: productKeys.newArrivals(days, limit),
    queryFn: () => productAPI.getNewArrivals(days, limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useOnSaleProducts(limit: number = 20) {
  return useQuery({
    queryKey: productKeys.onSale(limit),
    queryFn: () => productAPI.getOnSale(limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useProductsByBrand(
  brandSlug: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: productKeys.byBrand(brandSlug, page, limit),
    queryFn: () => productAPI.getByBrand(brandSlug, page, limit),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!brandSlug,
  })
}

export function useProductsByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: productKeys.byCategory(categorySlug, page, limit),
    queryFn: () => productAPI.getByCategory(categorySlug, page, limit),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!categorySlug,
  })
}

export function useRelatedProducts(productId: string, limit: number = 5) {
  return useQuery({
    queryKey: productKeys.related(productId, limit),
    queryFn: () => productAPI.getRelated(productId, limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    enabled: !!productId,
  })
}

export function useLowStockProducts(threshold: number = 10) {
  return useQuery({
    queryKey: productKeys.lowStock(threshold),
    queryFn: () => productAPI.getLowStock(threshold),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useOutOfStockProducts() {
  return useQuery({
    queryKey: productKeys.outOfStock(),
    queryFn: () => productAPI.getOutOfStock(),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => productAPI.getVariants(productId),
    enabled: !!productId,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productAPI.create(data),
    onSuccess: () => {
      toast.success('Product created successfully')
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      navigate('/admin/products')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productAPI.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      })
      navigate('/admin/products')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => productAPI.delete(id),
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      navigate('/admin/products')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product')
    },
  })
}

// ===== IMAGE MUTATIONS =====

export function useAddProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      imageData,
    }: {
      productId: string
      imageData: any
    }) => productAPI.addImage(productId, imageData),
    onSuccess: (_, variables) => {
      toast.success('Image added successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add image')
    },
  })
}

export function useUpdateProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
      imageData,
    }: {
      productId: string
      imageId: string
      imageData: any
    }) => productAPI.updateImage(productId, imageId, imageData),
    onSuccess: (_, variables) => {
      toast.success('Image updated successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update image')
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string
      imageId: string
    }) => productAPI.deleteImage(productId, imageId),
    onSuccess: (_, variables) => {
      toast.success('Image deleted successfully')
      // Invalidate both detail and list queries
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      })
      // Also refetch immediately
      queryClient.refetchQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete image')
    },
  })
}

// ===== VARIANT MUTATIONS =====

export function useAddProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      variantData,
    }: {
      productId: string
      variantData: any
    }) => productAPI.addVariant(productId, variantData),
    onSuccess: (_, variables) => {
      toast.success('Variant added successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add variant')
    },
  })
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      variantData,
    }: {
      productId: string
      variantId: string
      variantData: any
    }) => productAPI.updateVariant(productId, variantId, variantData),
    onSuccess: (_, variables) => {
      toast.success('Variant updated successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update variant')
    },
  })
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string
      variantId: string
    }) => productAPI.deleteVariant(productId, variantId),
    onSuccess: (_, variables) => {
      toast.success('Variant deleted successfully')
      // Invalidate both detail and list queries
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      })
      // Also refetch immediately
      queryClient.refetchQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete variant')
    },
  })
}

// ===== TAG MUTATIONS =====

export function useAddProductTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      tagIds,
    }: {
      productId: string
      tagIds: string[]
    }) => productAPI.addTags(productId, tagIds),
    onSuccess: (_, variables) => {
      toast.success('Tags added successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add tags')
    },
  })
}

export function useRemoveProductTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, tagId }: { productId: string; tagId: string }) =>
      productAPI.removeTag(productId, tagId),
    onSuccess: (_, variables) => {
      toast.success('Tag removed successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove tag')
    },
  })
}

// ===== STOCK & TOGGLES =====

export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => productAPI.updateStock(productId, quantity),
    onSuccess: (_, variables) => {
      toast.success('Stock updated successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stock')
    },
  })
}

export function useToggleProductAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productAPI.toggleAvailability(productId),
    onSuccess: (_, productId) => {
      toast.success('Availability toggled successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to toggle availability'
      )
    },
  })
}

export function useToggleProductFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productAPI.toggleFeatured(productId),
    onSuccess: (_, productId) => {
      toast.success('Featured status toggled successfully')
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to toggle featured status'
      )
    },
  })
}
