import { Route } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProductsPage from './pages/product/ProductsPage'
import AddProductPage from './pages/product/AddProductPage'
import EditProductPage from './pages/product/EditProductPage'
import ViewProductPage from './pages/product/ViewProductPage'
import UsersPage from './pages/user/UsersPage'
import AddUserPage from './pages/user/AddUserPage'
import ViewUserPage from './pages/user/ViewUserPage'
import EditUserPage from './pages/user/EditUserPage'
import RolesPermissionsPage from './pages/role/RolesPermissionsPage'
import BrandsPage from './pages/brand/BrandsPage'
import AddBrandPage from './pages/brand/AddBrandPage'
import ViewBrandPage from './pages/brand/ViewBrandPage'
import EditBrandPage from './pages/brand/EditBrandPage'
import CategoriesPage from './pages/category/CategoriesPage'
import AddCategoryPage from './pages/category/AddCategoryPage'
import ViewCategoryPage from './pages/category/ViewCategoryPage'
import EditCategoryPage from './pages/category/EditCategoryPage'
import OrdersPage from './pages/order/OrdersPage'
import ViewOrderPage from './pages/order/ViewOrderPage'
import NotificationsPage from './pages/notification/NotificationsPage'

export const adminRoutes = (
  <>
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
      path='/admin/products/:id/edit'
      element={
        <ProtectedRoute>
          <EditProductPage />
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
    <Route
      path='/admin/roles'
      element={
        <ProtectedRoute>
          <RolesPermissionsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/brands'
      element={
        <ProtectedRoute>
          <BrandsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/brands/add'
      element={
        <ProtectedRoute>
          <AddBrandPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/brands/:id'
      element={
        <ProtectedRoute>
          <ViewBrandPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/brands/:id/edit'
      element={
        <ProtectedRoute>
          <EditBrandPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/categories'
      element={
        <ProtectedRoute>
          <CategoriesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/categories/add'
      element={
        <ProtectedRoute>
          <AddCategoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/categories/:id'
      element={
        <ProtectedRoute>
          <ViewCategoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/categories/:id/edit'
      element={
        <ProtectedRoute>
          <EditCategoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/orders'
      element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/orders/:id'
      element={
        <ProtectedRoute>
          <ViewOrderPage />
        </ProtectedRoute>
      }
    />
    <Route
      path='/admin/notifications'
      element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      }
    />
  </>
)
