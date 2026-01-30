import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import WishlistPage from './pages/WishListPage'
import CartPage from './pages/CartPage'

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='/wishlist' element={<WishlistPage />} />
      <Route path='/cart' element={<CartPage />} />
    </Routes>
  )
}
