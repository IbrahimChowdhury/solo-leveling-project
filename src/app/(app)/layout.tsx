import { getProfile } from '@/app/actions/profile'
import Sidebar from '@/components/Sidebar'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-white">
      {/* Sidebar Navigation */}
      <Sidebar profile={profile} />

      {/* Main Page Area */}
      <main className="flex-1 w-full p-4 lg:p-8 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  )
}
