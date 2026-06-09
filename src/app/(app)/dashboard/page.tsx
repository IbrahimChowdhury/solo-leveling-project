import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHub from '@/components/DashboardHub'
import { getProfile } from '@/app/actions/profile'
import { checkAndRunDailyReset } from '@/lib/quests-generator'
import { Profile } from '@/types'

export const dynamic = 'force-dynamic'

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
  await checkAndRunDailyReset(profile as Profile)

  // Refetch profile to get the up-to-date stats/levels after resets
  profile = await getProfile()

  const today = new Date().toISOString().split('T')[0]

  // 4. Fetch actual daily quests (from custom daily quests, if any)
  //    If empty → DashboardHub will show client-side example quests
  const [dailyQuestsResult, customQuestsResult, notificationsResult] = await Promise.all([
    supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true }),
    supabase
      .from('custom_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('admin_notifications')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return (
    <DashboardHub
      profile={profile as Profile}
      dailyQuests={dailyQuestsResult.data || []}
      customQuests={customQuestsResult.data || []}
      notifications={notificationsResult.data || []}
    />
  )
}
