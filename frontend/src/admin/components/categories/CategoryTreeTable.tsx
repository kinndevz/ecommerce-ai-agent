import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FolderTree,
  Image as ImageIcon,
  Package,
  Hash,
  Layers,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { useToggleCategoryStatus } from '@/hooks/useCategories'
import type { Category } from '@/api/category.api'

interface CategoryTreeTableProps {
  categories: Category[]
  isLoading: boolean
  onDelete: (category: Category) => void
}

export function CategoryTreeTable({
  categories,
  isLoading,
  onDelete,
}: CategoryTreeTableProps) {
  const navigate = useNavigate()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleStatus = useToggleCategoryStatus()

  // Build tree structure from flat list
  const buildTree = (
    items: Category[],
    parentId: string | null = null
  ): Category[] => {
    return items
      .filter((item) => item.parent_id === parentId)
      .sort((a, b) => a.display_order - b.display_order)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      })) as any
  }

  const tree = buildTree(categories)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (items: any[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id)
          collectIds(item.children)
        }
      })
    }
    collectIds(tree)
    setExpandedIds(allIds)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStatus.mutate(id)
  }

  if (isLoading) {
    return (
      <div className='rounded-lg border bg-card overflow-hidden'>
        <div className='p-6 space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-20 w-full' />
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className='rounded-lg border-2 border-dashed bg-card'>
        <div className='text-center py-16 px-6'>
          <div className='inline-flex p-4 rounded-full bg-primary/10 mb-4'>
            <FolderTree className='w-12 h-12 text-primary' />
          </div>
          <h3 className='text-xl font-semibold mb-2'>No Categories Yet</h3>
          <p className='text-muted-foreground mb-6 max-w-sm mx-auto'>
            Get started by creating your first product category to organize your
            inventory
          </p>
          <Button
            size='lg'
            onClick={() => navigate('/admin/categories/add')}
            className='gap-2'
          >
            <FolderTree className='w-5 h-5' />
            Create First Category
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-lg border bg-card overflow-hidden'>
      {/* Table Header with Controls */}
      <div className='px-6 py-4 bg-muted/30 border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Layers className='w-5 h-5 text-muted-foreground' />
            <h3 className='font-semibold'>Category Tree</h3>
            <Badge variant='secondary' className='ml-2'>
              {categories.length} total
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={expandAll}
              className='text-xs'
            >
              Expand All
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={collapseAll}
              className='text-xs'
            >
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className='grid grid-cols-12 gap-4 px-6 py-3 bg-muted/20 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
        <div className='col-span-5'>Category Name</div>
        <div className='col-span-2 text-center'>Preview</div>
        <div className='col-span-1 text-center'>Order</div>
        <div className='col-span-1 text-center'>Items</div>
        <div className='col-span-2 text-center'>Status</div>
        <div className='col-span-1 text-right'>Actions</div>
      </div>

      {/* Table Body */}
      <div className='divide-y divide-border/50'>
        {tree.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            level={0}
            index={index}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onToggleStatus={handleToggleStatus}
            onDelete={onDelete}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  )
}

interface CategoryRowProps {
  category: Category & { children?: Category[] }
  level: number
  index: number
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onToggleStatus: (id: string, e: React.MouseEvent) => void
  onDelete: (category: Category) => void
  navigate: any
}

function CategoryRow({
  category,
  level,
  index,
  expandedIds,
  onToggleExpand,
  onToggleStatus,
  onDelete,
  navigate,
}: CategoryRowProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)

  return (
    <>
      <div
        className={`group grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-all duration-200 ${
          level === 0 ? 'bg-background' : ''
        }`}
      >
        {/* Category Name with Hierarchy */}
        <div
          className='col-span-5 flex items-center gap-2'
          style={{ paddingLeft: `${level * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToggleExpand(category.id)}
                    className='p-1.5 hover:bg-primary/10 rounded-md transition-colors shrink-0'
                  >
                    {isExpanded ? (
                      <ChevronDown className='w-4 h-4 text-primary' />
                    ) : (
                      <ChevronRight className='w-4 h-4' />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? 'Collapse' : 'Expand'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className='w-7 shrink-0 flex items-center justify-center'>
              {level > 0 && (
                <div className='w-2 h-2 rounded-full bg-muted-foreground/20' />
              )}
            </div>
          )}

          {/* Category Name */}
          <button
            onClick={() => navigate(`/admin/categories/${category.id}`)}
            className='font-medium hover:text-primary transition-colors text-left flex items-center gap-2 min-w-0 flex-1 group/name'
          >
            <span className='truncate'>{category.name}</span>
            {hasChildren && (
              <Badge
                variant='secondary'
                className='text-[10px] px-1.5 py-0 h-5 shrink-0'
              >
                <Layers className='w-3 h-3 mr-0.5' />
                {category.children_count}
              </Badge>
            )}
          </button>
        </div>

        {/* Image Preview */}
        <div className='col-span-2 flex justify-center items-center'>
          {category.image_url ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='relative w-14 h-14 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors cursor-pointer group/img'>
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className='w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200'
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View full image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className='w-14 h-14 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30'>
              <ImageIcon className='w-5 h-5 text-muted-foreground/40' />
            </div>
          )}
        </div>

        {/* Display Order */}
        <div className='col-span-1 flex items-center justify-center'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='gap-1.5 font-mono bg-muted/50'
                >
                  <Hash className='w-3 h-3' />
                  {category.display_order}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Display order in list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Product Count */}
        <div className='col-span-1 flex items-center justify-center'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={category.product_count > 0 ? 'default' : 'secondary'}
                  className='gap-1.5 font-semibold'
                >
                  <Package className='w-3 h-3' />
                  {category.product_count}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{category.product_count} products in this category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Status Toggle */}
        <div className='col-span-2 flex items-center justify-center'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => onToggleStatus(category.id, e)}
                  className='transition-all hover:scale-105'
                >
                  <Badge
                    variant='outline'
                    className={`gap-1.5 font-medium cursor-pointer transition-all ${
                      category.is_active
                        ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/30 hover:bg-gray-500/20'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        category.is_active ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to toggle status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Actions Dropdown */}
        <div className='col-span-1 flex items-center justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem
                onClick={() => navigate(`/admin/categories/${category.id}`)}
                className='gap-2 cursor-pointer'
              >
                <Eye className='w-4 h-4' />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/admin/categories/${category.id}/edit`)
                }
                className='gap-2 cursor-pointer'
              >
                <Edit className='w-4 h-4' />
                <span>Edit Category</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                disabled={
                  category.product_count > 0 || category.children_count > 0
                }
                className='gap-2 cursor-pointer text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Trash2 className='w-4 h-4' />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Render Children with Animation */}
      {hasChildren && isExpanded && (
        <div className='animate-in slide-in-from-top-2 duration-200'>
          {category.children!.map((child, childIndex) => (
            <CategoryRow
              key={child.id}
              category={child}
              level={level + 1}
              index={childIndex}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </>
  )
}
