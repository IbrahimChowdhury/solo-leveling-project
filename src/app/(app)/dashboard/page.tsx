import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHub from '@/components/DashboardHub'
import { getProfile, getUserNotifications } from '@/app/actions/profile'
import { getDailyQuests, getCustomQuests } from '@/app/actions/quests'
import { checkAndRunDailyReset, generateDailyQuests } from '@/lib/quests-generator'
import { Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile using getProfile helper (triggers automatic recovery fallbacks)
  let profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 3. Run self-healing daily reset evaluations
  const didReset = await checkAndRunDailyReset(profile as Profile)
  await generateDailyQuests(profile as Profile)

  // Refetch profile to get the up-to-date stats/levels after resets only if didReset is true
  if (didReset) {
    profile = await getProfile(true)
  }

  // 4. Fetch actual daily quests, custom quests, and notifications from cache
  const [dailyQuests, customQuests, notifications] = await Promise.all([
    getDailyQuests(),
    getCustomQuests(),
    getUserNotifications(user.id),
  ])

  return (
    <DashboardHub
      profile={profile as Profile}
      dailyQuests={dailyQuests}
      customQuests={customQuests}
      notifications={notifications}
    />
  )
}
