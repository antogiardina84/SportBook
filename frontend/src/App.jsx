// ============================================
// frontend/src/App.jsx
// VERSIONE FINALE CORRETTA - Router prima di AuthProvider
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Context Provider
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/layouts/Header';
import Footer from './components/common/Footer';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Bookings Pages
import BookingCreate from './pages/bookings/BookingCreate';
import BookingDetail from './pages/bookings/BookingDetail';

// Fields Pages
import FieldList from './pages/fields/FieldList';
import FieldDetail from './pages/fields/FieldDetail';

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
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router> {/* ✅ Router PRIMA */}
          <AuthProvider> {/* ✅ AuthProvider DOPO - può usare useNavigate */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

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
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/bookings/new"
                    element={
                      <ProtectedRoute>
                        <BookingCreate />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/bookings/:id"
                    element={
                      <ProtectedRoute>
                        <BookingDetail />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/fields"
                    element={
                      <ProtectedRoute>
                        <FieldList />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/fields/:id"
                    element={
                      <ProtectedRoute>
                        <FieldDetail />
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

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              
              <Footer />
            </div>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;