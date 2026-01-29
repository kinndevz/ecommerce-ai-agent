import { useParams } from 'react-router-dom'
import { useProductBySlug } from '@/hooks/useProducts'
import { ProductDetailSkeleton } from '../components/product/ProductDetailSkeleton'
import { ProductNotFound } from '../components/product/ProductNotFound'
import { ProductGallery } from '../components/product/ProductGallery'
import { ProductInfo } from '../components/product/ProductInfo'
import { RelatedProducts } from '../components/product/RelatedProduct'
import { Navbar } from '../components/layout/Navbar'
import { ProductReviews } from '../components/product/ProductReviews'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: response, isLoading, isError } = useProductBySlug(slug || '')

  const renderContent = () => {
    if (isLoading) {
      return <ProductDetailSkeleton />
    }

    if (isError || !response?.data) {
      return <ProductNotFound />
    }

    const product = response.data

    return (
      <div className='animate-in fade-in duration-500'>
        <div className='container mx-auto px-4 py-8 md:py-16'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16'>
            <div className='w-full'>
              <ProductGallery images={product.images} />
            </div>
            <div className='w-full'>
              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        <div className='border-t border-border/40'>
          <ProductReviews productId={product.id} />
        </div>

        <div className='container mx-auto'>
          <RelatedProducts productId={product.id} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <main className='p-7'>{renderContent()}</main>
    </div>
  )
}
