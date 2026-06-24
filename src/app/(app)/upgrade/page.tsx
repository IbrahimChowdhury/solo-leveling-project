import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeOptions from '@/components/UpgradeOptions'
import { Profile } from '@/types'
import { getBkashConfig, getUserRequests } from '@/app/actions/bkash'
import { getProfile } from '@/app/actions/profile'

export default async function UpgradePage() {
  const supabase = await createClient()

  // 1. Check user auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch bKash configurations and user payment requests
  const bkashConfig = await getBkashConfig()
  const userRequests = await getUserRequests()

  return (
    <UpgradeOptions 
      profile={profile as Profile} 
      bkashConfig={bkashConfig}
      initialRequests={userRequests}
    />
  )
}
