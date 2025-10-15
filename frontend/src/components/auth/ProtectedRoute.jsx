// ===========================================
// frontend/src/components/common/ProtectedRoute.jsx
// ===========================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import Loading from '../common/Loading';

const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;