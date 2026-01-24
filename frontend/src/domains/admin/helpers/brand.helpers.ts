export const BRAND_COUNTRIES = [
  'France',
  'USA',
  'South Korea',
  'Japan',
  'Germany',
  'UK',
  'Italy',
  'Canada',
  'Australia',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Thailand',
  'Vietnam',
]

export const generateBrandSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const getBrandStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'bg-green-500/10 text-green-600 border-green-500/20'
    : 'bg-gray-500/10 text-gray-600 border-gray-500/20'

export const formatBrandDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
