import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit,
  Trash2,
  Home,
  ChevronRight,
  Globe,
  MapPin,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useState } from 'react'
import { useBrand, useDeleteBrand } from '@/hooks/useBrands'

export default function ViewBrandUI() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: brand, isLoading } = useBrand(id!)
  const deleteBrand = useDeleteBrand()

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteBrand.mutateAsync(id)
      navigate('/admin/brands')
    } catch (error) {
      console.log(error)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!brand) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Package className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Brand Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The brand you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/admin/brands')}>
            Back to Brands
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
            <Home className='w-4 h-4' />
            <ChevronRight className='w-4 h-4' />
            <button
              onClick={() => navigate('/admin/brands')}
              className='hover:text-foreground transition-colors'
            >
              Brands
            </button>
            <ChevronRight className='w-4 h-4' />
            <span className='text-foreground font-medium'>{brand.name}</span>
          </div>

          {/* Header Actions */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {brand.name}
              </h1>
              <div className='flex items-center gap-2 mt-2'>
                <Badge
                  variant='outline'
                  className={
                    brand.is_active
                      ? 'bg-green-500/10 text-green-600 border-green-500/20 gap-1.5'
                      : 'bg-gray-500/10 text-gray-600 border-gray-500/20 gap-1.5'
                  }
                >
                  {brand.is_active ? (
                    <CheckCircle className='w-3.5 h-3.5' />
                  ) : (
                    <XCircle className='w-3.5 h-3.5' />
                  )}
                  {brand.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {brand.country && (
                  <Badge variant='secondary' className='gap-1.5'>
                    <MapPin className='w-3.5 h-3.5' />
                    {brand.country}
                  </Badge>
                )}
                <Badge variant='outline' className='gap-1.5'>
                  <Package className='w-3.5 h-3.5' />
                  {brand.product_count} Products
                </Badge>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate(`/admin/brands/${id}/edit`)}
              >
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Button>
              <Button
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={brand.product_count > 0}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Sidebar - Logo & Quick Info */}
          <div className='lg:col-span-4 space-y-6'>
            {/* Logo Card */}
            <Card className='overflow-hidden'>
              <div className='aspect-square w-full bg-linear-to-br from-muted/30 to-muted/10 flex items-center justify-center relative'>
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className='w-full h-full object-contain p-8'
                  />
                ) : (
                  <div className='text-center'>
                    <Package className='w-20 h-20 mx-auto text-muted-foreground/40 mb-4' />
                    <p className='text-sm text-muted-foreground'>No logo</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                  <span className='text-sm text-muted-foreground flex items-center gap-2'>
                    <Package className='w-4 h-4' />
                    Products
                  </span>
                  <Badge variant='secondary' className='font-bold text-base'>
                    {brand.product_count}
                  </Badge>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                  <span className='text-sm text-muted-foreground'>Status</span>
                  <Badge
                    variant='outline'
                    className={
                      brand.is_active
                        ? 'bg-green-500/10 text-green-600 border-green-500/20 font-medium'
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/20 font-medium'
                    }
                  >
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Details */}
          <div className='lg:col-span-8 space-y-6'>
            {/* Brand Information */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
                <CardDescription>Basic details and metadata</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid gap-6'>
                  {/* Website */}
                  {brand.website_url && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                        <Globe className='w-4 h-4' />
                        Website
                      </div>
                      <a
                        href={brand.website_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-primary hover:underline flex items-center gap-2 pl-6 font-medium'
                      >
                        {brand.website_url}
                        <ExternalLink className='w-3.5 h-3.5' />
                      </a>
                    </div>
                  )}

                  {/* Country */}
                  {brand.country && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                        <MapPin className='w-4 h-4' />
                        Country
                      </div>
                      <p className='text-sm pl-6 font-medium'>
                        {brand.country}
                      </p>
                    </div>
                  )}

                  {/* Slug */}
                  <div className='space-y-2'>
                    <div className='text-sm font-medium text-muted-foreground'>
                      URL Slug
                    </div>
                    <code className='text-sm bg-muted px-4 py-2.5 rounded-lg block font-mono'>
                      /brands/{brand.slug}
                    </code>
                  </div>
                </div>

                {/* Description */}
                {brand.description && (
                  <>
                    <Separator />
                    <div className='space-y-3'>
                      <div className='text-sm font-medium'>Description</div>
                      <p className='text-sm text-muted-foreground leading-relaxed'>
                        {brand.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
                <CardDescription>
                  System information and timestamps
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      Created At
                    </div>
                    <p className='text-sm pl-6 font-medium'>
                      {new Date(brand.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      Updated At
                    </div>
                    <p className='text-sm pl-6 font-medium'>
                      {new Date(brand.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Brand ID
                  </div>
                  <code className='text-xs bg-muted px-3 py-2 rounded-lg block font-mono break-all'>
                    {brand.id}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{brand.name}</strong>.
              {brand.product_count > 0 && (
                <span className='block mt-2 text-destructive font-medium'>
                  ⚠️ This brand has {brand.product_count} product(s). You cannot
                  delete it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={brand.product_count > 0}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleteBrand.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <Skeleton className='h-4 w-64 mb-3' />
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-20' />
                <Skeleton className='h-6 w-24' />
              </div>
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-10 w-24' />
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-4 space-y-6'>
            <Skeleton className='aspect-square w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
          <div className='lg:col-span-8 space-y-6'>
            <Skeleton className='h-64 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
        </div>
      </div>
    </div>
  )
}
