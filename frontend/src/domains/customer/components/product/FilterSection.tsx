import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function FilterSection({
  title,
  defaultOpen = false,
  children,
}: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className='space-y-3'>
      <CollapsibleTrigger className='flex items-center justify-between w-full py-2 group'>
        <span className='font-semibold text-sm uppercase tracking-wide text-foreground'>
          {title}
        </span>
        <ChevronDown className='h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
