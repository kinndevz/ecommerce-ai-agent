import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { Switch } from '@/shared/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import {
  Shield,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
} from 'lucide-react'
import { useRole, useUpdateRole } from '@/hooks/useRoles'
import { usePermissionsByModule } from '@/hooks/usePermissions'
import { HTTP_METHOD_CONFIG } from '@/api/services/http-method.constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Form schema
const editRoleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  is_active: z.boolean(),
})

type EditRoleFormValues = z.infer<typeof editRoleFormSchema>

interface EditRoleDialogProps {
  roleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoleDialog({
  roleId,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  )

  // Fetch role data
  const { data: roleResponse, isLoading: roleLoading } = useRole(roleId || '')
  const role = roleResponse?.data

  // Fetch all permissions grouped by module
  const { data: permissionsResponse, isLoading: permissionsLoading } =
    usePermissionsByModule()
  const permissionsByModule = permissionsResponse?.data || {}

  // Update mutation
  const updateRole = useUpdateRole()

  // Form
  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  })

  // Populate form when role data loads
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description || '',
        is_active: role.is_active,
      })
      // Set initial selected permissions
      setSelectedPermissions(new Set(role.permissions?.map((p) => p.id) || []))
    }
  }, [role, form])

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(permissionId)
      } else {
        newSet.delete(permissionId)
      }
      return newSet
    })
  }

  // Handle module toggle (select/deselect all in module)
  const handleModuleToggle = (
    modulePermissionIds: string[],
    checked: boolean
  ) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        modulePermissionIds.forEach((id) => newSet.add(id))
      } else {
        modulePermissionIds.forEach((id) => newSet.delete(id))
      }
      return newSet
    })
  }

  // Submit handler
  const onSubmit = (data: EditRoleFormValues) => {
    if (!roleId) return

    updateRole.mutate(
      {
        id: roleId,
        data: {
          ...data,
          permission_ids: Array.from(selectedPermissions),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to update role')
        },
      }
    )
  }

  const isLoading = roleLoading || permissionsLoading
  const isSaving = updateRole.isPending

  if (!roleId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-none w-[90vw] lg:w-250 max-h-[90vh] p-0 gap-0 overflow-hidden'>
        {isLoading ? (
          <div className='p-8 space-y-6'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : role ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col h-full'
            >
              {/* Header */}
              <DialogHeader className='px-6 pt-6 pb-4'>
                <div className='flex items-start gap-4'>
                  <div className='w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20'>
                    <Shield className='w-7 h-7 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <DialogTitle className='text-2xl mb-1'>
                      Edit Role
                    </DialogTitle>
                    <DialogDescription className='text-sm'>
                      Update role details and manage permissions
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              {/* Content */}
              <ScrollArea className='flex-1 max-h-[calc(90vh-200px)]'>
                <div className='px-6 py-6 space-y-6'>
                  {/* Basic Info */}
                  <div className='space-y-4'>
                    <h3 className='font-semibold text-sm flex items-center gap-2'>
                      <Shield className='w-4 h-4' />
                      Role Information
                    </h3>

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='e.g., MANAGER'
                                {...field}
                                className='bg-background'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='is_active'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <div className='flex items-center gap-3 h-10 px-3 border rounded-md bg-background'>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <span className='text-sm'>
                                  {field.value ? (
                                    <span className='text-green-600 flex items-center gap-1.5'>
                                      <CheckCircle2 className='w-3.5 h-3.5' />
                                      Active
                                    </span>
                                  ) : (
                                    <span className='text-gray-600 flex items-center gap-1.5'>
                                      <XCircle className='w-3.5 h-3.5' />
                                      Inactive
                                    </span>
                                  )}
                                </span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Describe the role responsibilities...'
                              className='resize-none bg-background'
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Permissions */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm flex items-center gap-2'>
                        <Lock className='w-4 h-4' />
                        Permissions
                      </h3>
                      <Badge variant='secondary'>
                        {selectedPermissions.size} selected
                      </Badge>
                    </div>

                    {/* Single Column Layout - 1 module per row */}
                    <div className='space-y-2'>
                      {Object.entries(permissionsByModule).map(
                        ([module, permissions]) => {
                          const modulePermissions = permissions as any[]
                          const modulePermissionIds = modulePermissions.map(
                            (p) => p.id
                          )
                          const selectedInModule = modulePermissionIds.filter(
                            (id) => selectedPermissions.has(id)
                          ).length
                          const allSelected =
                            selectedInModule === modulePermissions.length

                          return (
                            <div
                              key={module}
                              className='border rounded-lg overflow-hidden bg-card'
                            >
                              <Accordion type='single' collapsible>
                                <AccordionItem
                                  value='permissions'
                                  className='border-none'
                                >
                                  {/* Module Header */}
                                  <AccordionTrigger className='hover:no-underline px-4 py-3 hover:bg-muted/50 transition-colors'>
                                    <div className='flex items-center justify-between w-full pr-3'>
                                      <div className='flex items-center gap-2'>
                                        <div
                                          className={cn(
                                            'w-2 h-2 rounded-full',
                                            allSelected
                                              ? 'bg-green-500'
                                              : selectedInModule > 0
                                              ? 'bg-amber-500'
                                              : 'bg-gray-400'
                                          )}
                                        />
                                        <div className='text-left'>
                                          <p className='font-semibold text-sm'>
                                            {module}
                                          </p>
                                          <p className='text-xs text-muted-foreground'>
                                            {modulePermissions.length} endpoints
                                          </p>
                                        </div>
                                      </div>
                                      <Badge
                                        variant='outline'
                                        className={cn(
                                          'text-xs font-medium',
                                          allSelected
                                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                            : selectedInModule > 0
                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                                        )}
                                      >
                                        {selectedInModule}/
                                        {modulePermissions.length}
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>

                                  {/* Permissions List */}
                                  <AccordionContent className='px-3 pb-3 pt-2'>
                                    {/* Quick Actions - Only visible when accordion is open */}
                                    <div className='flex gap-2 mb-3 px-1'>
                                      {!allSelected && (
                                        <Button
                                          type='button'
                                          variant='outline'
                                          size='sm'
                                          className='flex-1 h-8 text-xs hover:bg-green-500/10 hover:text-green-600'
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleModuleToggle(
                                              modulePermissionIds,
                                              true
                                            )
                                          }}
                                        >
                                          <CheckCircle2 className='w-3 h-3 mr-1' />
                                          Select All
                                        </Button>
                                      )}
                                      {selectedInModule > 0 && (
                                        <Button
                                          type='button'
                                          variant='outline'
                                          size='sm'
                                          className='flex-1 h-8 text-xs text-destructive hover:bg-destructive/10'
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleModuleToggle(
                                              modulePermissionIds,
                                              false
                                            )
                                          }}
                                        >
                                          <XCircle className='w-3 h-3 mr-1' />
                                          Clear All
                                        </Button>
                                      )}
                                    </div>

                                    <div className='space-y-1.5'>
                                      {modulePermissions.map((permission) => {
                                        const isSelected =
                                          selectedPermissions.has(permission.id)
                                        const methodConfig =
                                          HTTP_METHOD_CONFIG[
                                            permission.method as keyof typeof HTTP_METHOD_CONFIG
                                          ]

                                        return (
                                          <div
                                            key={permission.id}
                                            className={cn(
                                              'flex items-center justify-between p-2.5 rounded-md transition-colors',
                                              isSelected
                                                ? 'bg-primary/5'
                                                : 'bg-muted/30 hover:bg-muted/50'
                                            )}
                                          >
                                            <div className='flex-1 min-w-0 mr-3'>
                                              <p className='font-medium text-xs truncate mb-1'>
                                                {permission.name}
                                              </p>
                                              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                                <Badge
                                                  variant='outline'
                                                  className={cn(
                                                    methodConfig.className,
                                                    'font-mono text-[10px] px-1.5 py-0'
                                                  )}
                                                >
                                                  {methodConfig.label}
                                                </Badge>
                                                <code className='font-mono truncate'>
                                                  {permission.path}
                                                </code>
                                              </div>
                                            </div>
                                            <Switch
                                              checked={isSelected}
                                              onCheckedChange={(checked) =>
                                                handlePermissionToggle(
                                                  permission.id,
                                                  checked
                                                )
                                              }
                                            />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <Separator />

              {/* Footer */}
              <DialogFooter className='px-6 py-4 bg-muted/20'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4 mr-2' />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className='p-6 text-center'>
            <p className='text-muted-foreground'>Role not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
