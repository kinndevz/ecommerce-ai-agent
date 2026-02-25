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
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className='flex items-center justify-between w-full py-3 border-b hover:text-primary transition-colors group'>
        <span className='font-medium'>{title}</span>
        <ChevronDown className='h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent className='pt-4 space-y-3'>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
