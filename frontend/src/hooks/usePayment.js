// ===========================================
// frontend/src/hooks/usePayment.js
// ===========================================

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { paymentsAPI } from '@api/payments';
import { toast } from 'react-toastify';

export const usePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (bookingId) => {
    if (!stripe || !elements) {
      return { success: false, error: 'Stripe non inizializzato' };
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const { data } = await paymentsAPI.createPaymentIntent(bookingId);
      const { clientSecret } = data;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm with backend
        await paymentsAPI.confirmPayment(paymentIntent.id);
        toast.success('Pagamento completato con successo!');
        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Pagamento non completato' };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore nel processare il pagamento';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    stripe,
    elements,
  };
};