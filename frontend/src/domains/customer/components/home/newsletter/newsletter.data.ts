import { Gift, Bell, Sparkles, type LucideIcon } from 'lucide-react'

export interface Benefit {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export const BENEFITS: Benefit[] = [
  {
    icon: Gift,
    title: '15% Off First Order',
    description: 'Exclusive welcome discount',
    color: 'text-rose-500 bg-rose-500/10',
  },
  {
    icon: Bell,
    title: 'Early Access',
    description: 'Be first to shop new arrivals',
    color: 'text-violet-500 bg-violet-500/10',
  },
  {
    icon: Sparkles,
    title: 'Insider Tips',
    description: 'Expert skincare advice',
    color: 'text-amber-500 bg-amber-500/10',
  },
]

export const SUBSCRIBER_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50',
]
