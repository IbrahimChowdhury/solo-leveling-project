import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNotificationsForm from '@/components/AdminNotificationsForm'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  // 1. Check user auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch recent admin notification logs
  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
          SYSTEM BROADCAST MANAGER
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          Dispatch in-app notifications to either global hunter coordinates or specific targets.
        </p>
      </div>

      <AdminNotificationsForm notifications={notifications || []} />
    </div>
  )
}
