import { useState } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import { WishlistItemCard } from '../components/wishlist/WishlistItemCard'
import { WishlistEmpty } from '../components/wishlist/WishlistEmpty'
import { WishlistSkeleton } from '../components/wishlist/WishlistSkeleton'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

export default function WishlistPage() {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 12,
  })

  const { data: response, isLoading } = useWishlist(queryParams)

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderContent = () => {
    if (isLoading) {
      return <WishlistSkeleton />
    }

    if (!response?.data || response.data.length === 0) {
      return <WishlistEmpty />
    }

    const { data, meta } = response

    return (
      <div className='space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8'>
          {data.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>

        {meta && meta.total_pages > 1 && (
          <div className='flex justify-center mt-8 pb-8'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
                    className={
                      meta.page === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, meta.page - 2),
                    Math.min(meta.total_pages, meta.page + 1)
                  )
                  .map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={meta.page === pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className='cursor-pointer'
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(meta.total_pages, meta.page + 1)
                      )
                    }
                    className={
                      meta.page === meta.total_pages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Navbar />

      <main className='flex-1 py-12 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-10 text-center md:text-left border-b border-border/40 pb-6'>
            <h1 className='text-3xl md:text-4xl font-medium text-foreground mb-2'>
              My Wishlist
            </h1>
            <p className='text-muted-foreground'>
              {response?.meta?.total
                ? `You have ${response.meta.total} items saved for later`
                : 'Manage your favorite products'}
            </p>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  )
}
