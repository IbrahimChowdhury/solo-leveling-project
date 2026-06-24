import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileDetails from '@/components/ProfileDetails'
import { Profile, Subscription } from '@/types'
import { getProfile } from '@/app/actions/profile'

export default async function ProfilePage() {
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

  // 3. Fetch active subscription if exists
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <ProfileDetails
      profile={profile as Profile}
      subscription={subscription as Subscription || null}
    />
  )
}
