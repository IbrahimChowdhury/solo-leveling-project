import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeOptions from '@/components/UpgradeOptions'
import { Profile } from '@/types'
import { getBkashConfig, getUserRequests } from '@/app/actions/bkash'

export const dynamic = 'force-dynamic'

export default async function UpgradePage() {
  const supabase = await createClient()

  // 1. Check user auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
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
