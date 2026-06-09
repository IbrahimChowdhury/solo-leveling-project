import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function IndexPage() {
  const supabase = await createClient()

  // 1. Fetch user session
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
