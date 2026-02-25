import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'

interface FilterCheckboxProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: () => void
  indent?: number
}

export function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  indent = 0,
}: FilterCheckboxProps) {
  return (
    <div className='flex items-center space-x-2'>
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label
        htmlFor={id}
        className='text-sm cursor-pointer'
        style={{ paddingLeft: `${indent}px` }}
      >
        {label}
      </Label>
    </div>
  )
}
