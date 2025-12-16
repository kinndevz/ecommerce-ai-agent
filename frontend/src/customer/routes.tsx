import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

// Ví dụ một trang khác
const HomePage = () => <div className='p-10'>Customer Home Page</div>

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='home' element={<HomePage />} />
    </Routes>
  )
}
