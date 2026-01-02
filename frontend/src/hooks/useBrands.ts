import { useQuery } from '@tanstack/react-query'
import { brandAPI, type Brand } from '@/api/brand.api'

export const useBrands = () => {
  const {
    data: brands = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: async () => {
      const response = await brandAPI.getAll({
        include_inactive: false,
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch brands')
      }

      return response.data.brands || []
    },
    select: (data) => {
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const getBrandById = (id: string): Brand | null => {
    return brands.find((brand) => brand.id === id) || null
  }

  const getBrandBySlug = (slug: string): Brand | null => {
    return brands.find((brand) => brand.slug === slug) || null
  }

  return {
    brands,
    isLoading,
    error,
    refetch,
    getBrandById,
    getBrandBySlug,
  }
}
