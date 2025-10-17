import React from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

const BookingForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Note"
            multiline
            rows={3}
            {...register('notes')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome Partecipante"
            {...register('participantName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('participantEmail')}
          />
        </Grid>
        <Grid item xs={12}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Elaborazione...' : 'Conferma Prenotazione'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingForm;