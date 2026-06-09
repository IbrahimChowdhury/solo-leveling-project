'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function updateProfile(displayName: string, avatarUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  if (!displayName || displayName.trim().length === 0) {
    return { error: 'Display name cannot be empty.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true }
}

export async function usePenaltyShield() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, penalty_shield_used_this_week')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found.' }
  if (!profile.is_pro) return { error: 'Penalty Shield is a Pro-only feature.' }
  if (profile.penalty_shield_used_this_week) return { error: 'Penalty Shield already used this week.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      penalty_shield_used_this_week: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function exportUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single()
  const dailyQuestsPromise = supabase.from('daily_quests').select('*').eq('user_id', user.id)
  const customQuestsPromise = supabase.from('custom_quests').select('*').eq('user_id', user.id)
  const completionsPromise = supabase.from('quest_completions').select('*').eq('user_id', user.id)
  const historyPromise = supabase.from('stat_history').select('*').eq('user_id', user.id)
  const penaltiesPromise = supabase.from('penalties').select('*').eq('user_id', user.id)
  const subPromise = supabase.from('subscriptions').select('*').eq('user_id', user.id)

  const [
    profileRes,
    dailyQuestsRes,
    customQuestsRes,
    completionsRes,
    historyRes,
    penaltiesRes,
    subRes,
  ] = await Promise.all([
    profilePromise,
    dailyQuestsPromise,
    customQuestsPromise,
    completionsPromise,
    historyPromise,
    penaltiesPromise,
    subPromise,
  ])

  return {
    profile: profileRes.data,
    dailyQuests: dailyQuestsRes.data || [],
    customQuests: customQuestsRes.data || [],
    completions: completionsRes.data || [],
    statHistory: historyRes.data || [],
    penalties: penaltiesRes.data || [],
    subscription: subRes.data || [],
  }
}
