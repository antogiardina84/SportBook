// ============================================
// frontend/src/App.jsx
// Main Application Component con Routing Completo
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Hooks
import { useAuth } from './hooks/useAuth';

// Theme Configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9ef5',
      dark: '#4a5bb8',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a74bd',
      dark: '#533471',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Main App Component
function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route
                  path="/login"
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                />
                <Route
                  path="/register"
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <div>User Management Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/fields"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <div>Field Management Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <div>Reports Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
                      <div>Settings Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;