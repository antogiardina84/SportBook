// ============================================
// frontend/src/pages/NotFound.jsx
// Pagina 404 - Pagina Non Trovata
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            maxWidth: 600,
            width: '100%'
          }}
        >
          {/* 404 Icon */}
          <Box mb={3}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', md: '8rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              404
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pagina Non Trovata
          </Typography>

          {/* Description */}
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Ops! La pagina che stai cercando non esiste o è stata spostata.
            Verifica l'URL o torna alla homepage.
          </Typography>

          {/* Action Buttons */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8c 100%)'
                }
              }}
            >
              Vai alla Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Torna Indietro
            </Button>
          </Box>

          {/* Additional Help */}
          <Box mt={4} pt={3} borderTop={1} borderColor="divider">
            <Typography variant="body2" color="text.secondary">
              Hai bisogno di aiuto? Contatta il nostro supporto
            </Typography>
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => navigate('/contact')}
            >
              Contattaci
            </Button>
          </Box>
        </Paper>

        {/* Decorative Elements */}
        <Box mt={4}>
          <Typography variant="caption" color="text.secondary">
            🎾 SportBook - Sistema di Gestione Prenotazioni
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;