import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { bookingApi } from '@api/bookings';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '@utils/formatters';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingApi.getById(id),
  });

  const booking = data?.data?.booking;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) {
    return <Typography>Prenotazione non trovata</Typography>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/bookings')} sx={{ mb: 2 }}>
        Indietro
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Dettaglio Prenotazione
      </Typography>

      <Card>
        <CardContent>
          <Box mb={3}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {booking.field.name}
            </Typography>
            <Chip label={getStatusLabel(booking.status)} color={getStatusColor(booking.status)} />
          </Box>

          <Typography variant="body1" gutterBottom>
            <strong>Data e Ora:</strong> {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' ')[1]}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Tipo Campo:</strong> {booking.field.fieldType}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Partecipanti:</strong> {booking.participants}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Totale:</strong> {formatCurrency(booking.totalAmount)}
          </Typography>
          {booking.notes && (
            <Typography variant="body1" gutterBottom>
              <strong>Note:</strong> {booking.notes}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingDetail;