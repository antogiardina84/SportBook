// ============================================
// frontend/src/pages/Profile.jsx
// Pagina Gestione Profilo Utente
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      notifications: true,
      newsletter: false,
      smsReminders: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        emergencyContact: user.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        preferences: user.preferences || {
          notifications: true,
          newsletter: false,
          smsReminders: true
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.updateProfile(formData);
      
      updateUser(response.data.user);
      setSuccess('Profilo aggiornato con successo!');
      setEditing(false);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nell\'aggiornamento del profilo');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Le password non corrispondono');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setError('La password deve essere di almeno 8 caratteri');
        return;
      }

      setLoading(true);
      setError(null);

      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password cambiata con successo!');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel cambio password');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Amministratore';
      case 'MANAGER': return 'Manager';
      case 'STAFF': return 'Staff';
      case 'MEMBER': return 'Membro';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'error';
      case 'ADMIN': return 'warning';
      case 'MANAGER': return 'info';
      case 'STAFF': return 'primary';
      case 'MEMBER': return 'success';
      default: return 'default';
    }
  };

  if (!user) {
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
          Il Mio Profilo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestisci le tue informazioni personali e preferenze
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box position="relative" display="inline-block" mb={2}>
                <Avatar
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: -8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>

              <Chip
                label={getRoleLabel(user.role)}
                color={getRoleColor(user.role)}
                size="small"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box textAlign="left">
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                {user.phone && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {user.phone}
                    </Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Membro da {new Date(user.createdAt).toLocaleDateString('it-IT')}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => setPasswordDialog(true)}
              >
                Cambia Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Informazioni Personali
              </Typography>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                >
                  Modifica
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Salva'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cognome"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="+39 123 456 7890"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data di Nascita"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Genere"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editing}
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="">Seleziona</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                  <option value="OTHER">Altro</option>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Contatto di Emergenza
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Telefono"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Relazione"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="es. Genitore, Partner"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Account Statistics */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Statistiche Account
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {user.bookingCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prenotazioni
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {user.hoursPlayed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ore Giocate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    €{user.totalSpent || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Spesa Totale
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {user.loginCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accessi
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => !loading && setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambia Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Password Attuale"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nuova Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              sx={{ mb: 2 }}
              helperText="Minimo 8 caratteri, con maiuscole, minuscole, numeri e caratteri speciali"
            />
            <TextField
              fullWidth
              label="Conferma Nuova Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cambia Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;