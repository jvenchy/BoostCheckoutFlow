# Stripe Test Mode Setup Guide

## Prerequisites
- Stripe account (sign up at https://stripe.com)
- Supabase project with orders table configured

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `supabase-migration.sql`
4. Click **Run** to execute the migration

This adds:
- `selected_addons` column for storing add-ons
- `updated_at` column with auto-update trigger
- Indexes for better performance

## Step 4: Set Up Stripe Webhook (For Testing)

### Option A: Use Stripe CLI (Recommended for local development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret that appears (starts with `whsec_`)
5. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Option B: Use ngrok (For deployed testing)

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Go to https://dashboard.stripe.com/test/webhooks
5. Click **Add endpoint**
6. Set endpoint URL: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
7. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
8. Copy the **Signing secret** and add to `.env.local`

## Step 5: Test Payment Flow

### Using Stripe Test Cards

Stripe provides test card numbers for different scenarios:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0027 6000 3184`

**More test cards:** https://stripe.com/docs/testing#cards

### Testing the Full Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. If using Stripe CLI, start webhook forwarding in another terminal:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

3. Navigate to http://localhost:3000

4. Add songs, select campaigns, add add-ons

5. Proceed to checkout and use a test card

6. Check your Supabase database to verify:
   - Order was created with `status: 'pending'`
   - After successful payment, status updated to `'completed'`

## Step 6: Disable Ad Blockers

Stripe uses fraud detection scripts that ad blockers often block. If you see `ERR_BLOCKED_BY_CLIENT` errors:

1. Disable your ad blocker (uBlock Origin, AdBlock Plus, etc.)
2. Or whitelist `localhost` in your ad blocker settings
3. Or whitelist `*.stripe.com` domains

## Troubleshooting

### Error: "Failed to create order"
- Check that database migration ran successfully
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase logs for detailed error messages

### Error: "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint
- If using Stripe CLI, make sure `stripe listen` is running
- Check that webhook secret starts with `whsec_`

### Payment not completing
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct and starts with `pk_test_`
- Check Stripe dashboard logs: https://dashboard.stripe.com/test/logs

### Order status not updating
- Verify webhook is receiving events (check Stripe CLI output or dashboard webhooks)
- Check Next.js server logs for webhook errors
- Verify `stripe_payment_intent_id` in database matches the payment intent ID in Stripe

## Production Deployment

When moving to production:

1. Get **live mode** API keys from https://dashboard.stripe.com/apikeys
2. Update environment variables with live keys (`pk_live_` and `sk_live_`)
3. Create production webhook endpoint in Stripe dashboard
4. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
5. **Never commit API keys to git** - use environment variables only

## Viewing Orders in Supabase

To view all orders:

```sql
SELECT
  id,
  user_email,
  user_first_name,
  user_last_name,
  total_amount,
  status,
  stripe_payment_intent_id,
  created_at,
  songs,
  campaign_tiers,
  selected_addons
FROM orders
ORDER BY created_at DESC;
```

To view completed orders only:

```sql
SELECT * FROM orders WHERE status = 'completed' ORDER BY created_at DESC;
```
