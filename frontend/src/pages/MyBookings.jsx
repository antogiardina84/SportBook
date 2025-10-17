// ============================================
// frontend/src/pages/MyBookings.jsx
// Pagina Lista Prenotazioni Utente
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  SportsTennis as TennisIcon,
  LocationOn as LocationIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { it } from 'date-fns/locale';
import { bookingsAPI as bookingAPI } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: Future, 1: Past, 2: Cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, booking: null });
  const [cancelling, setCancelling] = useState(false);

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings when tab or search changes
  useEffect(() => {
    filterBookings();
  }, [bookings, tabValue, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento delle prenotazioni');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status/time
    if (tabValue === 0) {
      // Future bookings
      filtered = filtered.filter(b => 
        b.status !== 'CANCELLED' && isFuture(parseISO(b.startTime))
      );
    } else if (tabValue === 1) {
      // Past bookings
      filtered = filtered.filter(b => 
        b.status !== 'CANCELLED' && isPast(parseISO(b.startTime))
      );
    } else if (tabValue === 2) {
      // Cancelled bookings
      filtered = filtered.filter(b => b.status === 'CANCELLED');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first for past, soonest first for future)
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return tabValue === 1 ? dateB - dateA : dateA - dateB;
    });

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!cancelDialog.booking) return;

    try {
      setCancelling(true);
      await bookingAPI.cancelBooking(cancelDialog.booking.id);
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === cancelDialog.booking.id 
          ? { ...b, status: 'CANCELLED' }
          : b
      ));
      
      setCancelDialog({ open: false, booking: null });
      
      // Show success message (you can add a Snackbar here)
      alert('Prenotazione cancellata con successo');
      
    } catch (err) {
      alert(err.response?.data?.message || 'Errore nella cancellazione');
      console.error('Cancel booking error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confermata';
      case 'PENDING': return 'In Attesa';
      case 'CANCELLED': return 'Cancellata';
      case 'COMPLETED': return 'Completata';
      default: return status;
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status === 'CANCELLED') return false;
    
    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    // Can cancel if booking is at least 24 hours away (configurable)
    const cancellationHours = booking.field.cancellationHours || 24;
    return hoursUntilBooking >= cancellationHours;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Le Mie Prenotazioni
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestisci le tue prenotazioni di campi sportivi
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Cerca per campo o numero prenotazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={() => navigate('/booking')}
              >
                Nuova Prenotazione
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab 
            label={`Prossime (${bookings.filter(b => b.status !== 'CANCELLED' && isFuture(parseISO(b.startTime))).length})`} 
          />
          <Tab 
            label={`Passate (${bookings.filter(b => b.status !== 'CANCELLED' && isPast(parseISO(b.startTime))).length})`} 
          />
          <Tab 
            label={`Cancellate (${bookings.filter(b => b.status === 'CANCELLED').length})`} 
          />
        </Tabs>
      </Paper>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nessuna prenotazione trovata
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {tabValue === 0 && "Non hai prenotazioni future al momento"}
            {tabValue === 1 && "Non hai ancora completato nessuna prenotazione"}
            {tabValue === 2 && "Non hai prenotazioni cancellate"}
          </Typography>
          {tabValue === 0 && (
            <Button 
              variant="contained" 
              startIcon={<EventIcon />}
              onClick={() => navigate('/booking')}
            >
              Crea una Prenotazione
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {booking.field.name}
                      </Typography>
                      <Chip 
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                      <Chip 
                        label={booking.field.fieldType}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      #{booking.bookingNumber}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {format(parseISO(booking.startTime), 'EEEE, d MMMM yyyy', { locale: it })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                          <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                            ({booking.duration} min)
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {booking.field.description || 'Campo sportivo'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="bold">
                          €{booking.totalAmount.toFixed(2)}
                        </Typography>
                        {booking.payment?.status === 'COMPLETED' && (
                          <Chip label="Pagato" color="success" size="small" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {booking.notes && (
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> {booking.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    Dettagli
                  </Button>
                  
                  {canCancelBooking(booking) && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelDialog({ open: true, booking })}
                    >
                      Cancella
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => !cancelling && setCancelDialog({ open: false, booking: null })}
      >
        <DialogTitle>Conferma Cancellazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler cancellare questa prenotazione?
            {cancelDialog.booking && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Campo:</strong> {cancelDialog.booking.field.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Data:</strong> {format(parseISO(cancelDialog.booking.startTime), 'dd/MM/yyyy HH:mm')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Importo:</strong> €{cancelDialog.booking.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            La prenotazione verrà cancellata e riceverai un rimborso secondo le policy di cancellazione.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialog({ open: false, booking: null })}
            disabled={cancelling}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Conferma Cancellazione'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookings;