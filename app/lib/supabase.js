import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to save order to database
export async function saveOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        songs: orderData.songs,
        campaign_tiers: orderData.campaignTiers,
        selected_addons: orderData.selectedAddons || [],
        user_email: orderData.userEmail,
        user_first_name: orderData.userFirstName,
        user_last_name: orderData.userLastName,
        total_amount: orderData.totalAmount,
        stripe_payment_intent_id: orderData.stripePaymentIntentId,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }

  return data[0];
}

/*
  SQL Schema for Supabase orders table:

  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    songs JSONB NOT NULL,
    campaign_tiers JSONB NOT NULL,
    selected_addons JSONB DEFAULT '[]'::jsonb,
    user_email TEXT NOT NULL,
    user_first_name TEXT NOT NULL,
    user_last_name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create index on user_email for faster lookups
  CREATE INDEX idx_orders_user_email ON orders(user_email);

  -- Create index on status for filtering
  CREATE INDEX idx_orders_status ON orders(status);

  -- Create index on stripe_payment_intent_id for webhook lookups
  CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

  -- Create updated_at trigger
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/