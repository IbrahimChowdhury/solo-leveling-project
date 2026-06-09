'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Flame, 
  Zap, 
  Sparkles, 
  Info, 
  Bell,
  Clock,
  AlertOctagon,
  X,
  BookOpen,
  Star
} from 'lucide-react'
import { Profile, DailyQuest, CustomQuest, AdminNotification, StatCategory } from '@/types'
import { completeDailyQuest, completeCustomQuest, claimExampleQuest } from '@/app/actions/quests'
import CelebrationOverlays from './CelebrationOverlays'

// ─── Static Example Quests (shown when hunter has no custom daily quests) ────
interface ExampleQuest {
  id: string // client-side only id
  title: string
  description: string
  stat_category: StatCategory
  xp_reward: number
  isExample: true
}

const EXAMPLE_DAILY_QUESTS: ExampleQuest[] = [
  {
    id: 'example-1',
    title: 'Morning Physical Warm-up',
    description: 'Complete 10 minutes of light stretching, jumping jacks, or bodyweight movements to awaken muscle fibers and prime your body for the day.',
    stat_category: 'endurance',
    xp_reward: 20,
    isExample: true,
  },
  {
    id: 'example-2',
    title: 'Mental Focus Training',
    description: 'Dedicate 15 minutes of uninterrupted deep focus — reading, coding, solving problems, or any cognitive challenge that demands full attention.',
    stat_category: 'intelligence',
    xp_reward: 25,
    isExample: true,
  },
  {
    id: 'example-3',
    title: 'Hydration & Vitality Protocol',
    description: 'Consume at least 2 liters of pure water throughout the day. Proper hydration is the foundation of all physical and mental performance.',
    stat_category: 'stamina',
    xp_reward: 20,
    isExample: true,
  },
  {
    id: 'example-4',
    title: 'Push-up Power Protocol',
    description: 'Complete 30 push-ups in any number of sets. Build upper body strength and battle discipline one rep at a time.',
    stat_category: 'attack_power',
    xp_reward: 30,
    isExample: true,
  },
  {
    id: 'example-5',
    title: 'Skill Sharpening Session',
    description: 'Spend 20 minutes practicing or learning any professional skill — coding, design, music, writing, or any craft that advances your mastery.',
    stat_category: 'skills',
    xp_reward: 25,
    isExample: true,
  },
]

// ─── LocalStorage Cache Helpers ───────────────────────────────────────────────
const CACHE_KEY_PREFIX = 'sl_dashboard_'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function cacheSet(key: string, value: unknown) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({ v: value, t: Date.now() }))
  } catch {}
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.t > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key)
      return null
    }
    return parsed.v as T
  } catch {
    return null
  }
}

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
  const [timeLeft, setTimeLeft] = useState<string>('')
  const lastDateRef = useRef<number>(new Date().getDate())

  // Track which example quests were claimed this session
  const [claimedExampleIds, setClaimedExampleIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const cached = cacheGet<string[]>('claimed_examples_' + new Date().toISOString().split('T')[0])
    return new Set(cached || [])
  })

  // Cache server-provided data to localStorage for instant re-render on next visit
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    cacheSet('daily_quests_' + today, dailyQuests)
    cacheSet('custom_quests', customQuests)
    cacheSet('profile', profile)
  }, [dailyQuests, customQuests, profile])

  // ─── Countdown Timer (local midnight 23:59:59) ────────────────────────────
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const currentDate = now.getDate()

      // Page refresh on date change
      if (currentDate !== lastDateRef.current) {
        lastDateRef.current = currentDate
        router.refresh()
        return
      }

      // Calculate time until end of current local day (23:59:59)
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, 59, 59, 999
      )
      const diff = endOfDay.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [router])

  // ─── Quest Modal States ───────────────────────────────────────────────────
  const [selectedQuest, setSelectedQuest] = useState<DailyQuest | CustomQuest | ExampleQuest | null>(null)
  const [selectedQuestType, setSelectedQuestType] = useState<'system' | 'custom' | 'example' | null>(null)
  const [showClaimConfirmation, setShowClaimConfirmation] = useState(false)
  const [confirmedChecked, setConfirmedChecked] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  // ─── Celebration States ───────────────────────────────────────────────────
  const [celeb, setCeleb] = useState({
    active: false,
    levelUp: false,
    rankUp: false,
    oldLevel: profile.level,
    newLevel: profile.level,
    oldRank: profile.rank,
    newRank: profile.rank,
  })

  const openQuestModal = (
    quest: DailyQuest | CustomQuest | ExampleQuest,
    type: 'system' | 'custom' | 'example',
    forClaim = false
  ) => {
    setSelectedQuest(quest)
    setSelectedQuestType(type)
    setShowClaimConfirmation(forClaim)
    setConfirmedChecked(false)
  }

  // ─── Determine if a quest is "completed" ─────────────────────────────────
  const isQuestCompleted = (
    quest: DailyQuest | CustomQuest | ExampleQuest,
    type: 'system' | 'custom' | 'example'
  ) => {
    if (type === 'example') {
      return claimedExampleIds.has((quest as ExampleQuest).id)
    }
    if (type === 'system') return (quest as DailyQuest).completed
    const cq = quest as CustomQuest
    return !!(cq.next_reset_at && new Date(cq.next_reset_at) > new Date())
  }

  // ─── Claim from Modal ─────────────────────────────────────────────────────
  const handleClaimFromModal = async () => {
    if (!selectedQuest || !selectedQuestType) return
    setModalLoading(true)

    let result: { success?: boolean; error?: string; leveledUp?: boolean; rankedUp?: boolean; newLevel?: number; newRank?: string; xpGained?: number; statGained?: string; statIncrease?: number }

    if (selectedQuestType === 'example') {
      const eq = selectedQuest as ExampleQuest
      result = await claimExampleQuest(eq.title, eq.description, eq.stat_category, eq.xp_reward)
      if (result.success) {
        // Mark as claimed in local state + cache
        setClaimedExampleIds(prev => {
          const next = new Set(prev)
          next.add(eq.id)
          const today = new Date().toISOString().split('T')[0]
          cacheSet('claimed_examples_' + today, Array.from(next))
          return next
        })
      }
    } else if (selectedQuestType === 'system') {
      result = await completeDailyQuest((selectedQuest as DailyQuest).id)
    } else {
      result = await completeCustomQuest((selectedQuest as CustomQuest).id)
    }

    setModalLoading(false)

    if (result.success) {
      setSelectedQuest(null)
      setConfirmedChecked(false)
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

  // ─── Handle direct complete buttons ──────────────────────────────────────
  const handleCompleteDaily = async (questId: string) => {
    setLoadingQuestId(questId)
    const result = await completeDailyQuest(questId)
    setLoadingQuestId(null)
    if (result.success) {
      if (result.leveledUp || result.rankedUp) {
        setCeleb({ active: true, levelUp: result.leveledUp || false, rankUp: result.rankedUp || false, oldLevel: profile.level, newLevel: result.newLevel || profile.level, oldRank: profile.rank, newRank: result.newRank || profile.rank })
      }
      router.refresh()
    } else if (result.error) { alert(result.error) }
  }

  const handleCompleteCustom = async (questId: string) => {
    setLoadingQuestId(questId)
    const result = await completeCustomQuest(questId)
    setLoadingQuestId(null)
    if (result.success) {
      if (result.leveledUp || result.rankedUp) {
        setCeleb({ active: true, levelUp: result.leveledUp || false, rankUp: result.rankedUp || false, oldLevel: profile.level, newLevel: result.newLevel || profile.level, oldRank: profile.rank, newRank: result.newRank || profile.rank })
      }
      router.refresh()
    } else if (result.error) { alert(result.error) }
  }

  // ─── Computed Stats ───────────────────────────────────────────────────────
  const isUsingExamples = dailyQuests.length === 0
  const day = new Date().getUTCDay()
  const isWeekend = day === 0 || day === 6

  // For progress bar: when using examples, track claimed examples
  const effectiveQuests = isUsingExamples ? EXAMPLE_DAILY_QUESTS : dailyQuests
  const dailyCompletedCount = isUsingExamples
    ? claimedExampleIds.size
    : dailyQuests.filter(q => q.completed).length
  const completionPercentage = effectiveQuests.length > 0
    ? Math.round((dailyCompletedCount / effectiveQuests.length) * 100)
    : 0

  // ─── Stat category colors ─────────────────────────────────────────────────
  const statColor: Record<StatCategory, string> = {
    attack_power: 'text-red-400 border-red-500/30 bg-red-500/10',
    intelligence: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    endurance: 'text-green-400 border-green-500/30 bg-green-500/10',
    stamina: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    exercise: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    skills: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  }

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
              Clear your daily coordinates to increase system rank ratings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-brand-gold glow-gold font-bold text-xs uppercase tracking-wide">
              <Flame size={14} className="fill-brand-gold" />
              <span>STREAK: {profile.streak_days} DAYS</span>
            </div>
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
            <span className="text-white font-bold">
              {dailyCompletedCount} / {effectiveQuests.length} LOGS ({completionPercentage}%)
            </span>
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

      {/* Pro Ascension Alert for Free Players */}
      {!profile.is_pro && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-gold/5 border-2 border-brand-gold/40 rounded-lg p-5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glow-gold"
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-gold" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-gold" />
          <div className="space-y-1">
            <h4 className="text-xs font-black tracking-widest text-brand-gold glow-text-gold uppercase flex items-center gap-1.5 animate-pulse">
              <Zap size={14} className="fill-brand-gold text-brand-gold" /> [ SYSTEM PROMPT: PRO AWAKENING AVAILABLE ]
            </h4>
            <p className="text-[10px] text-gray-300 leading-relaxed uppercase">
              Upgrade to PRO to create custom daily quests, unlock elite challenge limits, and become the supreme version of yourself.
            </p>
          </div>
          <button
            onClick={() => router.push('/upgrade')}
            className="w-full md:w-auto px-5 py-2.5 bg-brand-gold hover:bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest rounded shrink-0 transition-all glow-gold cursor-pointer"
          >
            AWAKEN PRO
          </button>
        </motion.div>
      )}

      {/* Grid: Daily System Quests & Quick Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Daily Quests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-widest text-brand-blue glow-text-blue uppercase">
                [ DAILY QUEST: PREPARATION TO BECOME STRONG ]
              </h2>
              {isUsingExamples && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                  <BookOpen size={10} />
                  EXAMPLE
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase">
              <Clock size={12} className="animate-pulse text-brand-blue" />
              resets in {timeLeft || '--:--:--'}
            </div>
          </div>

          {/* Example Quests Banner */}
          {isUsingExamples && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/5 border border-amber-500/25 rounded-lg p-4 flex items-start gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-500/60" />
              <Star className="text-amber-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                  [ SYSTEM EXAMPLE QUESTS — ACTIVE ]
                </p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  These are example daily quests provided by the system. Complete and claim them to earn XP, or{' '}
                  <button
                    onClick={() => router.push('/my-quests')}
                    className="text-brand-purple underline underline-offset-2 hover:text-purple-300 cursor-pointer"
                  >
                    create your own custom daily quests
                  </button>{' '}
                  to replace them with your personal training regimen.
                </p>
              </div>
            </motion.div>
          )}

          {/* Quest Cards */}
          <div className="space-y-4">
            {(isUsingExamples ? EXAMPLE_DAILY_QUESTS : dailyQuests).map((quest) => {
              const isExample = 'isExample' in quest
              const isCompleted = isExample
                ? claimedExampleIds.has(quest.id)
                : (quest as DailyQuest).completed

              return (
                <motion.div
                  key={quest.id}
                  whileHover={{ scale: 1.005 }}
                  className={`relative overflow-hidden bg-[#02050c]/95 border rounded-lg p-5 transition-all flex items-start justify-between gap-4 ${
                    isCompleted
                      ? 'border-slate-900/60 opacity-50'
                      : 'border-slate-850 hover:border-brand-blue/50'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-brand-blue/40" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-brand-blue/40" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statColor[quest.stat_category as StatCategory]}`}>
                        {quest.stat_category.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[9px] text-brand-blue font-bold">
                        +{quest.xp_reward} XP
                      </span>
                      {isExample && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-bold uppercase">
                          EXAMPLE
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold tracking-wide ${isCompleted ? 'line-through text-gray-600' : 'text-white'}`}>
                      {quest.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {quest.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                      onClick={() => openQuestModal(quest, isExample ? 'example' : 'system', false)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-gray-400 hover:text-white border border-slate-900 hover:border-slate-800 font-extrabold font-mono text-[10px] uppercase rounded transition-all cursor-pointer"
                    >
                      <Info size={12} />
                      Details
                    </button>

                    {isCompleted ? (
                      <CheckCircle className="text-brand-blue fill-brand-blue/5 shrink-0" size={24} />
                    ) : (
                      <button
                        onClick={() => openQuestModal(quest, isExample ? 'example' : 'system', true)}
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
              )
            })}

            {/* Warning Block */}
            <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-red" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-red" />
              <AlertOctagon className="text-brand-red shrink-0 animate-pulse mt-0.5" size={18} />
              <div className="text-[10px] text-brand-red leading-relaxed uppercase tracking-wider">
                <strong>⚠️ WARNING:</strong> Failure to clear daily quest coordinates before the system threshold (23:59 LOCAL TIME) will execute immediate degradation penalty protocols.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Custom Quests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-brand-purple glow-text-purple uppercase">
              [ QUICK ACTIVE TRIALS ]
            </h2>
            <span className="text-[9px] text-brand-purple border border-brand-purple/20 px-2 py-0.5 rounded">
              {profile.is_pro ? 'PRO UNLIMITED' : `${customQuests.length} / 3 LIMIT`}
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
                      <span className="px-1.5 rounded bg-brand-purple/10 text-[8px] text-brand-purple font-bold uppercase">
                        {quest.repeat_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">{quest.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-950">
                    <span className="text-[10px] text-brand-blue font-bold">
                      +{quest.xp_reward} XP
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQuestModal(quest, 'custom', false)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-gray-400 hover:text-white border border-slate-800 hover:border-slate-700 font-extrabold text-[9px] uppercase rounded transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      {quest.next_reset_at && new Date(quest.next_reset_at) > new Date() ? (
                        <CheckCircle className="text-brand-purple fill-brand-purple/5 shrink-0" size={20} />
                      ) : (
                        <button
                          onClick={() => openQuestModal(quest, 'custom', true)}
                          disabled={loadingQuestId === quest.id}
                          className="px-2.5 py-1 bg-brand-purple/10 hover:bg-brand-purple/25 text-brand-purple border border-brand-purple/40 hover:border-brand-purple font-extrabold text-[9px] uppercase rounded transition-all glow-purple disabled:opacity-50 cursor-pointer"
                        >
                          {loadingQuestId === quest.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border border-brand-purple border-t-transparent" />
                          ) : (
                            'Complete'
                          )}
                        </button>
                      )}
                    </div>
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

      {/* ─── Quest Details / Claim Modal ─── */}
      <AnimatePresence>
        {selectedQuest && selectedQuestType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setSelectedQuest(null); setConfirmedChecked(false) } }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md overflow-hidden rounded-lg border-2 bg-[#02050c]/98 p-6 shadow-2xl font-mono text-gray-200 z-10 ${
                selectedQuestType === 'custom' 
                  ? 'border-brand-purple glow-purple' 
                  : selectedQuestType === 'example'
                    ? 'border-amber-500/70 shadow-amber-500/10'
                    : 'border-brand-blue glow-blue'
              }`}
            >
              {/* Bracket corners */}
              {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 ${cls} ${
                  selectedQuestType === 'custom' ? 'border-brand-purple' : selectedQuestType === 'example' ? 'border-amber-500' : 'border-brand-blue'
                }`} />
              ))}

              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 50%)', backgroundSize: '100% 4px' }} />
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r animate-pulse ${
                selectedQuestType === 'custom' ? 'from-brand-purple/50 to-transparent' : selectedQuestType === 'example' ? 'from-amber-500/50 to-transparent' : 'from-brand-blue/50 to-transparent'
              }`} />

              {/* Close */}
              <button
                onClick={() => { if (!modalLoading) { setSelectedQuest(null); setConfirmedChecked(false) } }}
                disabled={modalLoading}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    selectedQuestType === 'custom' ? 'bg-brand-purple' : selectedQuestType === 'example' ? 'bg-amber-400' : 'bg-brand-blue'
                  }`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedQuestType === 'custom' ? 'text-brand-purple' : selectedQuestType === 'example' ? 'text-amber-400' : 'text-brand-blue'
                  }`}>
                    {selectedQuestType === 'custom' ? '[ CUSTOM ACTIVE TRIAL ]' : selectedQuestType === 'example' ? '[ SYSTEM EXAMPLE DIRECTIVE ]' : '[ SYSTEM DIRECTIVE ]'}
                  </span>
                </div>
                <h2 className="text-sm font-black tracking-widest text-white uppercase mt-1">
                  {showClaimConfirmation ? 'Confirm Quest Completion' : 'Quest Details & Progress'}
                </h2>
              </div>

              <div className={`h-[1px] w-full bg-gradient-to-r mb-4 ${
                selectedQuestType === 'custom' ? 'from-brand-purple/35 to-transparent' : selectedQuestType === 'example' ? 'from-amber-500/35 to-transparent' : 'from-brand-blue/35 to-transparent'
              }`} />

              {/* Quest Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statColor[selectedQuest.stat_category as StatCategory]}`}>
                    STAT: {selectedQuest.stat_category.replace('_', ' ')}
                  </span>
                  {selectedQuestType === 'custom' && (
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-[9px] text-brand-purple font-bold uppercase tracking-wider">
                      REPEAT: {(selectedQuest as CustomQuest).repeat_type}
                    </span>
                  )}
                  {selectedQuestType === 'example' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                      DAILY EXAMPLE
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-0.5">Objective Title</span>
                  <span className="text-xs font-bold text-white tracking-wide block bg-slate-950/60 p-2 border border-slate-900 rounded">
                    {selectedQuest.title}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-0.5">Objective Requirements</span>
                  <p className="text-xs text-gray-300 leading-relaxed bg-slate-950/60 p-3 border border-slate-900 rounded whitespace-pre-wrap">
                    {selectedQuest.description}
                  </p>
                </div>

                <div className={`p-3 border rounded ${
                  selectedQuestType === 'custom' ? 'border-brand-purple/20 bg-brand-purple/5' : selectedQuestType === 'example' ? 'border-amber-500/20 bg-amber-500/5' : 'border-brand-blue/20 bg-brand-blue/5'
                }`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${
                    selectedQuestType === 'custom' ? 'text-brand-purple' : selectedQuestType === 'example' ? 'text-amber-400' : 'text-brand-blue'
                  }`}>
                    [ SYNCHRONIZATION REWARDS ]
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/50 p-2 border border-slate-900/60 rounded">
                      <span className="text-[9px] text-gray-500 uppercase block">XP Bounty</span>
                      <span className="text-white font-bold">+{selectedQuest.xp_reward} XP</span>
                    </div>
                    <div className="bg-slate-950/50 p-2 border border-slate-900/60 rounded">
                      <span className="text-[9px] text-gray-500 uppercase block">Stat Upgrade</span>
                      <span className="text-white font-bold">
                        {selectedQuest.stat_category.replace('_', ' ').toUpperCase()} +{Math.max(2, Math.min(10, Math.floor(selectedQuest.xp_reward / 10)))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`h-[1px] w-full bg-gradient-to-r my-4 ${
                selectedQuestType === 'custom' ? 'from-brand-purple/15 to-transparent' : selectedQuestType === 'example' ? 'from-amber-500/15 to-transparent' : 'from-brand-blue/15 to-transparent'
              }`} />

              {/* Completion / Confirmation Section */}
              {isQuestCompleted(selectedQuest, selectedQuestType) ? (
                <div className="bg-brand-blue/10 border border-brand-blue/30 rounded p-3 text-center mb-6 animate-pulse">
                  <p className="text-xs text-brand-blue font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> [ STATUS: OBJECTIVE CLEAR ]
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1 uppercase">
                    This coordinates slot has already been synchronized for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="bg-brand-red/5 border border-brand-red/35 rounded p-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-brand-red" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-brand-red" />
                    <div className="flex gap-2">
                      <AlertOctagon className="text-brand-red shrink-0 mt-0.5 animate-pulse" size={14} />
                      <p className="text-[9px] text-brand-red uppercase tracking-wider leading-relaxed">
                        <strong>Warning:</strong> Only claim rewards if you actually completed the quest criteria. False claims disrupt system stats alignment.
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-center gap-3 p-2 border border-slate-900 rounded bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedChecked}
                      onChange={(e) => setConfirmedChecked(e.target.checked)}
                      disabled={modalLoading}
                      className={`h-4 w-4 bg-slate-950 border rounded focus:ring-0 ${
                        selectedQuestType === 'custom' ? 'border-brand-purple text-brand-purple' : selectedQuestType === 'example' ? 'border-amber-500 text-amber-500' : 'border-brand-blue text-brand-blue'
                      } cursor-pointer disabled:opacity-50`}
                    />
                    <span className="text-[9px] text-gray-300 uppercase select-none leading-none">
                      I confirm that I completed all required trials.
                    </span>
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setSelectedQuest(null); setConfirmedChecked(false) }}
                  disabled={modalLoading}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-gray-400 hover:text-white font-extrabold text-[10px] uppercase rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  Abort
                </button>

                {!isQuestCompleted(selectedQuest, selectedQuestType) && (
                  <button
                    onClick={handleClaimFromModal}
                    disabled={modalLoading || !confirmedChecked}
                    className={`px-5 py-2 font-black text-[10px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedQuestType === 'custom'
                        ? 'bg-brand-purple text-white glow-purple hover:bg-violet-600'
                        : selectedQuestType === 'example'
                          ? 'bg-amber-500 text-black hover:bg-amber-400'
                          : 'bg-brand-blue text-black glow-blue hover:bg-cyan-400'
                    }`}
                  >
                    {modalLoading ? (
                      <span className={`h-3 w-3 animate-spin rounded-full border border-t-transparent ${
                        selectedQuestType === 'custom' ? 'border-white' : 'border-black'
                      }`} />
                    ) : (
                      '[ CLAIM REWARD ]'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Synchronizing Reward Loading Overlay */}
      <AnimatePresence>
        {modalLoading && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md font-mono text-gray-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative p-8 border-2 rounded-lg bg-[#02050c]/95 max-w-sm w-full text-center ${
                selectedQuestType === 'custom' ? 'border-brand-purple glow-purple' : selectedQuestType === 'example' ? 'border-amber-500' : 'border-brand-blue glow-blue'
              }`}
            >
              {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 ${cls} ${selectedQuestType === 'custom' ? 'border-brand-purple' : selectedQuestType === 'example' ? 'border-amber-500' : 'border-brand-blue'}`} />
              ))}

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${selectedQuestType === 'custom' ? 'bg-brand-purple' : selectedQuestType === 'example' ? 'bg-amber-400' : 'bg-brand-blue'}`} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${selectedQuestType === 'custom' ? 'text-brand-purple' : selectedQuestType === 'example' ? 'text-amber-400' : 'text-brand-blue'}`}>
                  [ SYSTEM STATUS: SYNCHRONIZING REWARD ]
                </span>
              </div>

              <h3 className="text-sm font-black tracking-widest text-white uppercase mb-2 animate-pulse">
                SYNCING WITH THE GATE...
              </h3>
              <p className="text-[9px] text-gray-400 uppercase leading-relaxed mb-6">
                Recalculating Hunter Status level ratings and status parameters. Please hold position.
              </p>

              <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className={`h-full bg-gradient-to-r ${
                    selectedQuestType === 'custom' 
                      ? 'from-brand-purple to-violet-500' 
                      : selectedQuestType === 'example'
                        ? 'from-amber-500 to-yellow-400'
                        : 'from-brand-blue to-cyan-400'
                  }`}
                />
              </div>

              <div className="mt-6 text-[9px] text-gray-500 uppercase tracking-widest">
                [ TRANSMISSION SYNC RATE: SECURE ]
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
