import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Activity,
  User as UserIcon,
  Clock,
  Ban,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { useUser, useDeleteUser, useToggleUserStatus } from '@/hooks/useUsers'
import {
  USER_STATUS,
} from '@/api/services/user.constants'
import type { User } from '@/api/user.api'
import { UserPageHeader } from './UserPageHeader'
import { UserNotFoundState } from './UserNotFoundState'
import { UserDetailSkeleton } from './UserDetailSkeleton'
import { UserDeleteDialog } from './UserDeleteDialog'
import { UserInfoRow } from './UserInfoRow'
import {
  formatUserLongDateTime,
  getUserInitials,
  getUserRoleConfig,
  getUserStatusConfig,
  getUserTfaConfig,
} from '@/domains/admin/helpers/user.helpers'

export function ViewUserUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: response, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()
  const toggleStatus = useToggleUserStatus()

  const user = response?.data as User | undefined

  //  HANDLERS
  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteUser.mutateAsync(id)
      navigate('/admin/users')
    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleStatus = async () => {
    if (!user || !id) return

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    try {
      await toggleStatus.mutateAsync({ id, status: newStatus })
    } catch (error) {
      console.log(error)
    }
  }

  //  LOADING STATE
  if (isLoading) {
    return <UserDetailSkeleton />
  }

  //  NOT FOUND
  if (!user) {
    return (
      <UserNotFoundState
        actionLabel='Back to Users'
        onAction={() => navigate('/admin/users')}
      />
    )
  }

  const statusConfig = getUserStatusConfig(user.status)
  const roleConfig = getUserRoleConfig(user.role.name)
  const tfaConfig = getUserTfaConfig(user.is_2fa_enabled)

  return (
    <div className='min-h-screen p-6 space-y-6'>
      {/* ===== BREADCRUMB & ACTIONS ===== */}
      <UserPageHeader
        breadcrumbs={[
          { label: 'Users', onClick: () => navigate('/admin/users') },
          { label: 'Details' },
        ]}
        title={user.full_name}
        actions={
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(`/admin/users/${id}/edit`)}
              disabled={deleteUser.isPending || toggleStatus.isPending}
            >
              <Edit className='w-4 h-4 mr-2' /> Edit
            </Button>
            <UserDeleteDialog
              userName={user.full_name}
              isDeleting={deleteUser.isPending}
              onConfirm={handleDelete}
              disabled={deleteUser.isPending || toggleStatus.isPending}
            />
          </>
        }
      />

      {/* ===== USER HEADER ===== */}
      <div className='bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-xl border border-border p-8'>
        <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
          {/* Avatar */}
          <Avatar className='w-24 h-24 border-4 border-background shadow-lg'>
            <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
            <AvatarFallback className='text-2xl font-bold bg-primary/20 text-primary'>
              {getUserInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className='flex-1 space-y-3'>
            <div className='space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {user.full_name}
              </h1>
              <p className='text-muted-foreground flex items-center gap-2'>
                <Mail className='w-4 h-4' />
                {user.email}
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className={roleConfig.className}>
                <Shield className='w-3 h-3 mr-1' />
                {roleConfig.label}
              </Badge>

              <Badge variant='outline' className={statusConfig.className}>
                {user.status === USER_STATUS.ACTIVE ? (
                  <CheckCircle2 className='w-3 h-3 mr-1' />
                ) : (
                  <XCircle className='w-3 h-3 mr-1' />
                )}
                {statusConfig.label}
              </Badge>

              <Badge variant='outline' className={tfaConfig.className}>
                <ShieldCheck className='w-3 h-3 mr-1' />
                2FA: {tfaConfig.label}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='flex flex-col gap-2'>
            <Button
              variant={user.status === 'ACTIVE' ? 'destructive' : 'default'}
              size='sm'
              onClick={handleToggleStatus}
              disabled={toggleStatus.isPending}
              className='min-w-32'
            >
              {toggleStatus.isPending ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : user.status === USER_STATUS.ACTIVE ? (
                <Ban className='w-4 h-4 mr-2' />
              ) : (
                <CheckCircle2 className='w-4 h-4 mr-2' />
              )}
              {user.status === USER_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== DETAILS GRID ===== */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <UserIcon className='w-5 h-5 text-primary' />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <UserInfoRow
              icon={<Mail className='w-4 h-4' />}
              label='Email'
              value={user.email}
            />
            <Separator />
            <UserInfoRow
              icon={<Phone className='w-4 h-4' />}
              label='Phone'
              value={user.phone_number || 'Not provided'}
            />
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Shield className='w-5 h-5 text-primary' />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <UserInfoRow
              icon={<Shield className='w-4 h-4' />}
              label='Role'
              value={
                <Badge variant='outline' className={roleConfig.className}>
                  {roleConfig.label}
                </Badge>
              }
            />
            <Separator />
            <UserInfoRow
              icon={<Activity className='w-4 h-4' />}
              label='Status'
              value={
                <Badge variant='outline' className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              }
            />
            <Separator />
            <UserInfoRow
              icon={<ShieldCheck className='w-4 h-4' />}
              label='2FA Status'
              value={
                <Badge variant='outline' className={tfaConfig.className}>
                  {tfaConfig.label}
                </Badge>
              }
            />
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Clock className='w-5 h-5 text-primary' />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <UserInfoRow
              icon={<Calendar className='w-4 h-4' />}
              label='Created'
              value={formatUserLongDateTime(user.created_at)}
            />
            <Separator />
            <UserInfoRow
              icon={<Calendar className='w-4 h-4' />}
              label='Last Updated'
              value={formatUserLongDateTime(user.updated_at)}
            />
          </CardContent>
        </Card>
      </div>

      {/* ===== ROLE PERMISSIONS ===== */}
      {user.role && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='w-5 h-5 text-primary' />
              Role & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start gap-4 p-4 bg-muted/50 rounded-lg'>
              <Shield className='w-5 h-5 text-primary mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-semibold text-base mb-1'>
                  {user.role.name}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {user.role.description || 'No description provided'}
                </p>
              </div>
            </div>

            {user.role.permissions && user.role.permissions.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-sm text-muted-foreground'>
                  Permissions
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                  {user.role.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className='flex items-center gap-2 p-2 bg-muted/30 rounded-md text-xs'
                    >
                      <CheckCircle2 className='w-3 h-3 text-green-500 shrink-0' />
                      <span className='truncate' title={permission.description}>
                        {permission.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(user.created_by_id || user.updated_by_id) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
              System Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 text-sm'>
            {user.created_by_id && (
              <UserInfoRow label='Created By' value={user.created_by_id} mono />
            )}
            {user.updated_by_id && (
              <UserInfoRow label='Updated By' value={user.updated_by_id} mono />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

