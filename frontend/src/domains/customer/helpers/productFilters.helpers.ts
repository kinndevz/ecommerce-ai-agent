import { SkinType, SkinConcern, ProductBenefit } from '@/api/services/enums'
import type { SearchQueryParams } from '@/api/product.api'

export interface FilterOption {
  label: string
  value: string
}

// Filter Options
export const SKIN_TYPE_OPTIONS: FilterOption[] = [
  { label: 'Da dầu', value: SkinType.OILY },
  { label: 'Da khô', value: SkinType.DRY },
  { label: 'Da hỗn hợp', value: SkinType.COMBINATION },
  { label: 'Da nhạy cảm', value: SkinType.SENSITIVE },
  { label: 'Da thường', value: SkinType.NORMAL },
]

export const SKIN_CONCERN_OPTIONS: FilterOption[] = [
  { label: 'Mụn', value: SkinConcern.ACNE },
  { label: 'Mụn đầu đen', value: SkinConcern.BLACKHEADS },
  { label: 'Lỗ chân lông to', value: SkinConcern.PORES },
  { label: 'Đổ dầu nhiều', value: SkinConcern.SEBUM_CONTROL },
  { label: 'Nếp nhăn', value: SkinConcern.WRINKLES },
  { label: 'Lão hóa', value: SkinConcern.AGING },
  { label: 'Thâm nám', value: SkinConcern.DARK_SPOTS },
  { label: 'Da không đều màu', value: SkinConcern.UNEVEN_TONE },
  { label: 'Da xỉn màu', value: SkinConcern.DULLNESS },
  { label: 'Khô da', value: SkinConcern.DRYNESS },
  { label: 'Mất nước', value: SkinConcern.DEHYDRATION },
  { label: 'Kích ứng', value: SkinConcern.IRRITATION },
  { label: 'Mẩn đỏ', value: SkinConcern.REDNESS },
  { label: 'Tổn thương màng bảo vệ', value: SkinConcern.BARRIER_REPAIR },
  { label: 'Quầng thâm mắt', value: SkinConcern.EYE_CARE },
  { label: 'Chống nắng', value: SkinConcern.SUN_PROTECTION },
]

export const PRODUCT_BENEFIT_OPTIONS: FilterOption[] = [
  { label: 'Dưỡng ẩm', value: ProductBenefit.MOISTURIZING },
  { label: 'Cấp nước', value: ProductBenefit.HYDRATING },
  { label: 'Nuôi dưỡng sâu', value: ProductBenefit.NOURISHING },
  { label: 'Dưỡng trắng', value: ProductBenefit.BRIGHTENING },
  { label: 'Chống lão hóa', value: ProductBenefit.ANTI_AGING },
  { label: 'Trị mụn', value: ProductBenefit.ANTI_ACNE },
  { label: 'Tẩy tế bào chết', value: ProductBenefit.EXFOLIATING },
  { label: 'Săn chắc da', value: ProductBenefit.FIRMING },
  { label: 'Thu nhỏ lỗ chân lông', value: ProductBenefit.PORE_MINIMIZING },
  { label: 'Kiềm dầu', value: ProductBenefit.OIL_CONTROL },
  { label: 'Cải thiện bề mặt da', value: ProductBenefit.UNEVEN_TEXTURE },
  { label: 'Làm dịu da', value: ProductBenefit.SOOTHING },
  { label: 'Bảo vệ da', value: ProductBenefit.PROTECTIVE },
  { label: 'Phục hồi da', value: ProductBenefit.RECOVERY },
  { label: 'Nâng tông', value: ProductBenefit.TONE_UP },
]

// Helper Functions
export const getFilterLabel = (
  key: keyof SearchQueryParams,
  value: string
): string => {
  const allOptions = [
    ...SKIN_TYPE_OPTIONS,
    ...SKIN_CONCERN_OPTIONS,
    ...PRODUCT_BENEFIT_OPTIONS,
  ]
  const found = allOptions.find((opt) => opt.value === value)
  return found ? found.label : value
}

export const flattenCategories = (cats: any[], level = 0): any[] => {
  let result: any[] = []
  for (const cat of cats) {
    result.push({ ...cat, level })
    if (cat.children?.length > 0) {
      result = [...result, ...flattenCategories(cat.children, level + 1)]
    }
  }
  return result
}

export const countActiveFilters = (filters: SearchQueryParams): number => {
  let count = 0
  if (filters.skin_types?.length) count++
  if (filters.concerns?.length) count++
  if (filters.benefits?.length) count++
  if (filters.min_price || filters.max_price) count++
  if (filters.is_available) count++
  if (filters.brand) count++
  if (filters.category) count++
  return count
}
