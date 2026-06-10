'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BkashConfig, BkashRequest } from '@/types'

export async function getBkashConfig(): Promise<BkashConfig> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bkash_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error || !data) {
    // Return a default fallback config if error occurs (e.g. before migration runs)
    return {
      id: 1,
      number: '+8801700000000',
      price_1_month: 200,
      price_3_months: 500,
      price_6_months: 900,
      price_1_year: 1500,
      updated_at: new Date().toISOString()
    }
  }

  return data as BkashConfig
}

export async function createProUpgradeRequest(
  senderNumber: string,
  transactionId: string,
  packageType: '1_month' | '3_months' | '6_months' | '1_year',
  amount: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  if (!senderNumber || senderNumber.trim().length < 10) {
    return { error: 'Invalid bKash sender number.' }
  }

  if (!transactionId || transactionId.trim().length < 6) {
    return { error: 'Invalid Transaction ID (TxnID).' }
  }

  const cleanTxnId = transactionId.trim().toUpperCase()

  // Verify that the TxnID is unique in the database
  const { data: existing } = await supabase
    .from('bkash_requests')
    .select('id')
    .eq('transaction_id', cleanTxnId)
    .maybeSingle()

  if (existing) {
    return { error: 'This Transaction ID (TxnID) has already been submitted.' }
  }

  const { error } = await supabase
    .from('bkash_requests')
    .insert({
      user_id: user.id,
      sender_number: senderNumber.trim(),
      transaction_id: cleanTxnId,
      package_type: packageType,
      amount,
      status: 'pending',
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/upgrade')
  return { success: true }
}

export async function getUserRequests(): Promise<BkashRequest[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('bkash_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as BkashRequest[]
}

export async function dismissProWelcomePopup() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('profiles')
    .update({ show_pro_welcome_popup: false })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}
