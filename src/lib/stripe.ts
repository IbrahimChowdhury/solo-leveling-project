import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mockkeyforcompilation', {
  apiVersion: '2025-02-27.accredited' as any,
})
