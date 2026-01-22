import { Link } from 'react-router-dom'
import { Star, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Separator } from '@/shared/components/ui/separator'
import { useNewArrivalsProducts } from '@/hooks/useProducts'

const editorsPick = [
  {
    id: '1',
    name: 'Hydrating Serum',
    brand: 'The Ordinary',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
  },
  {
    id: '2',
    name: 'Retinol Night Cream',
    brand: 'CeraVe',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
  },
  {
    id: '3',
    name: 'Vitamin C Serum',
    brand: 'La Roche-Posay',
    price: 550000,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200',
  },
]

const fallbackProductImage = 'https://placehold.co/200x200/png?text=Product'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export const Sidebar = () => {
  const { data: newArrivalsData, isLoading: isNewArrivalsLoading } =
    useNewArrivalsProducts(30, 2)
  const newArrivals = newArrivalsData?.data ?? []

  return (
    <aside className='space-y-6'>
      {/* Editor's Pick - Enhanced */}
      <Card className='overflow-hidden border border-border/40 shadow-sm p-0'>
        <CardHeader className='p-4 pb-3 bg-linear-to-br from-primary/8 to-primary/5 border-b border-primary/20'>
          <div className='flex items-center gap-2'>
            <Star className='w-4 h-4 text-primary fill-primary' />
            <CardTitle className='text-base font-bold uppercase tracking-wider'>
              Editor's Pick
            </CardTitle>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Hand-selected favorites
          </p>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='divide-y divide-border/30'>
            {editorsPick.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className='flex gap-3 p-3 group hover:bg-muted/30 transition-colors'
              >
                <div className='w-16 h-16 rounded-lg overflow-hidden bg-muted/50 shrink-0 border border-border/40'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                  />
                </div>
                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                  <Badge
                    variant='secondary'
                    className='text-[10px] mb-1 w-fit px-2 py-0.5 bg-primary/10 text-primary border-0'
                  >
                    {product.brand}
                  </Badge>
                  <h4 className='text-xs font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-snug'>
                    {product.name}
                  </h4>
                  <p className='text-sm font-bold text-primary'>
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Just Arrived - Enhanced */}
      <Card className='overflow-hidden border border-border/40 shadow-sm p-0'>
        <CardHeader className='p-4 pb-3 bg-linear-to-br from-emerald-50/50 to-green-100/30 dark:from-emerald-950/20 dark:to-green-900/10 border-b border-emerald-200/30 dark:border-emerald-800/30'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-emerald-600 dark:text-emerald-500' />
            <CardTitle className='text-base font-bold uppercase tracking-wider'>
              Just Arrived
            </CardTitle>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>Latest additions</p>
        </CardHeader>
        <CardContent className='p-4'>
          <div className='grid grid-cols-2 gap-3'>
            {isNewArrivalsLoading && (
              <div className='col-span-full text-center text-xs text-muted-foreground'>
                Loading new arrivals...
              </div>
            )}
            {!isNewArrivalsLoading && newArrivals.length === 0 && (
              <div className='col-span-full text-center text-xs text-muted-foreground'>
                No new arrivals yet.
              </div>
            )}
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className='group'
              >
                <div className='relative rounded-lg overflow-hidden bg-muted/50 mb-2 border border-border/40'>
                  <AspectRatio ratio={1}>
                    <img
                      src={product.product_image || fallbackProductImage}
                      alt={product.name}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                    />
                  </AspectRatio>
                  <Badge className='absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 border-0 shadow-md'>
                    NEW
                  </Badge>
                </div>
                <p className='text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug'>
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
