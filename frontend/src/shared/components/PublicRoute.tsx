/**
 * Public Route Component
 * Redirects authenticated users away from public pages (login/register)
 *
 * Use Case:
 * - Login page: If already logged in → redirect to home
 * - Register page: If already logged in → redirect to home
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string // Default: '/home'
}

export const PublicRoute = ({
  children,
  redirectTo = '/home',
}: PublicRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth()

  console.log('🔍 PublicRoute Debug:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    email: user?.email,
  })

  // Loading State - Show spinner
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-12 h-12 animate-spin text-primary mx-auto' />
          <p className='text-muted-foreground text-sm'>Loading...</p>
        </div>
      </div>
    )
  }

  // Already Authenticated - Redirect to Home
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />
  }

  // Not Authenticated - Show Page (Login/Register)
  return <>{children}</>
}

/**
 * Usage Example:
 *
 * // In App.tsx or routes
 * <Route
 *   path="/login"
 *   element={
 *     <PublicRoute>
 *       <LoginPage />
 *     </PublicRoute>
 *   }
 * />
 *
 * <Route
 *   path="/register"
 *   element={
 *     <PublicRoute>
 *       <RegisterPage />
 *     </PublicRoute>
 *   }
 * />
 *
 * // With custom redirect
 * <Route
 *   path="/login"
 *   element={
 *     <PublicRoute redirectTo="/dashboard">
 *       <LoginPage />
 *     </PublicRoute>
 *   }
 * />
 */
