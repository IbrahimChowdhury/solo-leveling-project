import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, ShieldAlert, Award } from 'lucide-react'
import { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // 1. Check user auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch top 10 profiles sorted by level desc, then total_xp desc
  const { data: topHunters, error } = await supabase
    .from('profiles')
    .select('id, display_name, level, total_xp, rank, avatar_url, is_pro')
    .order('level', { ascending: false })
    .order('total_xp', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-wider text-white">
          GLOBAL HUNTER REGISTER
        </h1>
        <p className="text-sm text-gray-400">
          Behold the top-ranking hunters logged into the system coordinates.
        </p>
      </div>

      {/* Leaderboard Card List */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-brand-gold animate-bounce" size={24} />
          <h2 className="text-lg font-bold font-mono tracking-wider text-white uppercase">
            Top 10 Hunters
          </h2>
        </div>

        {error || !topHunters || topHunters.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-mono">
            No hunters found in status records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-gray-500 uppercase tracking-widest">
                  <th className="pb-3 pl-4">Rank</th>
                  <th className="pb-3">Hunter</th>
                  <th className="pb-3 text-center">Level</th>
                  <th className="pb-3 text-center">System Rank</th>
                  <th className="pb-3 text-right pr-4">Level XP</th>
                </tr>
              </thead>
              <tbody>
                {topHunters.map((hunter: Partial<Profile>, index: number) => {
                  const isSelf = hunter.id === user.id
                  const rankNum = index + 1

                  let medalColor = ''
                  if (rankNum === 1) medalColor = 'text-brand-gold glow-text-gold'
                  else if (rankNum === 2) medalColor = 'text-slate-300'
                  else if (rankNum === 3) medalColor = 'text-amber-600'

                  return (
                    <tr
                      key={hunter.id}
                      className={`border-b border-slate-900/50 last:border-0 hover:bg-slate-900/30 transition-all ${
                        isSelf ? 'bg-brand-blue/5 border-l-2 border-l-brand-blue' : ''
                      }`}
                    >
                      <td className="py-4 pl-4 font-black">
                        {rankNum <= 3 ? (
                          <span className={`flex items-center gap-1 ${medalColor}`}>
                            <Award size={18} />
                            {rankNum}
                          </span>
                        ) : (
                          <span className="text-gray-500 pl-1">{rankNum}</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {hunter.avatar_url ? (
                            <img
                              src={hunter.avatar_url}
                              alt={hunter.display_name}
                              className={`w-8 h-8 rounded-full object-cover border ${
                                hunter.is_pro ? 'border-brand-gold glow-gold' : 'border-brand-blue'
                              }`}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                              {hunter.display_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className={`text-sm font-bold block ${isSelf ? 'text-brand-blue' : 'text-gray-200'}`}>
                              {hunter.display_name}
                              {isSelf && <span className="text-[9px] font-normal text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-1 rounded ml-1.5 uppercase">Self</span>}
                              {hunter.is_pro && <span className="text-[9px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-1 rounded ml-1.5 uppercase">Pro</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-bold text-white text-sm">
                        Lvl {hunter.level}
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs text-brand-purple font-bold uppercase tracking-wider glow-text-purple">
                          {hunter.rank}
                        </span>
                      </td>
                      <td className="py-4 text-right text-xs text-gray-400 pr-4">
                        {hunter.total_xp} XP
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
