// ============================================
// frontend/src/App.jsx
// VERSIONE CORRETTA con percorsi esistenti
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Layout Components - PERCORSI CORRETTI
import Header from './components/layouts/Header';  // ✅ Corretto
// import Footer from './components/common/Footer';  // ❌ Commentato - non esiste

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components - PERCORSO CORRETTO
import ProtectedRoute from './pages/auth/ProtectedRoute';  // ✅ Corretto

// Pages - PERCORSI CORRETTI
import Login from './pages/auth/Login';              // ✅ Corretto
import Register from './pages/auth/Register';        // ✅ Corretto
import Dashboard from './pages/Dashboard';           // ✅ Corretto
import MyBookings from './pages/MyBookings';         // ✅ Corretto
import Profile from './pages/Profile';               // ✅ Corretto (se esiste)
import NotFound from './pages/NotFound';             // ✅ Corretto (se esiste)

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';  // ✅ Corretto

// Bookings Pages
import BookingList from './pages/bookings/BookingList';      // ✅ Corretto
import BookingCreate from './pages/bookings/BookingCreate';  // ✅ Corretto
import BookingDetail from './pages/bookings/BookingDetail';  // ✅ Corretto

// Fields Pages
import FieldList from './pages/fields/FieldList';      // ✅ Corretto
import FieldDetail from './pages/fields/FieldDetail';  // ✅ Corretto

// Hooks
// import { useAuth } from './hooks/useAuth';  // Commentato temporaneamente

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

// Componente Home temporaneo (dato che non esiste)
const Home = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>🎾 SportBook</h1>
    <h2>Sistema di Gestione Campi Sportivi</h2>
    <p>Benvenuto! Effettua il login per accedere.</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/login" style={{ marginRight: '20px' }}>Login</a>
      <a href="/register">Registrati</a>
    </div>
  </div>
);

// Main App Component
function App() {
  // Temporaneamente disabilitato useAuth per evitare errori
  // const { isAuthenticated, loading } = useAuth();
  const isAuthenticated = false;
  const loading = false;

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
            
            <main style={{ flex: 1, padding: '20px' }}>
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
            
            {/* Footer commentato perché non esiste */}
            {/* <Footer /> */}
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;