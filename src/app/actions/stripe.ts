'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(plan: 'monthly' | 'yearly') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Get user details
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_pro')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found.' }

  // Check if already subscribed
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const priceId = plan === 'monthly'
    ? process.env.STRIPE_MONTHLY_PRICE_ID
    : process.env.STRIPE_YEARLY_PRICE_ID

  if (!priceId) {
    return { error: 'Stripe price ID is not configured.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan,
      },
      customer: sub?.stripe_customer_id || undefined,
    })

    return { url: session.url }
  } catch (error: any) {
    return { error: error.message || 'Stripe error.' }
  }
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Get customer id
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub || !sub.stripe_customer_id) {
    return { error: 'No subscription found for this user.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/profile`,
    })

    return { url: session.url }
  } catch (error: any) {
    return { error: error.message || 'Billing portal error.' }
  }
}
