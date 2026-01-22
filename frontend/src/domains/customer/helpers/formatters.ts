const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export const formatCurrencyVnd = (value: number) => currencyFormatter.format(value)

export const formatShortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })

export const formatShortTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
