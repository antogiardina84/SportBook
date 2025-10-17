import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { bookingApi } from '@api/bookings';
import { formatDateTime, formatCurrency, getStatusColor, getStatusLabel } from '@utils/formatters';

const BookingList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingApi.getMyBookings(filters),
  });

  const bookings = data?.data?.bookings || [];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Le Mie Prenotazioni
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/bookings/new')}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }}
        >
          Nuova Prenotazione
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtri</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Stato"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Tutti</MenuItem>
                <MenuItem value="PENDING">In Attesa</MenuItem>
                <MenuItem value="CONFIRMED">Confermata</MenuItem>
                <MenuItem value="CANCELLED">Annullata</MenuItem>
                <MenuItem value="COMPLETED">Completata</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Data Inizio"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Data Fine"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Errore nel caricamento delle prenotazioni
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Nessuna prenotazione trovata
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Crea la tua prima prenotazione per iniziare
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/bookings/new')}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                Nuova Prenotazione
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {booking.field.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        📅 {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' ')[1]}
                      </Typography>
                      <Chip
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                        {formatCurrency(booking.totalAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.field.fieldType}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BookingList;