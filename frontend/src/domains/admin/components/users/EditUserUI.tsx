import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Loader2,
  Mail,
  User,
  Phone,
  Shield,
  CheckCircle2,
  Save,
  X,
  AlertCircle,
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
import { useUser, useUpdateUser } from '@/hooks/useUsers'
import { useActiveRoles } from '@/hooks/useRoles'
import type { UpdateUserRequest } from '@/api/user.api'
import { AvatarUploadSection } from '@/domains/admin/components/users/AvatarUploadSection'
import { UserPageHeader } from './UserPageHeader'
import { UserFormSkeleton } from './UserFormSkeleton'
import { UserNotFoundState } from './UserNotFoundState'
import { UserInfoRow } from './UserInfoRow'
import {
  formatUserDate,
  getUserStatusConfig,
} from '@/domains/admin/helpers/user.helpers'

// ===== VALIDATION SCHEMA =====
const editUserFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().optional().nullable(),
  avatar: z.url().optional().nullable(),
  role_id: z.string().optional(), // Optional - only send if changed
})

type EditUserFormValues = z.infer<typeof editUserFormSchema>

// ===== MAIN COMPONENT =====
export function EditUserUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Fetch user data
  const { data: response, isLoading: loadingUser } = useUser(id!)
  const user = response?.data

  // Fetch active roles for dropdown
  const { data: rolesResponse, isLoading: loadingRoles } = useActiveRoles()
  const roles = rolesResponse?.data || []

  // Update mutation
  const updateUser = useUpdateUser()

  // Form setup
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      full_name: '',
      phone_number: null,
      avatar: null,
      role_id: '',
    },
  })

  // ===== POPULATE FORM WHEN USER DATA LOADS =====
  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name,
        phone_number: user.phone_number || null,
        avatar: user.avatar || null,
        role_id: user.role.id, // Set current role as default
      })
      setAvatarUrl(user.avatar || null)
    }
  }, [user, form])

  // ===== HANDLERS =====
  const onSubmit = (data: EditUserFormValues) => {
    if (!id) return

    const payload: UpdateUserRequest = {
      full_name: data.full_name,
      phone_number: data.phone_number || null,
      avatar: avatarUrl || null,
    }

    // Only include role_id if it was changed
    if (data.role_id && data.role_id !== user?.role.id) {
      payload.role_id = data.role_id
    }

    updateUser.mutate(
      { id, data: payload },
      {
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to update user')
        },
      }
    )
  }

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url)
    form.setValue('avatar', url)
  }

  const handleCancel = () => {
    navigate(`/admin/users/${id}`)
  }

  // ===== LOADING STATE =====
  if (loadingUser || loadingRoles) {
    return <UserFormSkeleton />
  }

  // ===== NOT FOUND =====
  if (!user) {
    return (
      <UserNotFoundState
        title='User Not Found'
        description="The user you're trying to edit doesn't exist."
        actionLabel='Back to Users'
        onAction={() => navigate('/admin/users')}
      />
    )
  }

  // ===== MAIN RENDER =====
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='min-h-screen'>
        {/* ===== STICKY HEADER ===== */}
        <UserPageHeader
          breadcrumbs={[
            { label: 'Users', onClick: () => navigate('/admin/users') },
            { label: user.full_name, onClick: () => navigate(`/admin/users/${id}`) },
            { label: 'Edit' },
          ]}
          title='Edit User'
          subtitle='Update user information and permissions'
          icon={<Shield className='w-6 h-6 text-primary' />}
          actions={
            <>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={updateUser.isPending}
              >
                <X className='w-4 h-4 mr-2' />
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={updateUser.isPending || !form.formState.isDirty}
                className='min-w-32'
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          }
        />

        {/* ===== FORM CONTENT ===== */}
        <div className='max-w-7xl mx-auto px-6 py-8'>
          <Card className='overflow-hidden border shadow-sm'>
            <div className='grid grid-cols-1 md:grid-cols-12'>
              {/* ===== LEFT SIDEBAR ===== */}
              <div className='md:col-span-4 border-r p-8 bg-muted/30'>
                <div className='space-y-6'>
                  {/* Avatar Section */}
                  <div className='flex flex-col items-center gap-4'>
                    <AvatarUploadSection
                      avatarUrl={avatarUrl}
                      onChange={handleAvatarChange}
                    />
                    <div className='text-center'>
                      <p className='font-semibold text-foreground text-lg'>
                        {form.watch('full_name') || user.full_name}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Current Status Info */}
                  <div className='space-y-3'>
                    <h3 className='text-xs uppercase font-bold text-muted-foreground tracking-wider'>
                      Account Status
                    </h3>
                    <div className='space-y-2'>
                      <UserInfoRow
                        label='Status'
                        value={
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              getUserStatusConfig(user.status).className
                            }`}
                          >
                            {getUserStatusConfig(user.status).label}
                          </span>
                        }
                      />
                      <UserInfoRow
                        label='2FA'
                        value={
                          user.is_2fa_enabled ? (
                            <span className='text-green-600 flex items-center gap-1 text-sm'>
                              <CheckCircle2 className='w-3 h-3' /> Enabled
                            </span>
                          ) : (
                            <span className='text-muted-foreground text-sm'>
                              Disabled
                            </span>
                          )
                        }
                      />
                      <UserInfoRow
                        label='Created'
                        value={formatUserDate(user.created_at)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== RIGHT CONTENT ===== */}
              <div className='md:col-span-8 p-8 space-y-8'>
                {/* General Information */}
                <section className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <User className='w-5 h-5 text-primary' />
                    General Information
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {/* Full Name */}
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

                    {/* Email (Read-only) */}
                    <FormItem className='col-span-2'>
                      <FormLabel>Email Address</FormLabel>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                          value={user.email}
                          disabled
                          className='pl-9 bg-muted cursor-not-allowed'
                        />
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Email cannot be changed
                      </p>
                    </FormItem>

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name='phone_number'
                      render={({ field }) => (
                        <FormItem className='col-span-2'>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                              <Input
                                placeholder='+1 (555) 000-0000'
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
                </section>

                <Separator />

                {/* Role & Permissions */}
                <section className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <Shield className='w-5 h-5 text-primary' />
                    Role & Permissions
                  </h3>

                  <FormField
                    control={form.control}
                    name='role_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-background'>
                              <SelectValue placeholder='Select a role' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className='flex items-center gap-2'>
                                  <Shield className='w-4 h-4' />
                                  <span>{role.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role Description */}
                  {user.role && (
                    <div className='mt-4 p-4 bg-muted/50 rounded-lg border'>
                      <p className='text-sm font-medium mb-1'>
                        Current Role: {user.role.name}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {user.role.description || 'No description available'}
                      </p>
                    </div>
                  )}
                </section>

                {/* Warning Message */}
                <div className='flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg'>
                  <AlertCircle className='w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0' />
                  <div className='text-sm'>
                    <p className='font-medium text-amber-900 dark:text-amber-100'>
                      Important Note
                    </p>
                    <p className='text-amber-800 dark:text-amber-200 mt-1'>
                      Changing user roles will immediately affect their access
                      permissions. Make sure you understand the implications
                      before saving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </Form>
  )
}

