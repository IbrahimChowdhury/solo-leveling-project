'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Flame, 
  Zap, 
  Sparkles, 
  Info, 
  Bell,
  Clock,
  AlertOctagon
} from 'lucide-react'
import { Profile, DailyQuest, CustomQuest, AdminNotification } from '@/types'
import { completeDailyQuest, completeCustomQuest } from '@/app/actions/quests'
import CelebrationOverlays from './CelebrationOverlays'

interface DashboardHubProps {
  profile: Profile
  dailyQuests: DailyQuest[]
  customQuests: CustomQuest[]
  notifications: AdminNotification[]
}

export default function DashboardHub({
  profile,
  dailyQuests,
  customQuests,
  notifications,
}: DashboardHubProps) {
  const router = useRouter()
  const [loadingQuestId, setLoadingQuestId] = useState<string | null>(null)
  
  // Celebration States
  const [celeb, setCeleb] = useState({
    active: false,
    levelUp: false,
    rankUp: false,
    oldLevel: profile.level,
    newLevel: profile.level,
    oldRank: profile.rank,
    newRank: profile.rank,
  })

  // Weekend Check
  const day = new Date().getUTCDay()
  const isWeekend = day === 0 || day === 6

  // Handle completing daily quest
  const handleCompleteDaily = async (questId: string) => {
    setLoadingQuestId(questId)
    const result = await completeDailyQuest(questId)
    setLoadingQuestId(null)

    if (result.success) {
      if (result.leveledUp || result.rankedUp) {
        setCeleb({
          active: true,
          levelUp: result.leveledUp || false,
          rankUp: result.rankedUp || false,
          oldLevel: profile.level,
          newLevel: result.newLevel || profile.level,
          oldRank: profile.rank,
          newRank: result.newRank || profile.rank,
        })
      }
      router.refresh()
    } else if (result.error) {
      alert(result.error)
    }
  }

  // Handle completing custom quest
  const handleCompleteCustom = async (questId: string) => {
    setLoadingQuestId(questId)
    const result = await completeCustomQuest(questId)
    setLoadingQuestId(null)

    if (result.success) {
      if (result.leveledUp || result.rankedUp) {
        setCeleb({
          active: true,
          levelUp: result.leveledUp || false,
          rankUp: result.rankedUp || false,
          oldLevel: profile.level,
          newLevel: result.newLevel || profile.level,
          oldRank: profile.rank,
          newRank: result.newRank || profile.rank,
        })
      }
      router.refresh()
    } else if (result.error) {
      alert(result.error)
    }
  }

  // Calculate stats completed
  const dailyCompletedCount = dailyQuests.filter(q => q.completed).length
  const completionPercentage = dailyQuests.length > 0 
    ? Math.round((dailyCompletedCount / dailyQuests.length) * 100) 
    : 0

  return (
    <div className="space-y-8 font-mono text-gray-200">
      {/* Celebration Overlays */}
      <CelebrationOverlays
        levelUpActive={celeb.active && celeb.levelUp}
        rankUpActive={celeb.active && celeb.rankUp}
        oldLevel={celeb.oldLevel}
        newLevel={celeb.newLevel}
        oldRank={celeb.oldRank}
        newRank={celeb.newRank}
        onClose={() => setCeleb(prev => ({ ...prev, active: false }))}
      />

      {/* Broadcast System Message Banner */}
      {notifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-purple/10 border border-brand-purple/40 rounded-lg p-4 flex items-start gap-3 relative overflow-hidden"
        >
          {/* Laser-bracket visual design */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-purple" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-purple" />
          
          <Bell className="text-brand-purple shrink-0 mt-0.5 animate-pulse" size={20} />
          <div>
            <h4 className="text-xs font-bold tracking-widest text-brand-purple glow-text-purple uppercase">
              [ SYSTEM NOTICE MESSAGE DISPATCH ]
            </h4>
            <div className="space-y-2 mt-2">
              {notifications.map((n) => (
                <p key={n.id} className="text-xs text-purple-200 font-mono">
                  ⚡ {n.message}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Hologram Welcome Card */}
      <div className="relative overflow-hidden rounded-lg border-2 border-brand-blue/60 bg-[#02050c]/90 p-6 lg:p-8 glow-blue">
        {/* Hologram Bracket corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-blue" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-blue" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-blue" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-blue" />

        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black tracking-widest text-white uppercase">
                HUNTER STATUS PROFILE
              </h1>
              <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-[10px] text-brand-blue font-bold tracking-widest border border-brand-blue/30 glow-blue animate-pulse">
                [ACTIVE LOG]
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Clear your daily coordinates values to increase system rank ratings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-brand-gold glow-gold font-bold text-xs uppercase tracking-wide">
              <Flame size={14} className="fill-brand-gold" />
              <span>STREAK: {profile.streak_days} DAYS</span>
            </div>

            {/* Weekend Pro XP indicator */}
            {profile.is_pro && isWeekend && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/30 rounded text-brand-blue glow-blue font-bold text-xs uppercase tracking-wide animate-pulse">
                <Sparkles size={14} />
                <span>2X XP WEEKEND</span>
              </div>
            )}
          </div>
        </div>

        {/* Quest Completion Tracker */}
        <div className="mt-8 pt-6 border-t border-brand-blue/20">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-gray-400 uppercase tracking-widest">DAILY OBSTACLE CLEARANCE</span>
            <span className="text-white font-bold">{dailyCompletedCount} / {dailyQuests.length} LOGS ({completionPercentage}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded overflow-hidden border border-slate-900">
            <div 
              className="h-full bg-gradient-to-r from-brand-blue via-brand-purple to-purple-600 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {profile.streak_days > 0 && (
            <p className="text-[9px] text-brand-gold uppercase tracking-widest mt-2.5 flex items-center gap-1">
              ⚡ STREAK ACTIVE. COMPLETED COORDINATES CONVERT WITH +15% XP SYNC.
            </p>
          )}
        </div>
      </div>

      {/* Grid: Daily System Quests & Quick Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Holographic Daily Quests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-brand-blue glow-text-blue uppercase">
              [ DAILY QUEST: PREPARATION TO BECOME STRONG ]
            </h2>
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock size={12} /> resets 00:00 UTC
            </div>
          </div>

          {dailyQuests.length === 0 ? (
            <div className="bg-[#02050c]/90 border border-slate-900 rounded-lg p-8 text-center text-gray-500">
              <Info size={32} className="mx-auto text-slate-800 mb-2 animate-pulse" />
              <p className="text-xs uppercase">Daily quest logs not initialized.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  whileHover={{ scale: 1.005 }}
                  className={`relative overflow-hidden bg-[#02050c]/95 border rounded-lg p-5 transition-all flex items-start justify-between gap-4 ${
                    quest.completed 
                      ? 'border-slate-900/60 opacity-50' 
                      : 'border-slate-850 hover:border-brand-blue/50 glow-blue/10'
                  }`}
                >
                  {/* Hologram Bracket corners (subtle) */}
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-brand-blue/40" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-brand-blue/40" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-[9px] text-brand-purple font-bold uppercase tracking-wider">
                        {quest.stat_category.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[9px] text-brand-blue font-bold">
                        +{quest.xp_reward} XP
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold tracking-wide ${quest.completed ? 'line-through text-gray-600' : 'text-white'}`}>
                      {quest.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {quest.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center justify-center pt-2">
                    {quest.completed ? (
                      <CheckCircle className="text-brand-blue fill-brand-blue/5 shrink-0" size={24} />
                    ) : (
                      <button
                        onClick={() => handleCompleteDaily(quest.id)}
                        disabled={loadingQuestId === quest.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/25 text-brand-blue border border-brand-blue/40 hover:border-brand-blue font-extrabold font-mono text-[10px] uppercase rounded transition-all glow-blue disabled:opacity-50 cursor-pointer"
                      >
                        {loadingQuestId === quest.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-brand-blue border-t-transparent" />
                        ) : (
                          'Clear'
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Warning Text block matching Solo Leveling warning prompt */}
              <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4 flex items-start gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-red" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-red" />
                
                <AlertOctagon className="text-brand-red shrink-0 animate-pulse mt-0.5" size={18} />
                <div className="text-[10px] text-brand-red leading-relaxed uppercase tracking-wider">
                  <strong>⚠️ WARNING:</strong> Failure to clear the daily quest coordinates before the system threshold (23:59 UTC) will execute immediate degradation penalty protocols.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Custom Quests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-brand-purple glow-text-purple uppercase">
              [ QUICK ACTIVE TRIALS ]
            </h2>
            <span className="text-[9px] text-brand-purple border border-brand-purple/20 px-2 py-0.5 rounded">
              {profile.is_pro ? 'UNLIMITED' : `${customQuests.length} / 5 LIMIT`}
            </span>
          </div>

          {customQuests.length === 0 ? (
            <div className="bg-[#02050c]/90 border border-slate-900 rounded-lg p-8 text-center text-gray-500">
              <p className="text-xs uppercase mb-2">No active custom trials.</p>
              <button 
                onClick={() => router.push('/my-quests')}
                className="px-3 py-1.5 border border-brand-purple/35 hover:bg-brand-purple/10 text-brand-purple font-bold text-[10px] uppercase rounded transition-all cursor-pointer"
              >
                Configure Trial
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customQuests.slice(0, 5).map((quest) => (
                <div 
                  key={quest.id}
                  className="bg-[#02050c]/95 border border-slate-850 p-4 rounded-lg space-y-3 hover:border-brand-purple/40 transition-all relative"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-purple/30" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-purple/30" />

                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{quest.title}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-brand-purple/10 text-[8px] text-brand-purple font-bold uppercase">
                        {quest.repeat_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">{quest.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-950">
                    <span className="text-[10px] text-brand-blue font-bold">
                      +{quest.xp_reward} XP
                    </span>

                    <button
                      onClick={() => handleCompleteCustom(quest.id)}
                      disabled={loadingQuestId === quest.id}
                      className="px-2.5 py-1 bg-brand-purple/10 hover:bg-brand-purple/25 text-brand-purple border border-brand-purple/40 hover:border-brand-purple font-extrabold text-[9px] uppercase rounded transition-all glow-purple disabled:opacity-50 cursor-pointer"
                    >
                      {loadingQuestId === quest.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-brand-purple border-t-transparent" />
                      ) : (
                        'Complete'
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {customQuests.length > 5 && (
                <button
                  onClick={() => router.push('/my-quests')}
                  className="w-full py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-center text-[10px] text-gray-400 uppercase rounded transition-all cursor-pointer"
                >
                  View All Custom Coordinates (+{customQuests.length - 5} more)
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
