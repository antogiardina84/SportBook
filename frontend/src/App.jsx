// ===========================================
// frontend/src/App.jsx
// ===========================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Pages
import Home from '@pages/Home';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Bookings from '@pages/Bookings';
import Fields from '@pages/Fields';
import Profile from '@pages/Profile';
import NotFound from '@pages/NotFound';

// Admin Pages
import AdminDashboard from '@pages/admin/AdminDashboard';
import AdminUsers from '@pages/admin/AdminUsers';
import AdminFields from '@pages/admin/AdminFields';
import AdminBookings from '@pages/admin/AdminBookings';
import AdminSettings from '@pages/admin/AdminSettings';

// Components
import ProtectedRoute from '@components/common/ProtectedRoute';
import Loading from '@components/common/Loading';

function App() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          {user?.role === 'ADMIN' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/fields" element={<AdminFields />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </>
          )}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;