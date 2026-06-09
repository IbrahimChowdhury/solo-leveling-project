import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHub from '@/components/DashboardHub'
import { generateDailyQuests } from '@/lib/quests-generator'
import { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // 3. Fetch daily quests
  let { data: dailyQuests } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: true })

  // 4. On-the-fly generator fallback if empty
  if (!dailyQuests || dailyQuests.length === 0) {
    await generateDailyQuests(profile as Profile)
    // Refetch
    const { data: refetchedQuests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true })
    dailyQuests = refetchedQuests || []
  }

  // 5. Fetch custom active quests
  const { data: customQuests } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  // 6. Fetch relevant system notifications (broadcast or user-specific)
  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <DashboardHub
      profile={profile as Profile}
      dailyQuests={dailyQuests || []}
      customQuests={customQuests || []}
      notifications={notifications || []}
    />
  )
}
