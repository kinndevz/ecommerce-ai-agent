import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryAPI, type CategoryTreeNode } from '@/api/category.api'

export const useCategories = () => {
  // Sử dụng useQuery thay thế cho useState + useEffect
  const {
    data: categories = [], // Mặc định là mảng rỗng nếu chưa load xong
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', 'tree'], // Key định danh để Cache
    queryFn: async () => {
      const response = await categoryAPI.getTreeStructure({
        include_inactive: false,
      })

      // React Query tự ném error nếu Promise reject,
      // nhưng nếu API trả về success: false mà HTTP 200, ta cần check thủ công
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories')
      }

      return response.data || []
    },
    // Tính năng Select: Biến đổi dữ liệu sau khi fetch xong (Sort)
    select: (data) => {
      return data.sort((a, b) => a.display_order - b.display_order)
    },
    staleTime: 5 * 60 * 1000, // 5 phút sau mới coi dữ liệu là cũ (không gọi lại API khi re-render)
    refetchOnWindowFocus: false, // Không fetch lại khi tab focus (tùy chọn)
  })

  // Helper function để tìm category theo slug (Đệ quy)
  // Dùng useCallback để tránh tạo lại hàm không cần thiết
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
