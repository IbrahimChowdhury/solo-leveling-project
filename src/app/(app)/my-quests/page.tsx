import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuestsManager from '@/components/QuestsManager'
import { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MyQuestsPage() {
  const supabase = await createClient()

  // 1. Fetch user session
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

  // 3. Fetch custom quests
  const { data: customQuests } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <QuestsManager
      profile={profile as Profile}
      customQuests={customQuests || []}
    />
  )
}
