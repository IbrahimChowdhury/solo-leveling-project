import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const adminDb = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan as 'monthly' | 'yearly'

      if (userId && plan) {
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as any
        const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()

        // Upsert subscription log
        await adminDb.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan,
          status: 'active',
          current_period_end: periodEnd,
        })

        // Update profile
        await adminDb
          .from('profiles')
          .update({
            is_pro: true,
            pro_expires_at: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as any
      const subscriptionId = stripeSub.id
      const status = stripeSub.status
      const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()

      const { data: dbSub } = await adminDb
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (dbSub) {
        await adminDb
          .from('subscriptions')
          .update({
            status: status,
            current_period_end: periodEnd,
          })
          .eq('stripe_subscription_id', subscriptionId)

        const isPro = status === 'active'
        await adminDb
          .from('profiles')
          .update({
            is_pro: isPro,
            pro_expires_at: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbSub.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as any
      const subscriptionId = stripeSub.id

      const { data: dbSub } = await adminDb
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (dbSub) {
        await adminDb
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        await adminDb
          .from('profiles')
          .update({
            is_pro: false,
            pro_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbSub.user_id)
      }
      break
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
