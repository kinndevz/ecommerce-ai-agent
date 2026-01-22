import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  UserPlus,
  Home,
  ChevronRight,
  Loader2,
  Mail,
  User,
  Phone,
  Lock,
  Shield,
  BadgeCheck,
  CheckCircle2,
  Ban,
  AlertCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Card } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { useCreateUser } from '@/hooks/useUsers'
import type { CreateUserRequest } from '@/api/user.api'
import { AvatarUploadSection } from '@/domains/admin/components/users/AvatarUploadSection'
import {
  USER_ROLE,
  USER_ROLE_CONFIG,
  USER_STATUS,
  USER_STATUS_CONFIG,
} from '@/api/services/user.constants'
import type { UserStatus } from '@/api/services/constants'
import { Badge } from '@/shared/components/ui/badge'

const userFormSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional().nullable(),
  avatar: z.url().optional().nullable(),
  role_id: z.string().min(1, 'Role is required'),
  status: z.enum([
    USER_STATUS.ACTIVE,
    USER_STATUS.INACTIVE,
    USER_STATUS.SUSPENDED,
  ]),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function AddUserUI() {
  const navigate = useNavigate()
  const createUser = useCreateUser()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone_number: null,
      avatar: null,
      role_id: '',
      status: USER_STATUS.ACTIVE,
    },
  })

  const onSubmit = (data: UserFormValues) => {
    const payload: CreateUserRequest = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone_number: data.phone_number || null,
      role_id: data.role_id,
      status: data.status as UserStatus,
    }

    createUser.mutate(payload, {
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to create user')
      },
    })
  }

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url)
    form.setValue('avatar', url)
  }

  return (
    <div className='max-w-7xl p-6 pb-20'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='min-h-screen pb-20'
        >
          <div className='sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm'>
            <div className='max-w-7xl mx-auto px-6 py-4'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
                <Home className='w-4 h-4' />
                <ChevronRight className='w-4 h-4' />
                <button
                  type='button'
                  onClick={() => navigate('/admin/users')}
                  className='hover:text-foreground transition-colors'
                >
                  Users
                </button>
                <ChevronRight className='w-4 h-4' />
                <span className='text-foreground font-medium'>
                  Add New User
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='ghost'
                    size='icon'
                    type='button'
                    onClick={() => navigate('/admin/users')}
                    className='rounded-full'
                  >
                    <ArrowLeft className='w-5 h-5' />
                  </Button>
                  <div>
                    <h1 className='text-2xl font-bold tracking-tight'>
                      Create New User
                    </h1>
                    <div className='flex items-center gap-2 mt-1'>
                      <p className='text-sm text-muted-foreground'>
                        Onboard a new member to the platform
                      </p>
                      <Badge variant='secondary' className='ml-2'>
                        <UserPlus className='w-3 h-3 mr-1' />
                        New
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => navigate('/admin/users')}
                    className='gap-2'
                  >
                    <X className='w-4 h-4' />
                    Discard
                  </Button>
                  <Button
                    type='submit'
                    disabled={createUser.isPending}
                    className='gap-2 min-w-35'
                  >
                    {createUser.isPending ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className='w-4 h-4' />
                        Create User
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className='max-w-7xl mx-auto px-6 py-8'>
            <Card className='overflow-hidden border shadow-sm'>
              <div className='grid grid-cols-1 md:grid-cols-12 min-h-100'>
                <div className='md:col-span-4  border-r p-8 flex flex-col gap-8'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='relative group'>
                      <AvatarUploadSection
                        avatarUrl={avatarUrl}
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className='text-center'>
                      <p className='font-semibold text-foreground text-lg'>
                        {form.watch('full_name') || 'New User'}
                      </p>
                      <p className='text-sm text-muted-foreground truncate max-w-50'>
                        {form.watch('email') || 'email@example.com'}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem className='space-y-3 mx-auto'>
                        <FormLabel className='text-xs uppercase font-bold text-muted-foreground tracking-wider'>
                          Account Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-background'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(USER_STATUS).map(([key, value]) => {
                              const config = USER_STATUS_CONFIG[value]
                              return (
                                <SelectItem key={value} value={value}>
                                  <div className='flex items-center gap-2'>
                                    {value === USER_STATUS.ACTIVE ? (
                                      <CheckCircle2 className='w-4 h-4 text-green-500' />
                                    ) : value === USER_STATUS.INACTIVE ? (
                                      <AlertCircle className='w-4 h-4 text-gray-500' />
                                    ) : (
                                      <Ban className='w-4 h-4 text-red-500' />
                                    )}
                                    <span>{config.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='md:col-span-8 p-8 space-y-8'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold flex items-center gap-2'>
                      <User className='w-5 h-5 text-primary' /> General
                      Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                      <FormField
                        control={form.control}
                        name='full_name'
                        render={({ field }) => (
                          <FormItem className='col-span-2'>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <User className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                  placeholder='John Doe'
                                  className='pl-9'
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                  placeholder='john@example.com'
                                  className='pl-9'
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='phone_number'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone{' '}
                              <span className='text-muted-foreground font-normal text-xs'>
                                (Optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                  placeholder='+84...'
                                  className='pl-9'
                                  {...field}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold flex items-center gap-2'>
                      <Shield className='w-5 h-5 text-primary' /> Access &
                      Security
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                      <FormField
                        control={form.control}
                        name='role_id'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select role' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(USER_ROLE).map(
                                  ([key, value]) => (
                                    <SelectItem
                                      key={value}
                                      value={`role_${value.toLowerCase()}`}
                                    >
                                      <div className='flex items-center gap-2'>
                                        <BadgeCheck className='w-4 h-4 text-primary' />
                                        {USER_ROLE_CONFIG[value]?.label}
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Lock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                  type='password'
                                  placeholder='••••••••'
                                  className='pl-9'
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
