'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Database recovery fallback: Create profile if missing from table
  if (!profile) {
    const adminDb = createAdminClient()
    const emailName = user.email ? user.email.split('@')[0] : 'Hunter'
    const defaultName = user.user_metadata?.display_name || emailName || 'Hunter'

    const { data: newProfile, error } = await adminDb
      .from('profiles')
      .insert({
        id: user.id,
        display_name: defaultName,
        avatar_url: user.user_metadata?.avatar_url || null,
        level: 1,
        total_xp: 0,
        rank: 'E-Rank',
        attack_power: 10,
        intelligence: 10,
        endurance: 10,
        stamina: 10,
        exercise: 10,
        skills: 10,
        streak_days: 0,
        is_pro: false,
        is_admin: false,
      })
      .select()
      .single()

    if (!error && newProfile) {
      profile = newProfile
    }
  }

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
