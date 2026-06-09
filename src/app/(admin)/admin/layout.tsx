import { getProfile } from '@/app/actions/profile'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart, Users, Bell } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  // Guard against non-admins (middleware does this, but double check)
  if (!profile || !profile.is_admin) {
    redirect('/')
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-white">
      {/* Main Sidebar */}
      <Sidebar profile={profile} />

      {/* Admin Content Area */}
      <main className="flex-1 w-full p-4 lg:p-8 overflow-x-hidden min-h-screen space-y-6">
        {/* Admin Navigation Headers */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-widest text-brand-red glow-text-red uppercase">
              SYSTEM CONSOLE (ADMIN)
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Root credentials active. Bypassing user-space limits.
            </p>
          </div>

          {/* Secondary Admin Menu */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <BarChart size={14} /> Analytics
            </Link>
            <Link 
              href="/admin/users" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Users size={14} /> Users
            </Link>
            <Link 
              href="/admin/notifications" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Bell size={14} /> Broadcasts
            </Link>
          </div>
        </div>

        {/* Dynamic nested layout child */}
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
