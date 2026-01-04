import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerRoutes } from '@/customer/routes'
import { ThemeProvider } from './shared/components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute } from './shared/components/PublicRoute'
import LoginPage from './customer/pages/LoginPage'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import HomePage from './customer/pages/HomePage'
import DashboardPage from './admin/pages/DashboardPage'
import ProductsPage from './admin/pages/ProductsPage'
import AddProductPage from './admin/pages/AddProductPage'
import ViewProductPage from './admin/pages/ViewProductPage'
import UsersPage from './admin/pages/UsersPage'
import AddUserPage from './admin/pages/AddUserPage'
import ViewUserPage from './admin/pages/ViewUserPage'
import EditUserPage from './admin/pages/EditUserPage'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route
            path='/login'
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path='/home' element={<HomePage />} />

          <Route
            path='/admin/dashboard'
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/products'
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/products/add'
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/products/:id'
            element={
              <ProtectedRoute>
                <ViewProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/users'
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/users/add'
            element={
              <ProtectedRoute>
                <AddUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/users/:id'
            element={
              <ProtectedRoute>
                <ViewUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/users/:id/edit'
            element={
              <ProtectedRoute>
                <EditUserPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path='*' element={<div>404 Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
