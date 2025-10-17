import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EventNote as BookingIcon,
  SportsTennis as FieldIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { bookingsAPI as bookingApi } from '@api/bookings';
import { formatCurrency, formatDateTime } from '@utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['my-bookings', { status: 'PENDING,CONFIRMED', limit: 5 }],
    queryFn: () => bookingApi.getMyBookings({ status: 'PENDING,CONFIRMED', limit: 5 }),
  });

  const upcomingBookings = bookingsData?.data?.bookings || [];

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}15`,
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Benvenuto, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ecco una panoramica delle tue attività
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/bookings/new')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
          }}
        >
          Nuova Prenotazione
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Prenotazioni Attive"
            value={upcomingBookings.length}
            icon={<BookingIcon sx={{ fontSize: 32 }} />}
            color="#667eea"
            onClick={() => navigate('/bookings')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Campi Disponibili"
            value="8"
            icon={<FieldIcon sx={{ fontSize: 32 }} />}
            color="#f093fb"
            onClick={() => navigate('/fields')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Questo Mese"
            value={formatCurrency(0)}
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Upcoming Bookings */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Prossime Prenotazioni
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/bookings')}
              sx={{ color: '#667eea' }}
            >
              Vedi Tutte
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Errore nel caricamento delle prenotazioni
            </Alert>
          )}

          {upcomingBookings.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" gutterBottom>
                Non hai prenotazioni in programma
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/bookings/new')}
                sx={{ mt: 2 }}
              >
                Crea la tua prima prenotazione
              </Button>
            </Box>
          ) : (
            <Box>
              {upcomingBookings.map((booking) => (
                <Box
                  key={booking.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {booking.field.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' ')[1]}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {formatCurrency(booking.totalAmount)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: booking.status === 'CONFIRMED' ? '#4caf5015' : '#ff980015',
                          color: booking.status === 'CONFIRMED' ? '#4caf50' : '#ff9800',
                          fontWeight: 600,
                        }}
                      >
                        {booking.status === 'CONFIRMED' ? 'Confermata' : 'In Attesa'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;