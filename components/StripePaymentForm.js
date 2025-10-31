'use client';

import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../app/lib/stripe';

function CheckoutForm({ total, onSuccess, isProcessing, setIsProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            style: {
              base: {
                color: '#ffffff',
                fontSize: '16px',
                '::placeholder': {
                  color: '#6b7280',
                },
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className={`w-full py-5 rounded-xl font-bold text-lg transition-all ${
          isProcessing || !stripe || !elements
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-300 text-black hover:shadow-lg cursor-pointer'
        }`}
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, total, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    getStripe().then(stripe => setStripePromise(stripe));
  }, []);

  if (!clientSecret || !stripePromise) {
    return (
      <div className="text-center text-gray-400 py-8">
        Loading payment form...
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#fbbf24',
        colorBackground: '#000000',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        total={total}
        onSuccess={onSuccess}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
}
