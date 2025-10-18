// ============================================
// frontend/src/components/common/Footer.jsx
// Footer Component
// ============================================

import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { SportsTennis } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a202c',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <SportsTennis sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h6" fontWeight="bold">
                SportBook
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400">
              Sistema di gestione campi sportivi per tennis e padel.
              Prenota facilmente il tuo campo preferito!
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Link Rapidi
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/" color="grey.400" underline="hover">
                Home
              </Link>
              <Link href="/fields" color="grey.400" underline="hover">
                Campi Disponibili
              </Link>
              <Link href="/bookings" color="grey.400" underline="hover">
                Le Mie Prenotazioni
              </Link>
              <Link href="/dashboard" color="grey.400" underline="hover">
                Dashboard
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contatti
            </Typography>
            <Typography variant="body2" color="grey.400" mb={1}>
              Email: info@sportbook.it
            </Typography>
            <Typography variant="body2" color="grey.400" mb={1}>
              Tel: +39 123 456 7890
            </Typography>
            <Typography variant="body2" color="grey.400">
              Via Roma 123, Milano, IT
            </Typography>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'grey.700',
            mt: 4,
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {currentYear} SportBook. Tutti i diritti riservati.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;