import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeOptions from '@/components/UpgradeOptions'
import { Profile } from '@/types'

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

  return <UpgradeOptions profile={profile as Profile} />
}
