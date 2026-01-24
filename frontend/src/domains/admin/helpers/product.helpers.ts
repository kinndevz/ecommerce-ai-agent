import type { CategoryTreeNode } from '@/api/category.api'
import type { ProductImageData, ProductVariantData } from '@/api/product.api'

export interface CategoryOption {
  id: string
  name: string
  level: number
}

export const generateProductSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const generateProductSku = () => {
  const prefix = 'PRD'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export const formatVndPrice = (price: number) => {
  const formattedNumber = new Intl.NumberFormat('vi-VN').format(price)
  return `${formattedNumber} đ`
}

export const formatUsdPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)

export const formatProductDate = (value: string) =>
  new Date(value).toLocaleDateString()

export const getStockTextClass = (stock: number) => {
  if (stock > 10) return 'text-green-600'
  if (stock > 0) return 'text-amber-600'
  return 'text-red-600'
}

export const getAvailabilityBadgeClass = (isAvailable: boolean) =>
  isAvailable
    ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
    : 'border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'

export const flattenCategoryOptions = (
  categories: CategoryTreeNode[],
  level = 0
): CategoryOption[] => {
  const result: CategoryOption[] = []
  categories.forEach((cat) => {
    result.push({ id: cat.id, name: cat.name, level })
    if (cat.children?.length) {
      result.push(...flattenCategoryOptions(cat.children, level + 1))
    }
  })
  return result
}

export const sortProductImages = (images: ProductImageData[] = []) =>
  [...images].sort((a, b) => a.display_order - b.display_order)

export const getUniqueVariantColors = (variants: ProductVariantData[] = []) => {
  const map = new Map<string, ProductVariantData>()
  variants.forEach((variant) => {
    if (variant.shade_name && !map.has(variant.shade_name)) {
      map.set(variant.shade_name, variant)
    }
  })
  return Array.from(map.values())
}

export const getUniqueVariantSizes = (variants: ProductVariantData[] = []) => {
  const map = new Map<string, ProductVariantData & { label: string }>()
  variants.forEach((variant) => {
    const label =
      variant.size && variant.size_unit
        ? `${variant.size}${variant.size_unit}`
        : variant.name
    if (!map.has(label)) {
      map.set(label, { ...variant, label })
    }
  })
  return Array.from(map.values())
}
