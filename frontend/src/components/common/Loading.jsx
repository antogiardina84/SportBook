// ============================================
// frontend/src/components/common/Loading.jsx
// Componente Loading Universale
// ============================================

import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

const Loading = ({ 
  fullScreen = false, 
  message = 'Caricamento...', 
  variant = 'circular',
  size = 'medium' 
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };

  if (variant === 'linear') {
    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress />
        {message && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={fullScreen ? { minHeight: '100vh' } : { minHeight: '200px', py: 4 }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
};

// Skeleton loading component
export const SkeletonLoading = ({ rows = 3, height = 60 }) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            height,
            bgcolor: 'grey.200',
            borderRadius: 1,
            mb: 2,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Inline loading (for buttons)
export const InlineLoading = ({ size = 20 }) => {
  return <CircularProgress size={size} color="inherit" />;
};

export default Loading;