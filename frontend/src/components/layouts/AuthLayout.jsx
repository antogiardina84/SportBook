// ===========================================
// frontend/src/components/layouts/AuthLayout.jsx
// ===========================================

import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { useAuth } from '@hooks/useAuth';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box sx={{ fontSize: 48, mb: 2 }}>🎾</Box>
          </Box>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;