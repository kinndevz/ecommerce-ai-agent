import { useParams, useNavigate } from 'react-router-dom'
import {
  Home,
  ChevronRight,
  Edit,
  Trash2,
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
  AlertCircle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { useUser, useDeleteUser, useToggleUserStatus } from '@/hooks/useUsers'
import {
  USER_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  TFA_STATUS_CONFIG,
} from '@/api/services/user.constants'
import type { User } from '@/api/user.api'

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
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-12 h-12 animate-spin text-primary mx-auto' />
          <p className='text-sm text-muted-foreground'>
            Loading user details...
          </p>
        </div>
      </div>
    )
  }

  //  NOT FOUND
  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <AlertCircle className='w-16 h-16 text-muted-foreground mx-auto' />
          <h2 className='text-2xl font-semibold'>User Not Found</h2>
          <p className='text-muted-foreground'>
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/admin/users')} variant='outline'>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  // UTILITY FUNCTIONS
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusConfig = () =>
    USER_STATUS_CONFIG[user.status] || USER_STATUS_CONFIG.INACTIVE
  const getRoleConfig = () =>
    USER_ROLE_CONFIG[user.role.name] || USER_ROLE_CONFIG.CUSTOMER
  const get2FAConfig = () =>
    user.is_2fa_enabled ? TFA_STATUS_CONFIG.enabled : TFA_STATUS_CONFIG.disabled

  return (
    <div className='min-h-screen p-6 space-y-6'>
      {/* ===== BREADCRUMB & ACTIONS ===== */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => navigate('/admin/dashboard')}
          >
            <Home className='w-4 h-4' />
          </Button>
          <ChevronRight className='w-4 h-4' />
          <span
            className='hover:text-foreground cursor-pointer transition-colors'
            onClick={() => navigate('/admin/users')}
          >
            Users
          </span>
          <ChevronRight className='w-4 h-4' />
          <span className='font-medium text-foreground'>Details</span>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            disabled={deleteUser.isPending || toggleStatus.isPending}
          >
            <Edit className='w-4 h-4 mr-2' /> Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={deleteUser.isPending || toggleStatus.isPending}
                className='text-destructive hover:bg-destructive/10 border-destructive/20'
              >
                <Trash2 className='w-4 h-4 mr-2' /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  user
                  <span className='font-semibold text-foreground'>
                    {' '}
                    {user.full_name}
                  </span>{' '}
                  and remove their data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className='bg-destructive hover:bg-destructive/90'
                >
                  {deleteUser.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ===== USER HEADER ===== */}
      <div className='bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-xl border border-border p-8'>
        <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
          {/* Avatar */}
          <Avatar className='w-24 h-24 border-4 border-background shadow-lg'>
            <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
            <AvatarFallback className='text-2xl font-bold bg-primary/20 text-primary'>
              {getInitials(user.full_name)}
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
              <Badge variant='outline' className={getRoleConfig().className}>
                <Shield className='w-3 h-3 mr-1' />
                {getRoleConfig().label}
              </Badge>

              <Badge variant='outline' className={getStatusConfig().className}>
                {user.status === 'ACTIVE' ? (
                  <CheckCircle2 className='w-3 h-3 mr-1' />
                ) : (
                  <XCircle className='w-3 h-3 mr-1' />
                )}
                {getStatusConfig().label}
              </Badge>

              <Badge variant='outline' className={get2FAConfig().className}>
                <ShieldCheck className='w-3 h-3 mr-1' />
                2FA: {get2FAConfig().label}
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
              ) : user.status === 'ACTIVE' ? (
                <Ban className='w-4 h-4 mr-2' />
              ) : (
                <CheckCircle2 className='w-4 h-4 mr-2' />
              )}
              {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
            <InfoRow
              icon={<Mail className='w-4 h-4' />}
              label='Email'
              value={user.email}
            />
            <Separator />
            <InfoRow
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
            <InfoRow
              icon={<Shield className='w-4 h-4' />}
              label='Role'
              value={
                <Badge variant='outline' className={getRoleConfig().className}>
                  {getRoleConfig().label}
                </Badge>
              }
            />
            <Separator />
            <InfoRow
              icon={<Activity className='w-4 h-4' />}
              label='Status'
              value={
                <Badge
                  variant='outline'
                  className={getStatusConfig().className}
                >
                  {getStatusConfig().label}
                </Badge>
              }
            />
            <Separator />
            <InfoRow
              icon={<ShieldCheck className='w-4 h-4' />}
              label='2FA Status'
              value={
                <Badge variant='outline' className={get2FAConfig().className}>
                  {get2FAConfig().label}
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
            <InfoRow
              icon={<Calendar className='w-4 h-4' />}
              label='Created'
              value={formatDate(user.created_at)}
            />
            <Separator />
            <InfoRow
              icon={<Calendar className='w-4 h-4' />}
              label='Last Updated'
              value={formatDate(user.updated_at)}
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
              <InfoRow label='Created By' value={user.created_by_id} mono />
            )}
            {user.updated_by_id && (
              <InfoRow label='Updated By' value={user.updated_by_id} mono />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface InfoRowProps {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
}

function InfoRow({ icon, label, value, mono = false }: InfoRowProps) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {icon}
        <span className='font-medium'>{label}</span>
      </div>
      <div className={`text-sm text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  )
}
