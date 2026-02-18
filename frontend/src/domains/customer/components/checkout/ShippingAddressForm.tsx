import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { MapPin, User, Phone, Home, Building2, Map, Shield } from 'lucide-react'
import type { ShippingAddress } from '@/api/types/order.types'

const shippingAddressSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  ward: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(2, 'Vui lòng nhập tỉnh/thành phố'),
  country: z.string(),
})

type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>

interface ShippingAddressFormProps {
  onSubmit: (address: ShippingAddress) => void
  initialData: ShippingAddress | null
}

export function ShippingAddressForm({
  onSubmit,
  initialData,
}: ShippingAddressFormProps) {
  const form = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      ward: initialData?.ward ?? '',
      district: initialData?.district ?? '',
      city: initialData?.city ?? '',
      country: initialData?.country ?? 'Vietnam',
    },
  })

  const handleSubmit = (values: ShippingAddressFormValues) => {
    const addressData: ShippingAddress = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      ward: values.ward || null,
      district: values.district || null,
      city: values.city,
      country: values.country,
    }
    onSubmit(addressData)
  }

  return (
    <Card className='shadow-lg border-0 overflow-hidden'>
      <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

      <CardHeader className='border-b bg-linear-to-r from-card to-primary/5 pb-4 pt-5'>
        <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
          <div className='h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center'>
            <MapPin className='h-5 w-5 text-primary' />
          </div>
          <span>Thông tin giao hàng</span>
          <div className='ml-auto flex items-center gap-1.5 text-xs font-normal text-muted-foreground'>
            <Shield className='h-3.5 w-3.5' />
            <span>Bảo mật thông tin</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className='p-6'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-5'
          >
            {/* Name & Phone */}
            <div className='grid gap-5 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium flex items-center gap-1.5'>
                      Họ và tên <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                        <Input
                          placeholder='Nguyễn Văn A'
                          className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium flex items-center gap-1.5'>
                      Số điện thoại <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                        <Input
                          type='tel'
                          placeholder='0912345678'
                          className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium flex items-center gap-1.5'>
                    Địa chỉ <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <Home className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                      <Input
                        placeholder='Số nhà, tên đường'
                        className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Ward, District, City */}
            <div className='grid gap-5 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='ward'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Phường/Xã
                    </FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                        <Input
                          placeholder='Phường 1'
                          className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='district'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Quận/Huyện
                    </FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                        <Input
                          placeholder='Quận 1'
                          className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium flex items-center gap-1.5'>
                      Tỉnh/Thành phố <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <Map className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
                        <Input
                          placeholder='TP. Hồ Chí Minh'
                          className='pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className='pt-2'>
              <Button type='submit' className='w-full sm:w-auto h-11 px-8'>
                Tiếp tục
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
