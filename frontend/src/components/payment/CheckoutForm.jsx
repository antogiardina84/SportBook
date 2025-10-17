import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock } from '@mui/icons-material';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' }
    },
    invalid: { color: '#9e2146' }
  }
};

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError);
      } else {
        onSuccess?.(paymentMethod);
      }
    } catch (err) {
      setError('Errore nel processamento del pagamento');
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Dettagli Pagamento</Typography>
      
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
        size="large"
      >
        {processing ? 'Elaborazione...' : `Paga €${amount.toFixed(2)}`}
      </Button>

      <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
        🔒 Pagamento sicuro con Stripe
      </Typography>
    </Box>
  );
};

export default CheckoutForm;