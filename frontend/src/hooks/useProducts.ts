import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query'
import {
  productAPI,
  type CreateProductRequest,
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
