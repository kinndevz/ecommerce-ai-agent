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
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className='group'
              >
                <div className='relative rounded-lg overflow-hidden bg-muted/50 mb-2 border border-border/40'>
                  <AspectRatio ratio={1}>
                    <img
                      src={product.image}
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

      {/* Quick Stats - Enhanced */}
      <Card className='overflow-hidden border border-border/40 shadow-sm bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5'>
        <CardContent className='p-5'>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-center gap-1'>
                <Star className='w-3.5 h-3.5 text-amber-500 fill-amber-500' />
                <p className='text-2xl font-bold'>4.9</p>
              </div>
              <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>
                Rating
              </p>
            </div>
            <div className='space-y-1.5'>
              <p className='text-2xl font-bold'>10K+</p>
              <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>
                Products
              </p>
            </div>
          </div>
          <Separator className='my-4' />
          <div className='text-center'>
            <p className='text-2xl font-bold'>500+</p>
            <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>
              Brands
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
