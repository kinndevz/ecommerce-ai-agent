export interface Testimonial {
  id: string
  name: string
  avatar: string
  role: string
  rating: number
  content: string
  product: string
  date: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    role: 'Verified Buyer',
    rating: 5,
    content:
      "I've been using their products for 6 months now and my skin has never looked better! The quality is exceptional and the customer service is outstanding. Highly recommend to anyone looking for premium skincare.",
    product: 'Hydrating Serum',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Emily Chen',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    role: 'Beauty Enthusiast',
    rating: 5,
    content:
      'Finally found a brand that delivers on its promises! The retinol night cream transformed my skin texture completely. The packaging is beautiful and the product feels so luxurious.',
    product: 'Retinol Night Cream',
    date: '1 month ago',
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Skincare Addict',
    rating: 5,
    content:
      "Best investment I've made for my skincare routine. The vitamin C serum brightened my complexion in just 2 weeks. I'm now a customer for life!",
    product: 'Vitamin C Serum',
    date: '3 weeks ago',
  },
  {
    id: '4',
    name: 'Jessica Williams',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
    role: 'Verified Buyer',
    rating: 5,
    content:
      'The sunscreen is incredibly lightweight and leaves no white cast. Perfect for daily use under makeup. Love that this brand focuses on clean ingredients.',
    product: 'Daily Sunscreen SPF 50',
    date: '1 week ago',
  },
]
