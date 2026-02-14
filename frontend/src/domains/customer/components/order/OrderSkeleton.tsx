import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card } from '@/shared/components/ui/card'

export function OrderGridSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <Skeleton className='aspect-4/3 w-full' />
      <div className='p-4 space-y-3'>
        <div className='flex justify-between'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-4 w-16' />
        </div>
        <Skeleton className='h-4 w-full' />
        <div className='pt-2 flex justify-between items-end'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-7 w-28' />
        </div>
        <Skeleton className='h-9 w-full mt-2' />
      </div>
    </Card>
  )
}

export function OrderListSkeleton() {
  return (
    <Card className='flex flex-col sm:flex-row overflow-hidden h-auto sm:h-40'>
      <Skeleton className='w-full sm:w-48 h-40 shrink-0' />
      <div className='flex-1 p-5 flex flex-col justify-between'>
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-8 w-24' />
        </div>
        <div className='flex justify-between items-end border-t pt-4'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>
    </Card>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='border-b'>
        <div className='container mx-auto max-w-7xl px-4 py-4'>
          <Skeleton className='h-8 w-32' />
        </div>
      </div>

      <div className='border-b bg-card/50'>
        <div className='container mx-auto max-w-7xl px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
      </div>

      <main className='container mx-auto max-w-7xl px-4 py-6 lg:py-8'>
        <div className='mb-6'>
          <Skeleton className='h-9 w-32' />
        </div>

        <div className='mb-6 space-y-3'>
          <Skeleton className='h-10 w-64' />
          <div className='flex items-center gap-3'>
            <Skeleton className='h-8 w-40' />
            <Skeleton className='h-4 w-1 rounded-full' />
            <Skeleton className='h-8 w-32' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-24 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-12'>
          <div className='space-y-6 lg:col-span-8'>
            <div className='rounded-lg border bg-card shadow-md'>
              <div className='border-b p-6'>
                <Skeleton className='h-6 w-48' />
              </div>
              <div className='divide-y'>
                {[1, 2].map((i) => (
                  <div key={i} className='px-6 py-5 flex gap-4'>
                    <Skeleton className='h-24 w-24 rounded-xl shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-5 w-3/4' />
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <Skeleton className='h-6 w-24' />
                      <Skeleton className='h-8 w-20' />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-lg border bg-card shadow-md'>
              <div className='border-b p-6'>
                <Skeleton className='h-6 w-56' />
              </div>
              <div className='p-6'>
                <div className='flex justify-between items-center'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='flex flex-col items-center gap-3'>
                      <Skeleton className='h-14 w-14 rounded-full' />
                      <Skeleton className='h-4 w-20' />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              {[1, 2].map((i) => (
                <div key={i} className='rounded-lg border bg-card shadow-md'>
                  <div className='border-b p-5'>
                    <Skeleton className='h-5 w-40' />
                  </div>
                  <div className='p-5 space-y-4'>
                    <div className='space-y-3'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-5 w-full' />
                    </div>
                    <div className='space-y-3'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-5 w-32' />
                    </div>
                    <div className='space-y-3'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-12 w-full' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='lg:col-span-4 space-y-4'>
            <div className='rounded-lg border bg-card shadow-lg'>
              <div className='border-b p-5'>
                <Skeleton className='h-6 w-48' />
              </div>
              <div className='p-5 space-y-4'>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-28' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </div>
                <Skeleton className='h-px w-full' />
                <div className='flex justify-between items-center py-3'>
                  <Skeleton className='h-5 w-24' />
                  <Skeleton className='h-8 w-32' />
                </div>
              </div>
              <div className='p-5 pt-3 space-y-2.5 bg-muted/20'>
                <Skeleton className='h-11 w-full rounded-md' />
                <Skeleton className='h-11 w-full rounded-md' />
              </div>
            </div>

            <div className='rounded-lg border bg-card shadow-md'>
              <div className='p-6 flex flex-col items-center text-center space-y-3.5'>
                <Skeleton className='h-14 w-14 rounded-full' />
                <div className='space-y-2 w-full flex flex-col items-center'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-48' />
                </div>
                <Skeleton className='h-9 w-full rounded-md' />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
