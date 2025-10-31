import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export async function getStripe() {
  return stripePromise;
}

// Campaign tier pricing
export const CAMPAIGN_TIERS = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    price: 79,
    originalPrice: 160,
    streams: '500-1.5k',
    pitches: '3+',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    price: 129,
    originalPrice: 330,
    streams: '2k-5k',
    pitches: '8+',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 199,
    originalPrice: 499,
    streams: '3k-10k',
    pitches: '15+',
    popular: true,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    price: 309,
    originalPrice: 759,
    streams: '8k-15k',
    pitches: '20+',
  },
};