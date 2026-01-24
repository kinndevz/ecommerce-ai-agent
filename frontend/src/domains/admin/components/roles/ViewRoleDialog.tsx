import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import {
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
} from 'lucide-react'
import { useRole } from '@/hooks/useRoles'
import { HTTP_METHOD_CONFIG } from '@/api/services/http-method.constants'
import {
  formatRoleDateTime,
  getRoleStatusBadgeClass,
  getRoleStatusLabel,
} from '@/domains/admin/helpers/role.helpers'
import { RoleDialogNotFoundState } from './RoleDialogNotFoundState'

interface ViewRoleDialogProps {
  roleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewRoleDialog({
  roleId,
  open,
  onOpenChange,
}: ViewRoleDialogProps) {
  const { data: response, isLoading } = useRole(roleId || '')

  const role = response?.data

  // Group permissions by module
  const groupedPermissions = role?.permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = []
    }
    acc[permission.module].push(permission)
    return acc
  }, {} as Record<string, typeof role.permissions>)

  if (!roleId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-none w-[90vw] lg:w-250 max-h-[90vh] p-0 gap-0 overflow-hidden'>
        {isLoading ? (
          <div className='p-6 space-y-4'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-40 w-full' />
          </div>
        ) : role ? (
          <>
            {/* Header */}
            <DialogHeader className='px-6 pt-6 pb-4'>
              <div className='flex items-start gap-4'>
                <div className='w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20'>
                  <Shield className='w-7 h-7 text-primary' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <DialogTitle className='text-2xl'>{role.name}</DialogTitle>
                    <Badge variant='outline' className={getRoleStatusBadgeClass(role.is_active)}>
                      {role.is_active ? (
                        <CheckCircle2 className='w-3 h-3 mr-1' />
                      ) : (
                        <XCircle className='w-3 h-3 mr-1' />
                      )}
                      {getRoleStatusLabel(role.is_active)}
                    </Badge>
                  </div>
                  <DialogDescription className='text-sm'>
                    {role.description || 'No description provided'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Content */}
            <ScrollArea className='flex-1 max-h-[calc(90vh-200px)]'>
              <div className='px-6 py-4 space-y-6'>
                {/* Metadata */}
                <div className='grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='w-3.5 h-3.5' />
                      Created
                    </div>
                    <div className='text-sm font-medium'>
                      {formatRoleDateTime(role.created_at)}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Lock className='w-3.5 h-3.5' />
                      Permissions
                    </div>
                    <div className='text-sm font-medium'>
                      {role.permissions?.length || 0} endpoints
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Lock className='w-4 h-4 text-muted-foreground' />
                    <h3 className='font-semibold text-sm'>Permissions</h3>
                  </div>

                  {!role.permissions || role.permissions.length === 0 ? (
                    <div className='p-8 text-center border-2 border-dashed rounded-lg'>
                      <Lock className='w-12 h-12 mx-auto text-muted-foreground/50 mb-3' />
                      <p className='text-sm text-muted-foreground'>
                        No permissions assigned
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {Object.entries(groupedPermissions || {}).map(
                        ([module, permissions]) => (
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
                                      <div className='w-2 h-2 rounded-full bg-primary' />
                                      <div className='text-left'>
                                        <p className='font-semibold text-sm'>
                                          {module}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                          {permissions.length} endpoints
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {permissions.length}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>

                                {/* Permissions List */}
                                <AccordionContent className='px-3 pb-3 pt-2'>
                                  <div className='space-y-1.5'>
                                    {permissions.map((permission) => {
                                      const methodConfig =
                                        HTTP_METHOD_CONFIG[
                                          permission.method as keyof typeof HTTP_METHOD_CONFIG
                                        ]

                                      return (
                                        <div
                                          key={permission.id}
                                          className='flex items-center justify-between p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors'
                                        >
                                          <div className='flex-1 min-w-0 mr-3'>
                                            <p className='font-medium text-xs truncate mb-1'>
                                              {permission.name}
                                            </p>
                                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                              <Badge
                                                variant='outline'
                                                className={`${methodConfig.className} font-mono text-[10px] px-1.5 py-0`}
                                              >
                                                {methodConfig.label}
                                              </Badge>
                                              <code className='font-mono truncate'>
                                                {permission.path}
                                              </code>
                                            </div>
                                          </div>
                                          <CheckCircle2 className='w-4 h-4 text-green-600 shrink-0' />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* Footer */}
            <div className='px-6 py-4 bg-muted/20'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <User className='w-3.5 h-3.5' />
                <span>
                  Role ID: <code className='font-mono'>{role.id}</code>
                </span>
              </div>
            </div>
          </>
        ) : (
          <RoleDialogNotFoundState />
        )}
      </DialogContent>
    </Dialog>
  )
}
