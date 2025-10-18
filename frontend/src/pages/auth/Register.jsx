import React, { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert, 
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [searchParams] = useSearchParams(); // AGGIUNTO
  const orgIdFromUrl = searchParams.get('orgId'); // AGGIUNTO

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationId: orgIdFromUrl || '', // MODIFICATO: Pre-riempito da URL o vuoto
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(''); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Disabilita la modifica manuale di organizationId se è pre-riempito da URL
    if (name === 'organizationId' && orgIdFromUrl) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Pulisce l'errore specifico e globale quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (globalError) {
        setGlobalError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^[\d\s\-+()]+$/;

    // Validazioni base richieste
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome richiesto';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome richiesto';
    }

    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    // MODIFICATO: organizationId e phone NON sono più richiesti lato client.
    
    // MODIFICATO: Controllo telefono solo se valorizzato (non più richiesto)
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Telefono non valido';
    }
    
    // Validazione Password
    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'La password deve avere almeno 8 caratteri e includere maiuscole, minuscole, un numero e un carattere speciale.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma password richiesta';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setGlobalError('');
    setLoading(true);
    
    try {
      const { confirmPassword, ...userData } = formData;
      
      // La funzione 'register' ora riceve tutti i dati, incluso organizationId
      const result = await register(userData); // Assumiamo che register gestisca gli errori del server
      
      if (!result.success) {
        // Gestione degli errori dal backend (errore 400)
        let errorMessage = result.error || 'Errore di registrazione sconosciuto. Riprova.';

        // Mappa gli errori di campo dal server (es. email già esistente, validazione Joi)
        if (result.fieldErrors && Array.isArray(result.fieldErrors)) {
           const serverErrors = result.fieldErrors.reduce((acc, err) => {
             const fieldName = err.field.split('.').pop(); 
             // Traduzione e pulizia del messaggio di errore Joi
             acc[fieldName] = err.message.replace(/"(firstName|lastName|email|password|phone|organizationId)"/g, (match, p1) => {
                 if (p1 === 'firstName') return 'Nome';
                 if (p1 === 'lastName') return 'Cognome';
                 if (p1 === 'email') return 'Email';
                 if (p1 === 'password') return 'Password';
                 if (p1 === 'phone') return 'Telefono';
                 if (p1 === 'organizationId') return 'ID Organizzazione';
                 return match;
             });
             return acc;
           }, {});
           setErrors(prev => ({ ...prev, ...serverErrors }));
           
           errorMessage = result.error || 'La registrazione è fallita a causa di problemi di validazione.'; 
        }

        setGlobalError(errorMessage);
      }
      
    } catch (error) {
      // Catch per errori non gestiti da AuthContext (es. 500 di rete)
      console.error('Errore durante la registrazione (catch):', error);
      setGlobalError('Errore di connessione o del server. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}
      >
        Registrati
      </Typography>
      
      {/* Mostra eventuali errori globali */}
      {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
              {globalError}
          </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cognome"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Telefono (Opzionale)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* CAMPO MODIFICATO: organizationId */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ID Organizzazione (Opzionale)"
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              error={Boolean(errors.organizationId)}
              helperText={errors.organizationId}
              disabled={loading || Boolean(orgIdFromUrl)} // Disabilita se pre-riempito da URL
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Conferma Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

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
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a428b 100%)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Registrati'
          )}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hai già un account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: '#667eea',
              }}
            >
              Accedi
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Register;