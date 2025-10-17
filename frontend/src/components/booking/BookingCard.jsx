import React from 'react';
import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import { Event, AccessTime, Cancel } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const BookingCard = ({ booking, onCancel }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">{booking.field.name}</Typography>
        <Chip label={booking.status} color="primary" size="small" />
      </Box>
      <Box display="flex" gap={2} mt={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Event fontSize="small" />
          <Typography variant="body2">
            {format(parseISO(booking.startTime), 'dd/MM/yyyy')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <AccessTime fontSize="small" />
          <Typography variant="body2">
            {format(parseISO(booking.startTime), 'HH:mm')}
          </Typography>
        </Box>
      </Box>
      {onCancel && (
        <IconButton onClick={() => onCancel(booking.id)} color="error" sx={{ mt: 1 }}>
          <Cancel />
        </IconButton>
      )}
    </CardContent>
  </Card>
);

export default BookingCard;