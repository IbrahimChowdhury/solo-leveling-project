'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap, AlertTriangle, CheckCircle, ShieldCheck, Edit3, Info, X, AlertOctagon } from 'lucide-react'
import { Profile, CustomQuest } from '@/types'
import { addCustomQuest, deleteCustomQuest, editCustomQuest, completeCustomQuest } from '@/app/actions/quests'

interface QuestsManagerProps {
  profile: Profile
  customQuests: CustomQuest[]
}

export default function QuestsManager({
  profile,
  customQuests,
}: QuestsManagerProps) {
  const router = useRouter()
  const [loadingStatus, setLoadingStatus] = useState<'forging' | 'updating' | 'deleting' | 'fetching' | null>(null)
  const [questIdToDelete, setQuestIdToDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form States
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [statCategory, setStatCategory] = useState('attack_power')
  const [xpReward, setXpReward] = useState(30)
  const [repeatType, setRepeatType] = useState<'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [proofRequired, setProofRequired] = useState(false)
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null)

  // ─── Custom Quest Layout and Sorting States ──────────────────────────────
  const [sortBy, setSortBy] = useState<'created' | 'status' | 'priority' | 'category' | 'title'>('created')
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list')
  
  // ─── Custom Quest Details Modal States ──────────────────────────────────
  const [selectedQuest, setSelectedQuest] = useState<CustomQuest | null>(null)
  const [confirmedChecked, setConfirmedChecked] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    const savedSort = localStorage.getItem('solo_leveling_quests_sort')
    if (savedSort) setSortBy(savedSort as any)
    const savedView = localStorage.getItem('solo_leveling_quests_view')
    if (savedView) setViewMode(savedView as any)
  }, [])

  const handleSortChange = (newSort: 'created' | 'status' | 'priority' | 'category' | 'title') => {
    setSortBy(newSort)
    localStorage.setItem('solo_leveling_quests_sort', newSort)
  }

  const handleViewModeChange = (newView: 'list' | 'grouped') => {
    setViewMode(newView)
    localStorage.setItem('solo_leveling_quests_view', newView)
  }

  const isQuestCompleted = (quest: CustomQuest) => {
    return !!(quest.next_reset_at && new Date(quest.next_reset_at) > new Date())
  }

  const getSortedQuests = (quests: CustomQuest[]) => {
    const sorted = [...quests]
    sorted.sort((a, b) => {
      if (sortBy === 'status') {
        const aComp = isQuestCompleted(a)
        const bComp = isQuestCompleted(b)
        if (aComp === bComp) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return aComp ? 1 : -1
      }
      if (sortBy === 'priority') {
        if (b.xp_reward === a.xp_reward) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return b.xp_reward - a.xp_reward
      }
      if (sortBy === 'category') {
        if (a.stat_category === b.stat_category) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return a.stat_category.localeCompare(b.stat_category)
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      // 'created' (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return sorted
  }

  const sortedCustomQuests = getSortedQuests(customQuests)

  const groupedCustomQuests: Record<string, CustomQuest[]> = {}
  if (viewMode === 'grouped') {
    sortedCustomQuests.forEach(quest => {
      const cat = quest.stat_category
      if (!groupedCustomQuests[cat]) {
        groupedCustomQuests[cat] = []
      }
      groupedCustomQuests[cat].push(quest)
    })
  }

  const handleClaimFromModal = async () => {
    if (!selectedQuest) return
    setModalLoading(true)
    const result = await completeCustomQuest(selectedQuest.id)
    setModalLoading(false)
    if (result.success) {
      setSelectedQuest(null)
      setConfirmedChecked(false)
      setLoadingStatus('fetching')
      router.refresh()
      setTimeout(() => setLoadingStatus(null), 1000)
    } else if (result.error) {
      alert(result.error)
    }
  }

  const statColor: Record<string, string> = {
    attack_power: 'text-red-400 border-red-500/30 bg-red-500/10',
    intelligence: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    endurance: 'text-green-400 border-green-500/30 bg-green-500/10',
    stamina: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    exercise: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    skills: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  }

  // Enforce Quest Limits (bypassed if editing)
  const limit = profile.is_pro ? 40 : 3
  const isLimitReached = !editingQuestId && customQuests.length >= limit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingStatus(editingQuestId ? 'updating' : 'forging')

    if (editingQuestId) {
      const res = await editCustomQuest(
        editingQuestId,
        title,
        description,
        statCategory,
        xpReward,
        repeatType,
        proofRequired
      )

      setLoadingStatus(null)

      if (res.error) {
        setError(res.error)
      } else {
        // Clear form
        setTitle('')
        setDescription('')
        setXpReward(30)
        setProofRequired(false)
        setEditingQuestId(null)
        setLoadingStatus('fetching')
        router.refresh()
        setTimeout(() => setLoadingStatus(null), 1000)
      }
      return
    }

    if (isLimitReached) {
      setError(`Active custom quests limit reached (${customQuests.length}/${limit}). ${profile.is_pro ? 'Limit is 40.' : 'Upgrade to PRO to get 40 slots!'}`)
      setLoadingStatus(null)
      return
    }

    const res = await addCustomQuest(
      title,
      description,
      statCategory,
      xpReward,
      repeatType,
      proofRequired
    )

    setLoadingStatus(null)

    if (res.error) {
      setError(res.error)
    } else {
      // Clear form
      setTitle('')
      setDescription('')
      setXpReward(30)
      setProofRequired(false)
      setLoadingStatus('fetching')
      router.refresh()
      setTimeout(() => setLoadingStatus(null), 1000)
    }
  }

  const performDelete = async (questId: string) => {
    setLoadingStatus('deleting')
    const res = await deleteCustomQuest(questId)
    setLoadingStatus(null)
    if (res.error) {
      alert(res.error)
    } else {
      if (editingQuestId === questId) {
        handleCancelEdit()
      }
      setLoadingStatus('fetching')
      router.refresh()
      setTimeout(() => setLoadingStatus(null), 1000)
    }
  }

  const handleDelete = (questId: string) => {
    setQuestIdToDelete(questId)
  }

  const handleStartEdit = (quest: CustomQuest) => {
    setEditingQuestId(quest.id)
    setTitle(quest.title)
    setDescription(quest.description || '')
    setStatCategory(quest.stat_category)
    setXpReward(quest.xp_reward)
    setRepeatType(quest.repeat_type as any)
    setProofRequired(quest.proof_required)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingQuestId(null)
    setTitle('')
    setDescription('')
    setXpReward(30)
    setProofRequired(false)
    setError(null)
  }

  const getLoadingConfig = () => {
    switch (loadingStatus) {
      case 'deleting':
        return {
          colorClass: 'brand-red',
          borderColor: 'border-brand-red',
          glowClass: 'glow-red',
          tag: '[ SYSTEM STATUS: PURGING COORDINATES ]',
          title: 'quest is deleting...',
          description: 'Permanently deleting quest directive and recalibrating coordinates. Please hold position.',
          loaderColor: 'text-brand-red animate-pulse',
          dotBg: 'bg-brand-red',
          progressGrad: 'from-brand-red to-red-650'
        }
      case 'updating':
        return {
          colorClass: 'brand-purple',
          borderColor: 'border-brand-purple',
          glowClass: 'glow-purple',
          tag: '[ SYSTEM STATUS: RECONFIGURING ]',
          title: 'UPDATING TRIAL COORDINATES...',
          description: 'Re-allocating stat benefits and trial difficulty settings. Please hold position.',
          loaderColor: 'text-brand-purple animate-pulse',
          dotBg: 'bg-brand-purple',
          progressGrad: 'from-brand-purple to-violet-500'
        }
      case 'fetching':
        return {
          colorClass: 'brand-blue',
          borderColor: 'border-brand-blue',
          glowClass: 'glow-blue',
          tag: '[ SYSTEM STATUS: SYNCING COORDINATES ]',
          title: 'hunter data fetching...',
          description: 'Retrieving database registries and updating hunter status levels. Please hold position.',
          loaderColor: 'text-brand-blue animate-pulse',
          dotBg: 'bg-brand-blue',
          progressGrad: 'from-brand-blue to-cyan-500'
        }
      case 'forging':
      default:
        return {
          colorClass: 'brand-purple',
          borderColor: 'border-brand-purple',
          glowClass: 'glow-purple',
          tag: '[ SYSTEM STATUS: FORGING TRIAL ]',
          title: 'FORGING QUEST IN THE COMPASS...',
          description: 'Recalibrating quest objectives parameters and status benefits. Please hold position.',
          loaderColor: 'text-brand-purple animate-pulse',
          dotBg: 'bg-brand-purple',
          progressGrad: 'from-brand-purple to-violet-500'
        }
    }
  }

  const loadingConfig = getLoadingConfig()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-wider text-white">
          CUSTOM QUEST COMPASS
        </h1>
        <p className="text-sm text-gray-400">
          Design your own repeatable trials to strengthen specific status coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (1/3): Add Quest Form */}
        <div className="space-y-6">
          <div className="bg-[#0b0f19] border-2 border-brand-purple/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            {/* Tech Bracket Corners */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-brand-purple" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-brand-purple" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-brand-purple" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-brand-purple" />

            <h2 className="text-lg font-black font-mono tracking-widest text-brand-purple glow-text-purple mb-5 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />
              {editingQuestId ? '[ EDIT QUEST DECK ]' : '[ FORGE NEW QUEST ]'}
            </h2>

            {error && (
              <div className="p-3 bg-red-950/40 border border-brand-red rounded-lg text-brand-red text-xs text-center font-mono mb-4 uppercase tracking-wider glow-red">
                {error}
              </div>
            )}

            {isLimitReached && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-brand-gold font-mono text-xs mb-4 space-y-3">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={14} /> ACTIVE CAP REACHED ({customQuests.length}/{limit})
                </p>
                <p className="text-[10px] text-gray-300">
                  {profile.is_pro 
                    ? 'You have reached the maximum limit of 40 active custom quests.' 
                    : 'Upgrade your status to PRO to increase custom quest limit to 40.'}
                </p>
                {!profile.is_pro && (
                  <button
                    type="button"
                    onClick={() => router.push('/upgrade')}
                    className="w-full py-2 bg-brand-gold text-black text-[10px] font-black uppercase rounded tracking-wider flex items-center justify-center gap-1 glow-gold cursor-pointer"
                  >
                    <Zap size={10} className="fill-black" /> Awaken PRO Version
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold font-mono text-brand-purple mb-1.5 uppercase tracking-widest">
                  [QUEST TITLE / PROTOCOL NAME]
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 15 pages of code"
                  disabled={isLimitReached || loadingStatus !== null}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-white text-sm placeholder-gray-655 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/40 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-brand-purple mb-1.5 uppercase tracking-widest">
                  [TRIAL TARGET PARAMETERS]
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about verification or workout targets..."
                  rows={3}
                  disabled={isLimitReached || loadingStatus !== null}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-white text-sm placeholder-gray-655 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/40 transition-all resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold font-mono text-brand-purple mb-1.5 uppercase tracking-widest">
                    [ALLOCATION]
                  </label>
                  <select
                    value={statCategory}
                    onChange={(e) => setStatCategory(e.target.value)}
                    disabled={isLimitReached || loadingStatus !== null}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/40 font-mono transition-all uppercase tracking-wider"
                  >
                    <option value="attack_power">Attack</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="endurance">Endurance</option>
                    <option value="stamina">Stamina</option>
                    <option value="exercise">Exercise</option>
                    <option value="skills">Skills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-brand-purple mb-1.5 uppercase tracking-widest">
                    [COOLDOWN]
                  </label>
                  <select
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value as any)}
                    disabled={isLimitReached || loadingStatus !== null}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/40 font-mono transition-all uppercase tracking-wider"
                  >
                    <option value="one-time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold font-mono text-brand-purple mb-1.5 uppercase tracking-widest">
                  <span>[QUEST REWARD XP]</span>
                  <span className="text-brand-purple glow-text-purple">+{xpReward} XP</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  disabled={isLimitReached || loadingStatus !== null}
                  className="w-full accent-brand-purple cursor-pointer"
                />
                <p className="text-[9px] text-gray-500 font-mono mt-1.5 uppercase tracking-wide leading-relaxed">
                  [SYSTEM NOTE: CUSTOM TRIALS CAPPED TO A MAXIMUM OF 30 XP TO REGULATE POWER BALANCE COORDINATES.]
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="proofRequired"
                  checked={proofRequired}
                  onChange={(e) => setProofRequired(e.target.checked)}
                  disabled={isLimitReached || loadingStatus !== null}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-purple focus:ring-0 cursor-pointer"
                />
                <label 
                  htmlFor="proofRequired" 
                  className="text-[10px] font-bold text-gray-400 font-mono select-none cursor-pointer uppercase tracking-widest"
                >
                  [REQUIRE VERIFIED PROOF LOG]
                </label>
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingQuestId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loadingStatus !== null}
                    className="flex-1 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-gray-400 hover:text-white font-extrabold font-mono text-xs uppercase rounded-lg tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={(!editingQuestId && isLimitReached) || loadingStatus !== null}
                  className="flex-[2] py-3 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold font-mono text-xs uppercase rounded-lg tracking-wider transition-all glow-purple disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loadingStatus !== null ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {editingQuestId ? <Zap size={14} /> : <Plus size={14} />} 
                      {editingQuestId ? 'Update Trial' : 'Forge Objective'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column (2/3): Custom Quests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-lg font-bold font-mono tracking-widest text-brand-blue glow-text-blue uppercase">
              ACTIVE FORGED TRIALS
            </h2>
            
            {/* Controls Panel */}
            {customQuests.length > 0 && (
              <div className="flex gap-2 items-center bg-slate-950/40 border border-slate-900 rounded-lg p-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="px-2 py-1 bg-[#02050c] border border-slate-800 rounded text-[9px] font-bold text-gray-300 focus:outline-none focus:border-brand-purple transition-all uppercase cursor-pointer"
                >
                  <option value="created">Created Date</option>
                  <option value="status">Quest Status</option>
                  <option value="priority">Priority (XP)</option>
                  <option value="category">Stat Category</option>
                  <option value="title">Alphabetical</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleViewModeChange(viewMode === 'list' ? 'grouped' : 'list')}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-brand-purple/40 hover:text-brand-purple rounded text-[9px] font-bold text-gray-300 transition-all uppercase cursor-pointer"
                >
                  View: {viewMode === 'list' ? 'List' : 'Group'}
                </button>
              </div>
            )}
          </div>

          {customQuests.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-10 text-center text-gray-500">
              <p className="font-mono text-sm uppercase mb-1">No custom trials active.</p>
              <p className="text-xs text-gray-600">Use the forging menu on the left to configure a trial.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === 'grouped' ? (
                <div className="space-y-4">
                  {Object.keys(groupedCustomQuests).map((category) => {
                    const list = groupedCustomQuests[category]
                    if (!list || list.length === 0) return null
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="text-[10px] font-black tracking-widest text-brand-purple/80 uppercase px-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/60" />
                          {category.replace('_', ' ')} Directives
                        </div>
                        <div className="space-y-1.5">
                          {list.map((quest) => {
                            const isCompleted = isQuestCompleted(quest)
                            return (
                              <motion.div
                                key={quest.id}
                                onClick={() => setSelectedQuest(quest)}
                                whileHover={{ scale: 1.02, y: -2 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                                className={`flex items-center justify-between p-2.5 rounded border transition-colors duration-150 cursor-pointer select-none gap-3 ${
                                  isCompleted 
                                    ? 'bg-slate-950/40 border-slate-900/20 opacity-60 hover:opacity-100 hover:border-brand-purple/30 hover:shadow-[0_0_12px_rgba(139,92,246,0.1)]' 
                                    : 'bg-[#0b0f19] border-brand-purple/20 hover:border-brand-purple/60 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isCompleted ? (
                                    <CheckCircle size={14} className="text-brand-purple shrink-0 fill-brand-purple/5" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-brand-purple/40 flex items-center justify-center shrink-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/30 animate-pulse" />
                                    </div>
                                  )}
                                  <span className={`text-[11px] font-bold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                    {quest.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statColor[quest.stat_category]}`}>
                                    {quest.stat_category.replace('_', ' ')}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[8px] text-brand-blue font-bold">
                                    +{quest.xp_reward} XP
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-[8px] text-brand-purple font-bold uppercase">
                                    {quest.repeat_type}
                                  </span>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sortedCustomQuests.map((quest) => {
                    const isCompleted = isQuestCompleted(quest)
                    return (
                      <motion.div
                        key={quest.id}
                        onClick={() => setSelectedQuest(quest)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                        className={`flex items-center justify-between p-2.5 rounded border transition-colors duration-150 cursor-pointer select-none gap-3 ${
                          isCompleted 
                            ? 'bg-slate-950/40 border-slate-900/20 opacity-60 hover:opacity-100 hover:border-brand-purple/30 hover:shadow-[0_0_12px_rgba(139,92,246,0.1)]' 
                            : 'bg-[#0b0f19] border-brand-purple/20 hover:border-brand-purple/60 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isCompleted ? (
                            <CheckCircle size={14} className="text-brand-purple shrink-0 fill-brand-purple/5" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-brand-purple/40 flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/30 animate-pulse" />
                            </div>
                          )}
                          <span className={`text-[11px] font-bold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {quest.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statColor[quest.stat_category]}`}>
                            {quest.stat_category.replace('_', ' ')}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[8px] text-brand-blue font-bold">
                            +{quest.xp_reward} XP
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-[8px] text-brand-purple font-bold uppercase">
                            {quest.repeat_type}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Quest Details Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setSelectedQuest(null); setConfirmedChecked(false) } }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-lg border-2 border-brand-purple bg-[#02050c]/98 p-6 shadow-2xl font-mono text-gray-200 z-10 glow-purple"
            >
              {/* Bracket corners */}
              {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                <div key={i} className="absolute w-4 h-4 border-brand-purple" />
              ))}

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
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-purple animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">
                    [ CUSTOM TRIAL PARAMETERS ]
                  </span>
                </div>
                <h2 className="text-sm font-black tracking-widest text-white uppercase mt-1">
                  Quest Details & Settings
                </h2>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-brand-purple/35 to-transparent mb-4" />

              {/* Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statColor[selectedQuest.stat_category]}`}>
                    STAT: {selectedQuest.stat_category.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-[9px] text-brand-purple font-bold uppercase tracking-wider">
                    REPEAT: {selectedQuest.repeat_type}
                  </span>
                  {selectedQuest.proof_required && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-brand-gold font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={10} /> PROOF REQUIRED
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
                    {selectedQuest.description || 'No requirements specified.'}
                  </p>
                </div>

                <div className="p-3 border border-brand-purple/20 bg-brand-purple/5 rounded">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-2 text-brand-purple">
                    [ COORDINATES SYNC REWARD ]
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

              <div className="h-[1px] w-full bg-gradient-to-r from-brand-purple/15 to-transparent my-4" />

              {/* Status Section */}
              {isQuestCompleted(selectedQuest) ? (
                <div className="bg-brand-purple/10 border border-brand-purple/35 rounded p-3 text-center mb-6 animate-pulse">
                  <p className="text-xs text-brand-purple font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
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
                      className="h-4 w-4 bg-slate-950 border border-brand-purple text-brand-purple rounded focus:ring-0 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-[9px] text-gray-300 uppercase select-none leading-none">
                      I confirm that I completed all required trials.
                    </span>
                  </label>
                </div>
              )}

              {/* Actions Grid */}
              <div className="flex flex-wrap gap-2 justify-between items-center">
                {/* Left actions: Edit and Delete */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleStartEdit(selectedQuest)
                      setSelectedQuest(null)
                    }}
                    disabled={modalLoading}
                    className="p-2 border border-slate-800 hover:border-brand-purple/40 hover:text-brand-purple bg-slate-900/50 hover:bg-slate-900 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    title="Edit Quest"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedQuest.id)
                      setSelectedQuest(null)
                    }}
                    disabled={modalLoading}
                    className="p-2 border border-red-500/20 text-brand-red hover:bg-brand-red/10 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    title="Purge Quest"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Right actions: Cancel / Claim */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedQuest(null); setConfirmedChecked(false) }}
                    disabled={modalLoading}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-gray-400 hover:text-white font-extrabold text-[10px] uppercase rounded transition-all cursor-pointer disabled:opacity-50"
                  >
                    Abort
                  </button>

                  {!isQuestCompleted(selectedQuest) && (
                    <button
                      onClick={handleClaimFromModal}
                      disabled={modalLoading || !confirmedChecked}
                      className="px-5 py-2 font-black text-[10px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed bg-brand-purple text-white glow-purple hover:bg-violet-600"
                    >
                      {modalLoading ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      ) : (
                        '[ CLAIM REWARD ]'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic System Loading Overlay */}
      <AnimatePresence>
        {loadingStatus !== null && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md font-mono text-gray-200 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative p-8 border-2 ${loadingConfig.borderColor} rounded-lg bg-[#02050c]/95 max-w-sm w-full text-center ${loadingConfig.glowClass}`}
            >
              {/* Brackets */}
              <div className={`absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 ${loadingConfig.borderColor}`} />
              <div className={`absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 ${loadingConfig.borderColor}`} />
              <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 ${loadingConfig.borderColor}`} />
              <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 ${loadingConfig.borderColor}`} />

              {/* Glowing Icon */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${loadingConfig.dotBg}`} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${loadingConfig.loaderColor}`}>
                  {loadingConfig.tag}
                </span>
              </div>

              <h3 className="text-sm font-black tracking-widest text-white uppercase mb-2 animate-pulse font-mono">
                {loadingConfig.title}
              </h3>
              <p className="text-[9px] text-gray-400 uppercase leading-relaxed mb-6 font-mono">
                {loadingConfig.description}
              </p>

              <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className={`h-full bg-gradient-to-r ${loadingConfig.progressGrad}`}
                />
              </div>

              <div className="mt-6 text-[9px] text-gray-500 uppercase tracking-widest font-mono">
                [ TRANSMISSION SYNC RATE: SECURE ]
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {questIdToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuestIdToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-6 border-2 border-brand-red rounded-lg bg-[#02050c]/98 max-w-sm w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.25)] font-mono text-gray-200 z-10"
            >
              {/* Brackets */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-brand-red" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-brand-red" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-brand-red" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-brand-red" />

              <div className="flex justify-center mb-3 text-brand-red animate-pulse">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-xs font-black tracking-widest text-brand-red glow-text-red uppercase mb-2">
                [ SYSTEM DIRECTIVE PURGE ]
              </h3>
              
              <p className="text-xs text-gray-300 uppercase tracking-wide leading-relaxed mb-6 font-semibold">
                Are you sure you want to delete this custom quest? This action will permanently remove it from your trials deck.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setQuestIdToDelete(null)}
                  className="flex-1 py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-gray-400 hover:text-white font-extrabold font-mono text-[10px] uppercase rounded tracking-wider transition-all cursor-pointer"
                >
                  [ ABORT ]
                </button>
                <button
                  onClick={async () => {
                    const id = questIdToDelete
                    setQuestIdToDelete(null)
                    await performDelete(id)
                  }}
                  className="flex-1 py-2.5 bg-brand-red hover:bg-red-700 text-white font-extrabold font-mono text-[10px] uppercase rounded tracking-wider transition-all glow-red cursor-pointer"
                >
                  [ CONFIRM PURGE ]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
