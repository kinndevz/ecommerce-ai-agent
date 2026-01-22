/**
 * Mock Data - Homepage
 * Hardcoded data for development
 * TODO: Replace with API calls later
 */

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  isBestSeller?: boolean
  isNew?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
}

export interface Brand {
  id: string
  name: string
  logo: string
  description: string
}

export interface Testimonial {
  id: string
  name: string
  avatar: string
  rating: number
  comment: string
  product: string
  date: string
}

// ============================================
// CATEGORIES
// ============================================
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Skincare',
    slug: 'skincare',
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500',
    productCount: 156,
  },
  {
    id: '2',
    name: 'Makeup',
    slug: 'makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500',
    productCount: 234,
  },
  {
    id: '3',
    name: 'Hair Care',
    slug: 'hair-care',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
    productCount: 89,
  },
  {
    id: '4',
    name: 'Fragrance',
    slug: 'fragrance',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
    productCount: 67,
  },
  {
    id: '5',
    name: 'Body Care',
    slug: 'body-care',
    image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=500',
    productCount: 123,
  },
  {
    id: '6',
    name: 'Sunscreen',
    slug: 'sunscreen',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500',
    productCount: 45,
  },
]

// ============================================
// FEATURED PRODUCTS
// ============================================
export const mockFeaturedProducts: Product[] = [
  {
    id: '1',
    name: 'Anthelios UV Mune 400 Invisible Fluid SPF50+',
    brand: 'La Roche-Posay',
    price: 450000,
    originalPrice: 550000,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
    rating: 4.8,
    reviewCount: 1234,
    category: 'Sunscreen',
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Hydrating Facial Cleanser',
    brand: 'CeraVe',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1556228852-80c3be739f78?w=500',
    rating: 4.7,
    reviewCount: 987,
    category: 'Skincare',
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'Retinol 0.5% in Squalane',
    brand: 'The Ordinary',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
    rating: 4.6,
    reviewCount: 756,
    category: 'Skincare',
    isNew: true,
  },
  {
    id: '4',
    name: 'Advanced Night Repair Serum',
    brand: 'Estée Lauder',
    price: 1850000,
    originalPrice: 2100000,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500',
    rating: 4.9,
    reviewCount: 2341,
    category: 'Skincare',
    isBestSeller: true,
  },
  {
    id: '5',
    name: 'Superstay Matte Ink Liquid Lipstick',
    brand: 'Maybelline',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
    rating: 4.5,
    reviewCount: 543,
    category: 'Makeup',
  },
  {
    id: '6',
    name: 'Double Wear Foundation',
    brand: 'Estée Lauder',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
    rating: 4.7,
    reviewCount: 1876,
    category: 'Makeup',
    isBestSeller: true,
  },
]

// ============================================
// NEW ARRIVALS
// ============================================
export const mockNewArrivals: Product[] = [
  {
    id: '7',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500',
    rating: 4.6,
    reviewCount: 432,
    category: 'Skincare',
    isNew: true,
  },
  {
    id: '8',
    name: 'Cicaplast Baume B5+',
    brand: 'La Roche-Posay',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
    rating: 4.8,
    reviewCount: 678,
    category: 'Skincare',
    isNew: true,
  },
  {
    id: '9',
    name: 'Lash Sensational Mascara',
    brand: 'Maybelline',
    price: 165000,
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500',
    rating: 4.4,
    reviewCount: 234,
    category: 'Makeup',
    isNew: true,
  },
  {
    id: '10',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    price: 190000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
    rating: 4.7,
    reviewCount: 892,
    category: 'Skincare',
    isNew: true,
  },
]

// ============================================
// BRANDS
// ============================================
export const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'La Roche-Posay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/La_Roche-Posay_logo.svg/320px-La_Roche-Posay_logo.svg.png',
    description: 'Dermatologist-recommended skincare',
  },
  {
    id: '2',
    name: 'CeraVe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/CeraVe_logo.svg/320px-CeraVe_logo.svg.png',
    description: 'Developed with dermatologists',
  },
  {
    id: '3',
    name: 'The Ordinary',
    logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
    description: 'Clinical formulations with integrity',
  },
  {
    id: '4',
    name: 'Estée Lauder',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Est%C3%A9e_Lauder_logo.svg/320px-Est%C3%A9e_Lauder_logo.svg.png',
    description: 'Prestige beauty leader',
  },
  {
    id: '5',
    name: 'Maybelline',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Maybelline_Logo.svg/320px-Maybelline_Logo.svg.png',
    description: 'Make it happen',
  },
  {
    id: '6',
    name: 'Innisfree',
    logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
    description: 'Natural benefits from Jeju Island',
  },
]

// ============================================
// TESTIMONIALS
// ============================================
export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Anh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    rating: 5,
    comment:
      'Kem chống nắng La Roche-Posay tuyệt vời! Không gây nhờn, thấm nhanh, phù hợp da dầu mụn. Đã dùng được 3 tháng và da cải thiện rõ rệt.',
    product: 'Anthelios UV Mune 400',
    date: '2024-12-20',
  },
  {
    id: '2',
    name: 'Trần Thanh Hà',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    rating: 5,
    comment:
      'CeraVe Cleanser gentle lắm, da khô nhạy cảm mà dùng rất ổn. Giá cả hợp lý, hiệu quả tốt. Sẽ ủng hộ shop lâu dài!',
    product: 'CeraVe Hydrating Cleanser',
    date: '2024-12-18',
  },
  {
    id: '3',
    name: 'Lê Quỳnh Chi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    rating: 4,
    comment:
      'The Ordinary Retinol hiệu quả thật, da mịn hơn sau 2 tuần. Nhưng ban đầu bị purging nên phải kiên nhẫn. Overall rất đáng mua!',
    product: 'Retinol 0.5% in Squalane',
    date: '2024-12-15',
  },
  {
    id: '4',
    name: 'Phạm Hoàng Long',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    rating: 5,
    comment:
      'Mua cho vợ dùng, vợ khen ship nhanh, hàng chính hãng. Serum Estée Lauder thơm lắm, da vợ căng mịn hẳn lên.',
    product: 'Advanced Night Repair',
    date: '2024-12-12',
  },
]

// ============================================
// HERO BANNERS
// ============================================
export const mockHeroBanners = [
  {
    id: '1',
    title: 'Winter Sale 2024',
    subtitle: 'Up to 50% Off on Selected Items',
    description: 'Discover amazing deals on premium skincare & makeup',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
    cta: 'Shop Now',
    link: '/products?sale=true',
  },
  {
    id: '2',
    title: 'New Arrivals',
    subtitle: 'Latest Korean Beauty Products',
    description: 'Fresh from Seoul - K-Beauty essentials just landed',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200',
    cta: 'Explore New',
    link: '/products?new=true',
  },
  {
    id: '3',
    title: 'Skincare Essentials',
    subtitle: 'Build Your Perfect Routine',
    description: 'Curated sets for every skin type',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200',
    cta: 'Discover More',
    link: '/categories/skincare',
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export const calculateDiscountedPrice = (
  price: number,
  discount?: number
): number => {
  if (!discount) return price
  return price * (1 - discount / 100)
}
