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
} from '@/api/product.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductQueryParams) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
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
