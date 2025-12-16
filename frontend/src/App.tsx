import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerRoutes } from '@/customer/routes'
import { ThemeProvider } from './shared/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />

        <Route path='/*' element={<CustomerRoutes />} />

        {/* 404 Not Found */}
        <Route path='*' element={<div>404 Page Not Found</div>} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
