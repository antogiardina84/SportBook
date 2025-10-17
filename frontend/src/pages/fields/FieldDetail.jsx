import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, Button, Chip, CircularProgress, Grid } from '@mui/material';
import { ArrowBack, EventNote } from '@mui/icons-material';
import { fieldApi } from '@api/fields';
import { getFieldTypeLabel } from '@utils/formatters';

const FieldDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['field', id],
    queryFn: () => fieldApi.getById(id),
  });

  const field = data?.data?.field;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!field) {
    return <Typography>Campo non trovato</Typography>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/fields')} sx={{ mb: 2 }}>
        Indietro
      </Button>

      <Card>
        <Box
          sx={{
            height: 300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            {field.name}
          </Typography>

          <Box display="flex" gap={1} mb={3}>
            <Chip label={getFieldTypeLabel(field.fieldType)} color="primary" />
            <Chip label={field.surface} variant="outlined" />
            <Chip label={field.indoor ? 'Indoor' : 'Outdoor'} variant="outlined" />
          </Box>

          <Typography variant="body1" paragraph>
            {field.description || 'Campo sportivo disponibile per prenotazioni'}
          </Typography>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Durata Minima: {field.minBookingDuration} minuti
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Durata Massima: {field.maxBookingDuration} minuti
              </Typography>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            startIcon={<EventNote />}
            onClick={() => navigate('/bookings/new')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
            }}
          >
            Prenota Questo Campo
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FieldDetail;