/**
 * useAuth Hook
 * Convenient hook to access auth context
 *
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */

import { AuthContext } from '@/context/AuthContext'
import { useContext } from 'react'

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Example Usage:
 *
 * function ProfilePage() {
 *   const { user, logout, isLoading } = useAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!user) return <Navigate to="/login" />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.full_name}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 */
