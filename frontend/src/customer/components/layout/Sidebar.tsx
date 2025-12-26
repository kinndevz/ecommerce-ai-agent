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

const newArrivals = [
  {
    id: '1',
    name: 'Gentle Face Cleanser',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=150',
  },
  {
    id: '2',
    name: 'Nourishing Hair Mask',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=150',
  },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export const Sidebar = () => {
  return (
    <aside className='space-y-6'>
      {/* Editor's Pick - COMPACT */}
      <Card className='overflow-hidden border-2'>
        <CardHeader className='pb-3 bg-linear-to-br from-primary/5 to-secondary/5'>
          <div className='flex items-center gap-2'>
            <Star className='w-4 h-4 text-amber-500 fill-amber-500' />
            <CardTitle className='text-lg uppercase tracking-wide'>
              Editor's Pick
            </CardTitle>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Hand-selected favorites
          </p>
        </CardHeader>
        <CardContent className='p-3 space-y-3'>
          {editorsPick.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className='flex gap-3 group'
            >
              <div className='w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover transition-transform group-hover:scale-110'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <Badge
                  variant='secondary'
                  className='text-[10px] mb-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                >
                  {product.brand}
                </Badge>
                <h4 className='text-xs font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors'>
                  {product.name}
                </h4>
                <p className='text-sm font-bold text-primary'>
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Just Arrived - COMPACT */}
      <Card className='overflow-hidden border-2'>
        <CardHeader className='pb-3 bg-linear-to-br from-green-500/5 to-emerald-500/5'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-green-600' />
            <CardTitle className='text-lg uppercase tracking-wide'>
              Just Arrived
            </CardTitle>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>Latest additions</p>
        </CardHeader>
        <CardContent className='p-3'>
          <div className='grid grid-cols-2 gap-3'>
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className='group'
              >
                <div className='relative rounded-lg overflow-hidden bg-muted mb-2 border'>
                  <AspectRatio ratio={1}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-full h-full object-cover transition-transform group-hover:scale-110'
                    />
                  </AspectRatio>
                  <Badge className='absolute top-1.5 right-1.5 text-[10px] bg-green-600 hover:bg-green-700'>
                    NEW
                  </Badge>
                </div>
                <p className='text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors'>
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className='overflow-hidden border-2 bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-2 gap-3 text-center'>
            <div className='space-y-1'>
              <div className='flex items-center justify-center gap-1'>
                <Star className='w-3 h-3 text-amber-500 fill-amber-500' />
                <p className='text-xl font-bold'>4.9</p>
              </div>
              <p className='text-[10px] text-muted-foreground uppercase'>
                Rating
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-xl font-bold'>10K+</p>
              <p className='text-[10px] text-muted-foreground uppercase'>
                Products
              </p>
            </div>
          </div>
          <Separator className='my-3' />
          <div className='text-center'>
            <p className='text-xl font-bold'>500+</p>
            <p className='text-[10px] text-muted-foreground uppercase'>
              Brands
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
