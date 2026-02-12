import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import WishlistPage from './pages/WishListPage'
import CartPage from './pages/CartPage'
import OrderHistoryPage from './pages/OrderHistoryPage'

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='/wishlist' element={<WishlistPage />} />
      <Route path='/cart' element={<CartPage />} />
      <Route path='/orders' element={<OrderHistoryPage />} />
    </Routes>
  )
}
