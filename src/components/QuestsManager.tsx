'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap, AlertTriangle, CheckCircle, ShieldCheck, Edit3 } from 'lucide-react'
import { Profile, CustomQuest } from '@/types'
import { addCustomQuest, deleteCustomQuest, editCustomQuest } from '@/app/actions/quests'

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
          <h2 className="text-lg font-bold font-mono tracking-widest text-brand-blue glow-text-blue uppercase">
            ACTIVE FORGED TRIALS
          </h2>

          {customQuests.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-10 text-center text-gray-500">
              <p className="font-mono text-sm uppercase mb-1">No custom trials active.</p>
              <p className="text-xs text-gray-600">Use the forging menu on the left to configure a trial.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-[#0b0f19] border border-slate-850 rounded-xl p-5 hover:border-brand-purple/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-brand-purple font-mono uppercase tracking-wider font-semibold">
                        {quest.stat_category.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-brand-blue font-mono uppercase tracking-wider font-semibold">
                        Repeat: {quest.repeat_type}
                      </span>
                      {quest.proof_required && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-brand-gold font-mono uppercase tracking-wider font-semibold flex items-center gap-1">
                          <ShieldCheck size={10} /> Proof Required
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white truncate">{quest.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{quest.description}</p>
                    </div>

                    <div className="text-[11px] text-gray-500 font-mono">
                      XP Reward: <span className="text-brand-purple font-semibold">+{quest.xp_reward} XP</span>
                      {quest.last_completed_at && (
                        <span className="ml-3">
                          Last Completed: {new Date(quest.last_completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-900">
                    <button
                      onClick={() => handleStartEdit(quest)}
                      className={`p-2 border rounded-lg transition-all cursor-pointer flex-1 md:flex-none flex justify-center ${
                        editingQuestId === quest.id 
                          ? 'border-brand-purple text-brand-purple bg-brand-purple/10 glow-purple' 
                          : 'border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(quest.id)}
                      className="p-2 border border-red-500/20 text-brand-red hover:bg-brand-red/10 rounded-lg transition-all cursor-pointer flex-1 md:flex-none flex justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      </div>

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
