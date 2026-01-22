import { Routes, Route, Navigate } from 'react-router-dom'
import { adminRoutes } from '@/domains/admin/routes'
import { ThemeProvider } from './shared/components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute } from './shared/components/PublicRoute'
import LoginPage from './domains/customer/pages/LoginPage'
import HomePage from './domains/customer/pages/HomePage'
import MaintenancePage from './shared/pages/MaintenancePage'
import NotFoundPage from './shared/pages/NotFoundPage'
import ChatPage from './domains/customer/pages/ChatPage'

function App() {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode) {
    return <MaintenancePage />
  }

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

          <Route path='/chat' element={<ChatPage />} />

          {adminRoutes}
          
          {/* Error routes */}
          <Route path='/maintenance' element={<MaintenancePage />} />

          {/* 404 - Must be last */}
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
