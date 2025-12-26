import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerRoutes } from '@/customer/routes'
import { ThemeProvider } from './shared/components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute } from './shared/components/PublicRoute'
import LoginPage from './customer/pages/LoginPage'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import HomePage from './customer/pages/HomePage'

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

          {/* 404 Not Found */}
          <Route path='*' element={<div>404 Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
