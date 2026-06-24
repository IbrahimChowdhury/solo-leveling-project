import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'
import { Profile } from '@/types'
import { getProfile } from '@/app/actions/profile'

export default async function SettingsPage() {
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

  return <SettingsForm profile={profile as Profile} />
}
