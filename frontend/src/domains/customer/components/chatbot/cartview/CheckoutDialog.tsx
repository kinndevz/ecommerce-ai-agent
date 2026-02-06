import { useState } from 'react'
import { User, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_CONFIG,
} from '@/api/services/order.constants'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface OrderFormState {
  name: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
  country: string
  paymentMethod: string
  notes: string
}

interface CheckoutDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  totalItems: number
  subtotal: number
  onSubmitOrder: (data: any) => void
}

export const CheckoutDialog = ({
  isOpen,
  onOpenChange,
  totalItems,
  subtotal,
  onSubmitOrder,
}: CheckoutDialogProps) => {
  const [form, setForm] = useState<OrderFormState>({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    country: 'Vietnam',
    paymentMethod: PAYMENT_METHOD.COD,
    notes: '',
  })

  const handleChange = (key: keyof OrderFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const requiredFields = [
      form.name,
      form.phone,
      form.address,
      form.city,
      form.paymentMethod,
    ]

    if (requiredFields.some((value) => !value.trim())) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    const payload = {
      shipping_address: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        district: form.district.trim() || null,
        ward: form.ward.trim() || null,
        country: form.country.trim() || 'Vietnam',
      },
      payment_method: form.paymentMethod,
      notes: form.notes.trim() || null,
    }

    onSubmitOrder(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-125 p-0 gap-0 overflow-hidden w-full'>
        <DialogHeader className='p-6 pb-4 border-b bg-muted/20'>
          <DialogTitle className='text-xl font-bold'>
            Thông tin giao hàng
          </DialogTitle>
          <DialogDescription>
            Hoàn tất đơn hàng của bạn ({totalItems} sản phẩm).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh]'>
          <div className='p-6 space-y-6'>
            <div className='space-y-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
                <User className='w-3.5 h-3.5 text-primary' /> Liên hệ
              </h4>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Họ tên</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder='Nguyễn Văn A'
                    className='bg-muted/30'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Số điện thoại</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder='0901...'
                    className='bg-muted/30'
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
                <MapPin className='w-3.5 h-3.5 text-primary' /> Địa chỉ nhận
                hàng
              </h4>
              <div className='space-y-3'>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder='Số nhà, tên đường'
                  className='bg-muted/30'
                />
                <div className='grid grid-cols-2 gap-3'>
                  <Input
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder='Tỉnh/Thành phố'
                    className='bg-muted/30'
                  />
                  <Input
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder='Quận/Huyện'
                    className='bg-muted/30'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <Input
                    value={form.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                    placeholder='Phường/Xã'
                    className='bg-muted/30'
                  />
                  <Input
                    value={form.country}
                    disabled
                    className='bg-muted/50 opacity-70'
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
                <CreditCard className='w-3.5 h-3.5 text-primary' /> Thanh toán
              </h4>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) => handleChange('paymentMethod', value)}
              >
                <SelectTrigger className='bg-muted/30'>
                  <SelectValue placeholder='Chọn phương thức' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_CONFIG).map(
                    ([method, config]) => (
                      <SelectItem key={method} value={method}>
                        {config.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder='Ghi chú giao hàng...'
                className='bg-muted/30 min-h-15 resize-none w-full max-w-full break-all'
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='p-6 pt-4 border-t flex-row gap-3 bg-muted/20'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='flex-1'
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} className='flex-2 font-bold shadow-md'>
            Xác nhận • {formatCurrencyVnd(subtotal)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
