import { useState } from 'react'
import { Check, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Button } from '@/shared/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

const PRESET_GROUPS = {
  skin: [
    { name: 'Porcelain', hex: '#F9F1E6' },
    { name: 'Ivory', hex: '#F5E6D3' },
    { name: 'Warm Ivory', hex: '#F3E5DC' },
    { name: 'Sand', hex: '#EED9C4' },
    { name: 'Beige', hex: '#E0C9AF' },
    { name: 'Warm Beige', hex: '#D4B896' },
    { name: 'Honey', hex: '#C9A882' },
    { name: 'Golden', hex: '#BFA07C' },
    { name: 'Almond', hex: '#B4916F' },
    { name: 'Tan', hex: '#A88460' },
    { name: 'Caramel', hex: '#9C7C5B' },
    { name: 'Mocha', hex: '#8C6C4F' },
    { name: 'Chestnut', hex: '#7D5E47' },
    { name: 'Espresso', hex: '#5C4033' },
    { name: 'Ebony', hex: '#3D2817' },
    { name: 'Obsidian', hex: '#28201C' },
  ],
  lip_cheek: [
    { name: 'Nude', hex: '#D8B6A4' },
    { name: 'Peachy', hex: '#FFCCB3' },
    { name: 'Soft Pink', hex: '#FFB6C1' },
    { name: 'Rose', hex: '#D4A5A5' },
    { name: 'Dusty Rose', hex: '#BC8F8F' },
    { name: 'Mauve', hex: '#915F6D' },
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Salmon', hex: '#FA8072' },
    { name: 'Fuchsia', hex: '#FF00FF' },
    { name: 'Magenta', hex: '#FF0090' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Classic Red', hex: '#DC143C' },
    { name: 'Brick', hex: '#B22222' },
    { name: 'Wine', hex: '#722F37' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Plum', hex: '#8E4585' },
    { name: 'Berry', hex: '#B83C57' },
  ],
  eyes_creative: [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Black', hex: '#000000' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Bronze', hex: '#CD7F32' },
    { name: 'Copper', hex: '#B87333' },
    { name: 'Lavender', hex: '#E6E6FA' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Royal Blue', hex: '#4169E1' },
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Emerald', hex: '#50C878' },
    { name: 'Olive', hex: '#808000' },
    { name: 'Mint', hex: '#98FF98' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
  ],
}

const ALL_COLORS = [
  ...PRESET_GROUPS.skin,
  ...PRESET_GROUPS.lip_cheek,
  ...PRESET_GROUPS.eyes_creative,
]

interface ColorPickerProps {
  value?: string | null
  onChange: (value: string) => void
  label?: string
}

export function ColorPicker({
  value,
  onChange,
  label = 'Shade / Color',
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState('')
  const [search, setSearch] = useState('')

  const selectedColorObj = ALL_COLORS.find(
    (c) => c.hex.toLowerCase() === value?.toLowerCase()
  )

  const handleCustomSubmit = () => {
    if (customColor.trim()) {
      onChange(customColor.trim())
      setOpen(false)
      setCustomColor('')
    }
  }

  const filterColors = (colors: typeof PRESET_GROUPS.skin) => {
    if (!search) return colors
    return colors.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  return (
    <div className='space-y-2'>
      {label && <Label className='text-xs font-medium'>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='w-full justify-start text-left font-normal h-10 px-3 border-input hover:bg-accent hover:text-accent-foreground'
            type='button'
          >
            {value ? (
              <div className='flex items-center gap-3 w-full'>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border border-gray-200 shadow-sm shrink-0',
                    !value && 'bg-linear-to-br from-gray-100 to-gray-300'
                  )}
                  style={{ backgroundColor: value }}
                />
                <div className='flex flex-col items-start leading-none gap-0.5 overflow-hidden flex-1'>
                  <span className='truncate text-sm font-medium'>
                    {selectedColorObj ? selectedColorObj.name : value}
                  </span>
                  <span className='text-[10px] text-muted-foreground font-mono opacity-70'>
                    {value}
                  </span>
                </div>
              </div>
            ) : (
              <span className='text-muted-foreground flex items-center gap-2'>
                <div className='w-5 h-5 rounded-full border border-dashed border-gray-300' />
                Select shade...
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-90 p-0 overflow-hidden' align='start'>
          {/* HEADER: Search */}
          <div className='p-3 border-b bg-muted/10'>
            <div className='relative'>
              <Search className='w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground' />
              <Input
                placeholder='Search name or enter HEX...'
                className='h-9 text-sm pl-9 pr-9 bg-background'
                value={search || customColor}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCustomColor(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomSubmit()
                }}
              />
              {search && (
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7 absolute right-1 top-1 text-muted-foreground hover:text-foreground'
                  onClick={handleCustomSubmit}
                >
                  <Plus className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue='skin' className='w-full'>
            <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0 h-10'>
              <TabsTrigger
                value='skin'
                className='flex-1 rounded-none border-b-2 border-transparent py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-accent/5'
              >
                Skin
              </TabsTrigger>
              <TabsTrigger
                value='lip_cheek'
                className='flex-1 rounded-none border-b-2 border-transparent py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-accent/5'
              >
                Lip & Blush
              </TabsTrigger>
              <TabsTrigger
                value='eyes_creative'
                className='flex-1 rounded-none border-b-2 border-transparent py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-accent/5'
              >
                Creative
              </TabsTrigger>
            </TabsList>

            <ScrollArea className='h-75 bg-background'>
              <div className='p-4'>
                <TabsContent value='skin' className='mt-0 m-0'>
                  <ColorGrid
                    colors={filterColors(PRESET_GROUPS.skin)}
                    selectedValue={value}
                    onSelect={(hex) => {
                      // Nhận hex
                      onChange(hex)
                      setOpen(false)
                      setSearch('')
                    }}
                  />
                </TabsContent>

                <TabsContent value='lip_cheek' className='mt-0 m-0'>
                  <ColorGrid
                    colors={filterColors(PRESET_GROUPS.lip_cheek)}
                    selectedValue={value}
                    onSelect={(hex) => {
                      onChange(hex)
                      setOpen(false)
                      setSearch('')
                    }}
                  />
                </TabsContent>

                <TabsContent value='eyes_creative' className='mt-0 m-0'>
                  <ColorGrid
                    colors={filterColors(PRESET_GROUPS.eyes_creative)}
                    selectedValue={value}
                    onSelect={(hex) => {
                      onChange(hex)
                      setOpen(false)
                      setSearch('')
                    }}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <div className='p-2.5 border-t bg-muted/30 text-[11px] text-center text-muted-foreground font-medium'>
            Press{' '}
            <kbd className='font-sans border rounded px-1 bg-background'>
              Enter
            </kbd>{' '}
            to add custom HEX
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ColorGrid({
  colors,
  selectedValue,
  onSelect,
}: {
  colors: { name: string; hex: string }[]
  selectedValue?: string | null
  onSelect: (hex: string) => void
}) {
  if (colors.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
          <Search className='w-5 h-5 text-muted-foreground/50' />
        </div>
        <p className='text-sm font-medium text-foreground'>No colors found</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-5 gap-3'>
      {colors.map((color) => {
        const isSelected =
          selectedValue?.toLowerCase() === color.hex.toLowerCase()

        return (
          <button
            key={color.hex}
            type='button'
            onClick={() => onSelect(color.hex)}
            className={cn(
              'group relative w-full aspect-square rounded-lg border shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 z-10'
                : 'border-transparent hover:border-gray-300'
            )}
            style={{ backgroundColor: color.hex }}
            title={`${color.name} (${color.hex})`}
          >
            {isSelected && (
              <div className='absolute inset-0 flex items-center justify-center animate-in zoom-in-50 duration-200'>
                <Check
                  className='w-4 h-4 text-white drop-shadow-md'
                  strokeWidth={3}
                />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
