import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack } from '@mui/icons-material';
import api from '@api/axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email richiesta');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email non valida');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Email di reset inviata!');
    } catch (err) {
      const message = err.response?.data?.message || 'Errore durante l\'invio';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 2 }}>
          Email Inviata!
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Abbiamo inviato un link per il reset della password a <strong>{email}</strong>.
          Controlla la tua casella di posta.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          fullWidth
          variant="outlined"
          startIcon={<ArrowBack />}
        >
          Torna al Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
        Password Dimenticata?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Inserisci la tua email e ti invieremo un link per resettare la password
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={Boolean(error)}
          helperText={error}
          disabled={loading}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Invia Link di Reset'}
        </Button>

        <Button
          component={RouterLink}
          to="/login"
          fullWidth
          variant="text"
          startIcon={<ArrowBack />}
        >
          Torna al Login
        </Button>
      </form>
    </Box>
  );
};

export default ForgotPassword;