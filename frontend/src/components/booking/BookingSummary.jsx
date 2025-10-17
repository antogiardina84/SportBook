import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import { format } from 'date-fns';

const BookingSummary = ({ field, date, timeSlot, duration, price }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>Riepilogo Prenotazione</Typography>
    <Divider sx={{ my: 2 }} />
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography color="text.secondary">Campo:</Typography>
      <Typography fontWeight="bold">{field?.name}</Typography>
    </Box>
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography color="text.secondary">Data:</Typography>
      <Typography>{date ? format(date, 'dd/MM/yyyy') : '-'}</Typography>
    </Box>
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography color="text.secondary">Orario:</Typography>
      <Typography>{timeSlot || '-'}</Typography>
    </Box>
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography color="text.secondary">Durata:</Typography>
      <Typography>{duration} min</Typography>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Box display="flex" justifyContent="space-between">
      <Typography variant="h6">Totale:</Typography>
      <Typography variant="h6" color="primary">€{price?.toFixed(2)}</Typography>
    </Box>
  </Paper>
);

export default BookingSummary;