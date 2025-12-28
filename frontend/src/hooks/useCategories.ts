import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryAPI, type CategoryTreeNode } from '@/api/category.api'

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', 'tree'],
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const getCategoryBySlug = useCallback(
    (slug: string): CategoryTreeNode | null => {
      if (!categories.length) return null

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

      return findCategory(categories, slug)
    },
    [categories]
  )

  return {
    categories,
    isLoading,
    error,
    refetch,
    getCategoryBySlug,
  }
}
