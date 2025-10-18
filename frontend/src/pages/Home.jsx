// ============================================
// frontend/src/pages/Home.jsx
// Home Page - Landing Page
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent 
} from '@mui/material';
import { 
  SportsTennis, 
  EventNote, 
  Payment, 
  Security 
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SportsTennis sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Gestione Campi',
      description: 'Prenota facilmente campi da tennis e padel'
    },
    {
      icon: <EventNote sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Prenotazioni Online',
      description: 'Sistema di prenotazione rapido e intuitivo'
    },
    {
      icon: <Payment sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Pagamenti Sicuri',
      description: 'Pagamenti online protetti e certificati'
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Dati Protetti',
      description: 'Massima sicurezza per i tuoi dati personali'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            🎾 SportBook
          </Typography>
          <Typography variant="h5" mb={4}>
            Sistema di Gestione Campi Sportivi
          </Typography>
          <Typography variant="body1" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
            Prenota i tuoi campi da tennis e padel in modo semplice e veloce. 
            Gestisci le tue prenotazioni con un click!
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                mr: 2,
                '&:hover': { bgcolor: '#f0f0f0' }
              }}
            >
              Registrati Ora
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Accedi
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" mb={6}>
          Perché scegliere SportBook?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box mb={2}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f9fafb', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pronto per iniziare?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Crea un account gratuito e inizia a prenotare i tuoi campi oggi stesso!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Inizia Gratuitamente
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;