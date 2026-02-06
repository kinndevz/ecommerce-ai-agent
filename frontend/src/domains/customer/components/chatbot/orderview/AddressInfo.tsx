import { MapPin } from 'lucide-react'
import type { OrderDetail } from '@/api/order.api'

interface AddressInfoProps {
  address: OrderDetail['shipping_address']
}

export const AddressInfo = ({ address }: AddressInfoProps) => {
  return (
    <div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2'>
      <div className='flex items-center gap-2 text-sm font-semibold'>
        <MapPin className='w-4 h-4 text-primary' />
        Shipping address
      </div>
      <p className='text-sm text-foreground'>
        {address.name} • {address.phone}
      </p>
      <p className='text-sm text-muted-foreground'>
        {address.address}, {address.ward ? `${address.ward}, ` : ''}
        {address.district ? `${address.district}, ` : ''}
        {address.city}
      </p>
    </div>
  )
}
