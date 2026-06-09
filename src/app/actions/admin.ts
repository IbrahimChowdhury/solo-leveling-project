'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getRankForLevel } from '@/lib/game'
import { revalidatePath, unstable_cache, updateTag } from 'next/cache'

async function checkAdminOrThrow() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    throw new Error('Not authorized. Admin access required.')
  }
}

const fetchAllUsersRaw = async () => {
  const adminDb = createAdminClient()

  // Fetch all profiles
  const { data: profiles, error } = await adminDb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Fetch emails from auth.users via admin API
  const { data: { users: authUsers }, error: authError } = await adminDb.auth.admin.listUsers()
  
  // Create mapping of email to user id
  const emailMap = new Map<string, string>()
  if (!authError && authUsers) {
    authUsers.forEach(u => {
      emailMap.set(u.id, u.email || '')
    })
  }

  // Combine profile and email
  return profiles.map(p => ({
    ...p,
    email: emailMap.get(p.id) || 'N/A',
  }))
}

const getCachedAllUsers = unstable_cache(
  async () => fetchAllUsersRaw(),
  ['admin-users-list'],
  {
    tags: ['admin-users-list'],
    revalidate: 30,
  }
)

export async function adminGetAllUsers() {
  await checkAdminOrThrow()
  return getCachedAllUsers()
}

export async function adminUpdateUser(
  userId: string,
  updates: {
    display_name?: string
    level?: number
    total_xp?: number
    is_pro?: boolean
    pro_expires_at?: string | null
    attack_power?: number
    intelligence?: number
    endurance?: number
    stamina?: number
    exercise?: number
    skills?: number
  }
) {
  await checkAdminOrThrow()
  const adminDb = createAdminClient()

  const dataToUpdate: any = { ...updates, updated_at: new Date().toISOString() }

  if (updates.level !== undefined) {
    dataToUpdate.rank = getRankForLevel(updates.level)
  }

  const { error } = await adminDb
    .from('profiles')
    .update(dataToUpdate)
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/profile')
  revalidatePath('/')
  updateTag('admin-users-list')
  updateTag('admin-analytics-data')
  return { success: true }
}

export async function adminDeleteUser(userId: string) {
  await checkAdminOrThrow()
  const adminDb = createAdminClient()

  // Deleting user via auth.admin API triggers cascade deletes in referenced tables
  const { error } = await adminDb.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  updateTag('admin-users-list')
  updateTag('admin-analytics-data')
  return { success: true }
}

export async function adminForceResetUser(userId: string) {
  await checkAdminOrThrow()
  const adminDb = createAdminClient()

  // Fetch user profile
  const { data: profile } = await adminDb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) throw new Error('Profile not found.')

  const today = new Date().toISOString().split('T')[0]

  // Find daily quests for today
  const { data: dailyQuests } = await adminDb
    .from('daily_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)

  // Mark all daily quests incomplete
  if (dailyQuests && dailyQuests.length > 0) {
    await adminDb
      .from('daily_quests')
      .update({ completed: false, completed_at: null })
      .eq('user_id', userId)
      .eq('date', today)
  }

  revalidatePath('/')
  updateTag('admin-analytics-data')
  return { success: true }
}

export async function adminSendNotification(message: string, userId: string | null = null) {
  await checkAdminOrThrow()
  const adminDb = createAdminClient()

  const { error } = await adminDb.from('admin_notifications').insert({
    user_id: userId,
    message,
    read: false,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  updateTag('admin-notifications-list')
  return { success: true }
}

const fetchAnalyticsRaw = async () => {
  const adminDb = createAdminClient()

  // 1. Total users
  const { count: totalUsers } = await adminDb
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Active users (signed up or updated in the last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: activeUsers } = await adminDb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', sevenDaysAgo.toISOString())

  // 3. Quests completed
  const { count: questsCompleted } = await adminDb
    .from('quest_completions')
    .select('*', { count: 'exact', head: true })

  // 4. Total XP earned
  const { data: xpData } = await adminDb
    .from('quest_completions')
    .select('xp_gained')

  const totalXP = (xpData || []).reduce((sum, item) => sum + item.xp_gained, 0)

  // 5. Total Pro subscribers
  const { count: proSubscribers } = await adminDb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_pro', true)

  // 6. Avg level
  const { data: levelsData } = await adminDb
    .from('profiles')
    .select('level')

  const avgLevel = levelsData && levelsData.length > 0
    ? parseFloat((levelsData.reduce((sum, item) => sum + item.level, 0) / levelsData.length).toFixed(1))
    : 0

  // 7. Estimated Revenue (based on active subscription status count, monthly=$4.99, yearly=$49.99)
  // To keep it simple, we can fetch all active records in subscriptions table and calculate
  const { data: activeSubs } = await adminDb
    .from('subscriptions')
    .select('plan, status')
    .eq('status', 'active')

  const revenue = (activeSubs || []).reduce((sum, sub) => {
    if (sub.plan === 'yearly') return sum + 49.99
    return sum + 4.99
  }, 0)

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    questsCompleted: questsCompleted || 0,
    totalXP,
    proSubscribers: proSubscribers || 0,
    avgLevel,
    revenue,
  }
}

const getCachedAnalytics = unstable_cache(
  async () => fetchAnalyticsRaw(),
  ['admin-analytics-data'],
  {
    tags: ['admin-analytics-data'],
    revalidate: 30,
  }
)

export async function adminGetAnalytics() {
  await checkAdminOrThrow()
  return getCachedAnalytics()
}

export async function adminRemovePenalty(penaltyId: string) {
  await checkAdminOrThrow()
  const adminDb = createAdminClient()

  // Fetch the penalty first to find the refund details
  const { data: penalty } = await adminDb
    .from('penalties')
    .select('*')
    .eq('id', penaltyId)
    .single()

  if (!penalty) throw new Error('Penalty record not found.')

  // Fetch the user's profile
  const { data: profile } = await adminDb
    .from('profiles')
    .select('*')
    .eq('id', penalty.user_id)
    .single()

  if (!profile) throw new Error('User profile not found.')

  // Restore user XP & Stat
  const statCategory = penalty.stat_decreased
  const restoreAmount = penalty.decrease_amount
  const restoreXP = penalty.xp_lost

  const currentStatVal = profile[statCategory as keyof typeof profile] as number
  const newStatVal = Math.min(1000, currentStatVal + restoreAmount)
  const newXP = profile.total_xp + restoreXP // simple addition

  // Update profile
  await adminDb
    .from('profiles')
    .update({
      total_xp: newXP,
      [statCategory]: newStatVal,
    })
    .eq('id', penalty.user_id)

  // Delete the penalty log
  const { error } = await adminDb
    .from('penalties')
    .delete()
    .eq('id', penaltyId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
  updateTag('admin-users-list')
  updateTag('admin-analytics-data')
  return { success: true }
}

const fetchNotificationsRaw = async () => {
  const adminDb = createAdminClient()
  const { data: notifications } = await adminDb
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  return notifications || []
}

const getCachedNotifications = unstable_cache(
  async () => fetchNotificationsRaw(),
  ['admin-notifications-list'],
  {
    tags: ['admin-notifications-list'],
    revalidate: 30,
  }
)

export async function adminGetNotifications() {
  await checkAdminOrThrow()
  return getCachedNotifications()
}
