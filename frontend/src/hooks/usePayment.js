// ============================================
// frontend/src/hooks/usePayment.js
// Hook per Gestione Pagamenti Stripe
// ============================================

import { useState, useCallback } from 'react';
import { paymentsAPI } from '../api/payments';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

export const usePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // Create payment intent
  const createPaymentIntent = async (amount, bookingId, metadata = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const response = await paymentsAPI.createPaymentIntent({
        amount,
        bookingId,
        metadata
      });

      setPaymentIntent(response.data.paymentIntent);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nella creazione del pagamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Process payment with card
  const processPayment = async (clientSecret, billingDetails = {}) => {
    if (!stripe || !elements) {
      return { success: false, error: 'Stripe non inizializzato' };
    }

    try {
      setProcessing(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return { success: false, error: stripeError.message };
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentsAPI.confirmPayment({
          paymentIntentId: paymentIntent.id
        });

        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Pagamento non completato' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nel processamento del pagamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Get payment methods
  const getPaymentMethods = async () => {
    try {
      const response = await paymentsAPI.getPaymentMethods();
      return { success: true, data: response.data.paymentMethods || [] };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethodData) => {
    try {
      setProcessing(true);
      setError(null);

      const response = await paymentsAPI.addPaymentMethod(paymentMethodData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nell\'aggiunta del metodo di pagamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId) => {
    try {
      setProcessing(true);
      setError(null);

      await paymentsAPI.removePaymentMethod(paymentMethodId);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nella rimozione del metodo di pagamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      setProcessing(true);
      setError(null);

      await paymentsAPI.setDefaultPaymentMethod(paymentMethodId);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nell\'impostazione del metodo predefinito';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Request refund
  const requestRefund = async (paymentId, reason) => {
    try {
      setProcessing(true);
      setError(null);

      const response = await paymentsAPI.requestRefund(paymentId, { reason });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nella richiesta di rimborso';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  };

  // Get payment history
  const getPaymentHistory = async (filters = {}) => {
    try {
      const response = await paymentsAPI.getMyPayments(filters);
      return { success: true, data: response.data.payments || [] };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Validate card
  const validateCard = useCallback(() => {
    if (!elements) return false;
    
    const cardElement = elements.getElement(CardElement);
    return cardElement !== null;
  }, [elements]);

  return {
    processing,
    error,
    paymentIntent,
    createPaymentIntent,
    processPayment,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    requestRefund,
    getPaymentHistory,
    validateCard,
    isReady: stripe !== null && elements !== null
  };
};

export default usePayment;