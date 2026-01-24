import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from '@/api/services/order.constants'
import type { OrderStatusType } from '@/api/services/order.constants'

interface OrderStatusSelectorProps {
  value: OrderStatusType | null
  onChange: (value: OrderStatusType) => void
}

export function OrderStatusSelector({ value, onChange }: OrderStatusSelectorProps) {
  return (
    <div className='space-y-3'>
      <div className='text-sm font-medium text-muted-foreground'>
        Select New Status
      </div>
      <Select value={value || undefined} onValueChange={(next) => onChange(next as OrderStatusType)}>
        <SelectTrigger className='h-11'>
          <SelectValue placeholder='Choose a status...' />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ORDER_STATUS).map(([_, status]) => (
            <SelectItem key={status} value={status}>
              <div className='flex items-center gap-2'>
                <div
                  className={`h-2 w-2 rounded-full ${
                    ORDER_STATUS_CONFIG[status]?.className.split(' ')[0]
                  }`}
                />
                <span className='text-sm font-medium'>
                  {ORDER_STATUS_CONFIG[status]?.label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
