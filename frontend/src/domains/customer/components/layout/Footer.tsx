import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-muted/30 border-t'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div>
            <h3 className='font-serif font-bold text-lg mb-4'>BeautyShop</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Your trusted source for premium beauty products at honest prices.
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='icon'
                className='rounded-full'
                asChild
              >
                <a
                  href='https://facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Facebook className='w-4 h-4' />
                </a>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='rounded-full'
                asChild
              >
                <a
                  href='https://instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Instagram className='w-4 h-4' />
                </a>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='rounded-full'
                asChild
              >
                <a
                  href='https://twitter.com'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Twitter className='w-4 h-4' />
                </a>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='rounded-full'
                asChild
              >
                <a
                  href='https://youtube.com'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Youtube className='w-4 h-4' />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className='font-semibold mb-4 uppercase tracking-wide text-sm'>
              Shop
            </h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link
                  to='/categories/skin-care'
                  className='hover:text-foreground transition-colors'
                >
                  Skin Care
                </Link>
              </li>
              <li>
                <Link
                  to='/categories/makeup'
                  className='hover:text-foreground transition-colors'
                >
                  Makeup
                </Link>
              </li>
              <li>
                <Link
                  to='/categories/hair-care'
                  className='hover:text-foreground transition-colors'
                >
                  Hair Care
                </Link>
              </li>
              <li>
                <Link
                  to='/categories/fragrance'
                  className='hover:text-foreground transition-colors'
                >
                  Fragrance
                </Link>
              </li>
              <li>
                <Link
                  to='/categories/brands'
                  className='hover:text-foreground transition-colors'
                >
                  All Brands
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-4 uppercase tracking-wide text-sm'>
              Customer Service
            </h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link
                  to='/contact'
                  className='hover:text-foreground transition-colors'
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to='/shipping'
                  className='hover:text-foreground transition-colors'
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  to='/returns'
                  className='hover:text-foreground transition-colors'
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to='/faq'
                  className='hover:text-foreground transition-colors'
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to='/track-order'
                  className='hover:text-foreground transition-colors'
                >
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-4 uppercase tracking-wide text-sm'>
              Newsletter
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Subscribe to get special offers and updates.
            </p>
            <div className='flex gap-2'>
              <Input type='email' placeholder='Your email' className='flex-1' />
              <Button size='icon'>
                <Mail className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className='py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
            <p>© {currentYear} BeautyShop. All rights reserved.</p>
            <div className='flex gap-6'>
              <Link
                to='/privacy'
                className='hover:text-foreground transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                to='/terms'
                className='hover:text-foreground transition-colors'
              >
                Terms of Service
              </Link>
              <Link
                to='/cookies'
                className='hover:text-foreground transition-colors'
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
