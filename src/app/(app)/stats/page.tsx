import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsViewer from '@/components/StatsViewer'
import { Profile, StatHistory } from '@/types'
import { getProfile } from '@/app/actions/profile'

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Fetch session user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 3. Fetch history based on Pro limits
  let query = supabase
    .from('stat_history')
    .select('*')
    .eq('user_id', user.id)

  if (profile.is_pro) {
    // Pro: Fetch all chronological
    const { data: history } = await query.order('created_at', { ascending: true })
    return <StatsViewer profile={profile as Profile} history={history || []} />
  } else {
    // Free: Fetch last 30 entries (ordered descending, then reverse in memory)
    const { data: history } = await query
      .order('created_at', { ascending: false })
      .limit(30)

    const chronHistory = history ? [...history].reverse() : []
    return <StatsViewer profile={profile as Profile} history={chronHistory as StatHistory[]} />
  }
}
