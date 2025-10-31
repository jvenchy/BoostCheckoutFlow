import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveOrder, supabase } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, selectedSongs, campaignTiers, selectedAddons, userDetails } = body;

    // Save order to database with pending status first to get order_id
    let orderId = null;
    try {
      const order = await saveOrder({
        songs: selectedSongs,
        campaignTiers: campaignTiers,
        selectedAddons: selectedAddons || [],
        userEmail: userDetails.email,
        userFirstName: userDetails.firstName,
        userLastName: userDetails.lastName,
        totalAmount: amount / 100, // Convert cents back to dollars
        stripePaymentIntentId: null, // Will be updated after payment intent creation
      });
      orderId = order.id;
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: orderId,
        user_email: userDetails.email,
        user_name: `${userDetails.firstName} ${userDetails.lastName}`,
        song_count: selectedSongs.length.toString(),
      },
    });

    // Update order with payment intent ID
    try {
      await supabase
        .from('orders')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', orderId);
    } catch (updateError) {
      console.error('Failed to update order with payment intent ID:', updateError);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}