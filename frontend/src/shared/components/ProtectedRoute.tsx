/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Shows loading state while checking auth
 * - Optional role-based access control
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string // Optional: 'ADMIN', 'CUSTOMER', etc.
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth()

  // Loading State
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

  // Not Authenticated - Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to='/login' replace />
  }

  // Role-Based Access Control (Optional)
  if (requiredRole && user.role.name !== requiredRole) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4 p-8'>
          <div className='text-6xl'>🚫</div>
          <h1 className='text-2xl font-bold text-foreground'>Access Denied</h1>
          <p className='text-muted-foreground'>
            You don't have permission to access this page.
          </p>
          <p className='text-sm text-muted-foreground'>
            Required role: <span className='font-semibold'>{requiredRole}</span>
            <br />
            Your role: <span className='font-semibold'>{user.role.name}</span>
          </p>
        </div>
      </div>
    )
  }

  // Authenticated - Render Children
  return <>{children}</>
}

/**
 * Usage Examples:
 *
 * // Basic protection - any authenticated user
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 *
 * // Role-based protection - only admin
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole="ADMIN">
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 */
