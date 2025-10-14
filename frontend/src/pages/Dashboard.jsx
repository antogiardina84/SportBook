// ===========================================
// frontend/src/pages/Dashboard.jsx
// ===========================================

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import {
  EventNote,
  SportsTennis,
  Payment,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useBookings } from '@hooks/useBookings';
import { formatCurrency, formatDate } from '@utils/formatters';
import Loading from '@components/common/Loading';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useBookings({ page: 1, limit: 5 });

  if (isLoading) return <Loading />;

  const stats = [
    {
      title: 'Prenotazioni Attive',
      value: data?.data?.bookings?.filter(b => b.status === 'CONFIRMED').length || 0,
      icon: <EventNote sx={{ fontSize: 40 }} />,
      color: '#667eea',
    },
    {
      title: 'Campi Disponibili',
      value: '4',
      icon: <SportsTennis sx={{ fontSize: 40 }} />,
      color: '#10b981',
    },
    {
      title: 'Spesa Mensile',
      value: formatCurrency(145.50),
      icon: <Payment sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Ore Giocate',
      value: '12h',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Ciao, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Benvenuto nel tuo dashboard
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Prenotazioni Recenti
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/fields')}
                >
                  Nuova Prenotazione
                </Button>
              </Box>

              {data?.data?.bookings?.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  Nessuna prenotazione ancora
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data?.data?.bookings?.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {booking.field.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(booking.startTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={booking.status}
                          color={booking.status === 'CONFIRMED' ? 'success' : 'default'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(booking.totalAmount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Azioni Rapide
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/fields')}
                >
                  Prenota Campo
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/bookings')}
                >
                  Le Mie Prenotazioni
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/profile')}
                >
                  Modifica Profilo
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;