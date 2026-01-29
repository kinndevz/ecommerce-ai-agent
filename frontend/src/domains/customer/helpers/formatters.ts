import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { isValid, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'

export const formatCurrencyVnd = (value: number) =>
  currencyFormatter.format(value)

const formatInVietnamTime = (value: string | Date, pattern: string) => {
  const input =
    value instanceof Date ? value : value?.trim?.().replace(' ', 'T')
  if (!input) return String(value)

  const hasOffset =
    typeof input === 'string' && /([zZ]|[+-]\d{2}:?\d{2})$/.test(input)
  const date =
    typeof input === 'string' && !hasOffset
      ? fromZonedTime(input, 'UTC')
      : parseISO(String(input))

  if (!isValid(date)) return String(value)
  return formatInTimeZone(date, VIETNAM_TIMEZONE, pattern, { locale: vi })
}

export const calculateDiscount = (original: number, sale: number) => {
  if (!original || !sale) return 0
  return Math.round(((original - sale) / original) * 100)
}

export const formatShortDate = (value: string | Date) =>
  formatInVietnamTime(value, 'dd MMM yyyy')

export const formatShortTime = (value: string | Date) =>
  formatInVietnamTime(value, 'HH:mm')

export const formatWeekdayTime = (value: string | Date) =>
  formatInVietnamTime(value, 'EEEE HH:mm')
