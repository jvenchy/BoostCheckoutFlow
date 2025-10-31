import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount } = body;

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Payment intent ID and amount are required' },
        { status: 400 }
      );
    }

    // Update the PaymentIntent with the new amount
    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      {
        amount: amount, // Amount in cents
      }
    );

    return NextResponse.json({
      success: true,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Stripe update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment intent' },
      { status: 500 }
    );
  }
}
