import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tantml:react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { fieldApi } from '@api/fields';
import { bookingApi } from '@api/bookings';
import { toast } from 'react-toastify';

const BookingCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fieldId: '',
    date: '',
    startTime: '',
    duration: 60,
    participants: 1,
    notes: '',
  });

  const { data: fieldsData } = useQuery({
    queryKey: ['fields'],
    queryFn: () => fieldApi.getAll({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: () => {
      toast.success('Prenotazione creata con successo!');
      navigate('/bookings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Errore nella creazione');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const startDateTime = `${formData.date}T${formData.startTime}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + formData.duration * 60000).toISOString();
    
    createMutation.mutate({
      fieldId: formData.fieldId,
      startTime: startDateTime,
      endTime: endDateTime,
      participants: formData.participants,
      notes: formData.notes,
    });
  };

  const fields = fieldsData?.data?.fields || [];

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/bookings')}
        sx={{ mb: 2 }}
      >
        Indietro
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Nuova Prenotazione
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Campo"
                  value={formData.fieldId}
                  onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                  required
                >
                  {fields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.name} - {field.fieldType}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Ora Inizio"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Durata (minuti)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <MenuItem value={30}>30 minuti</MenuItem>
                  <MenuItem value={60}>1 ora</MenuItem>
                  <MenuItem value={90}>1.5 ore</MenuItem>
                  <MenuItem value={120}>2 ore</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Partecipanti"
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Note"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={createMutation.isLoading}
                  sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }}
                >
                  {createMutation.isLoading ? <CircularProgress size={24} /> : 'Crea Prenotazione'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingCreate;