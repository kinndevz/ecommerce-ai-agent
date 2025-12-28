import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/components/ui/navigation-menu'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CategoryTreeNode } from '@/api/category.api'

interface DesktopNavProps {
  categories: CategoryTreeNode[]
  isLoading: boolean
}

export const DesktopNav = ({ categories, isLoading }: DesktopNavProps) => {
  const renderMegaMenuItem = (item: CategoryTreeNode) => (
    <Link
      key={item.id}
      to={`/categories/${item.slug}`}
      className='group flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent/50 focus:outline-none'
    >
      <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-muted/20 transition-transform duration-300 group-hover:scale-110'>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className='h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal'
          />
        ) : (
          <Package className='h-6 w-6 text-muted-foreground/50' />
        )}
      </div>
      <span className='text-center text-[13px] font-medium leading-tight text-foreground/80 group-hover:text-primary line-clamp-2'>
        {item.name}
      </span>
    </Link>
  )

  const renderCategoryMegaMenu = (category: CategoryTreeNode) => {
    if (!category.children || category.children.length === 0) {
      return (
        <NavigationMenuItem key={category.id}>
          <Link to={`/categories/${category.slug}`}>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {category.name}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      )
    }

    const hasGroups = category.children.some(
      (child) => child.children.length > 0
    )
    const childCount = category.children.length
    const containerWidthClass = hasGroups
      ? 'md:w-[800px] lg:w-[800px]'
      : childCount <= 4
      ? 'w-[350px]'
      : childCount <= 8
      ? 'w-[600px]'
      : 'md:w-[800px] lg:w-[800px]'

    const gridColsClass = !hasGroups
      ? childCount <= 4
        ? 'grid-cols-2'
        : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
      : ''
    return (
      <NavigationMenuItem key={category.id}>
        <NavigationMenuTrigger className='bg-transparent'>
          {category.name}
          {category.product_count > 0 && (
            <Badge
              variant='secondary'
              className='ml-2 text-[9px] px-1.5 py-0 hidden lg:inline-flex'
            >
              {category.product_count}
            </Badge>
          )}
        </NavigationMenuTrigger>

        <NavigationMenuContent>
          <div className={cn('flex flex-col gap-6 p-6', containerWidthClass)}>
            {hasGroups ? (
              <div className='grid grid-cols-3 gap-8'>
                {category.children.map((group) => (
                  <div key={group.id} className='flex flex-col gap-3'>
                    <Link
                      to={`/categories/${group.slug}`}
                      className='text-sm font-bold text-primary hover:underline flex items-center gap-1'
                    >
                      {group.name}
                      <ChevronRight className='h-3 w-3' />
                    </Link>
                    <div className='grid grid-cols-3 gap-2'>
                      {group.children.length > 0
                        ? group.children.slice(0, 9).map(renderMegaMenuItem)
                        : renderMegaMenuItem(group)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between border-b pb-2 border-border/50'>
                  <h4 className='text-lg font-semibold flex items-center gap-2'>
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        className='w-6 h-6 object-contain'
                        alt=''
                      />
                    )}
                    {category.name}
                  </h4>
                  <Link
                    to={`/categories/${category.slug}`}
                    className='text-sm text-primary hover:underline flex items-center font-medium'
                  >
                    Xem tất cả <ChevronRight className='w-4 h-4 ml-1' />
                  </Link>
                </div>

                <div className={cn('grid gap-4', gridColsClass)}>
                  {category.children.map(renderMegaMenuItem)}
                </div>
              </div>
            )}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <div className='hidden md:block bg-muted/40 border-y border-border/30'>
      <div className='max-w-7xl mx-auto px-6 flex justify-center'>
        {isLoading ? (
          <div className='flex gap-2 py-2'>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className='h-8 w-24 rounded-full' />
            ))}
          </div>
        ) : (
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {categories.map((category) => renderCategoryMegaMenu(category))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </div>
  )
}
