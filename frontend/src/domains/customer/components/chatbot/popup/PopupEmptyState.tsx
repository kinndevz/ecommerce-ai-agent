import { Sparkles } from 'lucide-react'

const SUGGESTIONS = ['Tìm kem chống nắng', 'Routine da dầu', 'Đơn hàng của tôi']

export function PopupEmptyState() {
  return (
    <div className='flex flex-col items-center justify-center h-full gap-4 text-center px-6 py-8'>
      <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center'>
        <Sparkles className='w-6 h-6 text-primary' />
      </div>

      <div className='space-y-1.5'>
        <p className='text-sm font-semibold text-foreground'>Xin chào! 👋</p>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          Tôi có thể giúp bạn tìm sản phẩm, tư vấn skincare, hoặc theo dõi đơn
          hàng.
        </p>
      </div>

      <div className='flex flex-wrap gap-2 justify-center mt-1'>
        {SUGGESTIONS.map((hint) => (
          <span
            key={hint}
            className='text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border/50'
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  )
}
