import { getProfile } from '@/app/actions/profile'
import { getCompletedWorkoutsToday } from '@/app/actions/workout'
import WorkoutClient from '@/components/WorkoutClient'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, Zap, Dumbbell, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WorkoutPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch completed exercise names today for the user
  const completedWorkouts = await getCompletedWorkoutsToday()
  const completedNames = completedWorkouts.map((w: any) => w.exercise_name)

  // S-Rank PRO Access Restriction
  if (!profile.is_pro) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-[#02050c]/90 border-2 border-brand-purple/60 rounded-xl p-8 md:p-12 text-center glow-purple font-mono overflow-hidden">
          
          {/* Futuristic corner elements */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-purple" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-purple" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-purple" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-purple" />

          {/* Glowing particle/scanline overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-brand-purple/[0.03] to-transparent bg-[size:100%_4px]" />

          {/* Restricted Icon */}
          <div className="relative mx-auto w-20 h-20 bg-slate-950/80 border border-brand-purple/40 rounded-full flex items-center justify-center mb-8 glow-purple animate-pulse">
            <Lock size={36} className="text-brand-purple" />
            <div className="absolute inset-0 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
          </div>

          {/* System warning title */}
          <div className="text-[10px] text-brand-purple/70 tracking-widest uppercase mb-2">
            [ SYSTEM WARNING - RESTRICTED ZONE ACCESS ]
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white glow-text-purple uppercase mb-1">
            S-Rank Hunter Required
          </h2>
          <div className="h-[2px] w-1/4 mx-auto bg-gradient-to-r from-transparent via-brand-purple to-transparent mb-6" />

          <p className="text-gray-300 text-xs md:text-sm leading-relaxed uppercase tracking-wider mb-8 px-2 md:px-6">
            "The physical training node coordinate is locked. Access to physiology logs is restricted to S-Rank awakened hunters. Upgrade your rank credentials to proceed."
          </p>

          {/* Action container */}
          <div className="space-y-4">
            <Link href="/upgrade">
              <div className="w-full py-4 bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 hover:from-brand-purple/35 hover:to-brand-blue/35 border border-brand-purple hover:border-brand-blue text-brand-gold font-extrabold rounded-lg tracking-widest text-xs transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-brand-purple/20">
                <Zap size={14} className="fill-brand-gold text-brand-gold animate-bounce" />
                <span>Awaken S-Rank PRO Version</span>
              </div>
            </Link>
            
            <Link href="/dashboard">
              <div className="text-xs text-gray-500 hover:text-gray-300 transition-all uppercase tracking-widest block pt-2 cursor-pointer">
                Return to System Hub
              </div>
            </Link>
          </div>

        </div>
      </div>
    )
  }

  return (
    <WorkoutClient 
      initialProfile={profile} 
      initialCompletedNames={completedNames} 
    />
  )
}
