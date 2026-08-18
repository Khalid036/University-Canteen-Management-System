import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { ManagerLayout } from './layouts/ManagerLayout';

// Common / Guards
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Student / Teacher Pages
import { MenuBrowsePage } from './pages/student/MenuBrowsePage';
import { CartCheckoutPage } from './pages/student/CartCheckoutPage';
import { OrderHistoryPage } from './pages/student/OrderHistoryPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Manager Pages
import { ManagerDashboardPage } from './pages/manager/ManagerDashboardPage';
import { LiveOrderBoardPage } from './pages/manager/LiveOrderBoardPage';
import { MenuManagementPage } from './pages/manager/MenuManagementPage';
import { CategoryManagementPage } from './pages/manager/CategoryManagementPage';
import { InventoryPage } from './pages/manager/InventoryPage';
import { SalesReportsPage } from './pages/manager/SalesReportsPage';
import { UserManagementPage } from './pages/manager/UserManagementPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Customer Routes (Student & Teacher) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<MenuBrowsePage />} />
            <Route path="/checkout" element={<CartCheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Manager Dedicated Portal */}
        <Route element={<RoleGuard allowedRoles={['MANAGER']} />}>
          <Route element={<ManagerLayout />}>
            <Route path="/manager" element={<LiveOrderBoardPage />} />
            <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/manager/menu" element={<MenuManagementPage />} />
            <Route path="/manager/categories" element={<CategoryManagementPage />} />
            <Route path="/manager/inventory" element={<InventoryPage />} />
            <Route path="/manager/reports" element={<SalesReportsPage />} />
            <Route path="/manager/users" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
