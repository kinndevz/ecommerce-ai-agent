import { Link } from 'react-router-dom'
import { Menu, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { CategoryTreeNode } from '@/api/category.api'

interface MobileNavProps {
  categories: CategoryTreeNode[]
  isLoading: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  onSearch: (e: React.FormEvent) => void
}

export const MobileNav = ({
  categories,
  isLoading,
  isOpen,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  onSearch,
}: MobileNavProps) => {
  const renderMobileCategoryTree = (cats: CategoryTreeNode[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} className={cn('', level > 0 && 'ml-4')}>
        <Link
          to={`/categories/${category.slug}`}
          className={cn(
            'flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent transition-colors',
            level === 0 && 'font-semibold',
            level > 0 && 'text-sm'
          )}
          onClick={() => onOpenChange(false)}
        >
          <span className='flex items-center gap-2'>
            {category.name}
            {category.product_count > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {category.product_count}
              </Badge>
            )}
          </span>
          {category.children.length > 0 && (
            <ChevronRight className='w-4 h-4 text-muted-foreground' />
          )}
        </Link>
        {category.children.length > 0 && (
          <div className='mt-1'>
            {renderMobileCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden hover:bg-primary/10'
        >
          <Menu className='w-5 h-5' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-75 sm:w-100'>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100vh-8rem)] mt-6'>
          <div className='mb-6'>
            <form onSubmit={onSearch} className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </form>
          </div>
          <Separator className='mb-4' />
          <nav className='space-y-1'>
            {isLoading ? (
              <div className='space-y-2'>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className='h-10 w-full' />
                ))}
              </div>
            ) : categories.length > 0 ? (
              renderMobileCategoryTree(categories)
            ) : (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No categories available
              </p>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
