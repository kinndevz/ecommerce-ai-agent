import type { ProductData } from '@/api/chat.api'
import type { ProductDetail, ProductImageData, ProductVariantData } from '@/api/product.api'

export interface DisplayProduct {
  id: string
  name: string
  brandName: string
  categoryName: string
  description?: string | null
  price: number
  salePrice?: number | null
  rating: number
  reviewCount?: number
  stockQuantity: number
  isAvailable: boolean
  imageUrl?: string | null
  images: ProductImageData[]
  tags: string[]
  variants: ProductVariantData[]
}

const getPrimaryImage = (detail?: ProductDetail | null) =>
  detail?.images?.find((img) => img.is_primary)?.image_url ||
  detail?.images?.[0]?.image_url ||
  null

const sortImages = (images: ProductImageData[]) =>
  [...images].sort((a, b) => a.display_order - b.display_order)

const buildImageGallery = (
  detail?: ProductDetail | null,
  preview?: ProductData | null
) => {
  if (detail?.images?.length) {
    return sortImages(detail.images)
  }

  if (preview?.product_image) {
    return [
      {
        id: preview.id,
        image_url: preview.product_image,
        alt_text: preview.name,
        is_primary: true,
        display_order: 0,
      },
    ]
  }

  return []
}

export const buildDisplayProduct = (
  detail?: ProductDetail | null,
  preview?: ProductData | null
): DisplayProduct | null => {
  if (!detail && !preview) return null

  return {
    id: detail?.id || preview?.id || '',
    name: detail?.name || preview?.name || 'Unnamed product',
    brandName: detail?.brand?.name || preview?.brand_name || 'Unknown brand',
    categoryName:
      detail?.category?.name || preview?.category_name || 'Uncategorized',
    description: detail?.description || preview?.description || '',
    price: detail?.price ?? preview?.price ?? 0,
    salePrice: detail?.sale_price ?? null,
    rating: detail?.rating_average ?? preview?.rating_average ?? 0,
    reviewCount: detail?.review_count,
    stockQuantity: detail?.stock_quantity ?? preview?.stock_quantity ?? 0,
    isAvailable: detail?.is_available ?? preview?.is_available ?? false,
    imageUrl: getPrimaryImage(detail) || preview?.product_image || null,
    images: buildImageGallery(detail, preview),
    tags:
      detail?.tags?.map((tag) => tag.name) ||
      preview?.tags?.filter(Boolean) ||
      [],
    variants: detail?.variants || [],
  }
}
