import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import WishlistPage from './pages/WishListPage'
import CartPage from './pages/CartPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentReturnPage from './pages/PaymentReturnPage'
import { ProductsPage } from './pages/ProductsPage'

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='/wishlist' element={<WishlistPage />} />
      <Route path='/cart' element={<CartPage />} />
      <Route path='/orders' element={<OrderHistoryPage />} />
      <Route path='/orders/:id' element={<OrderDetailPage />} />
      <Route path='/checkout' element={<CheckoutPage />} />
      <Route path='/payment/return' element={<PaymentReturnPage />} />
      <Route path='/products' element={<ProductsPage />} />
    </Routes>
  )
}
