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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form States
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [statCategory, setStatCategory] = useState('attack_power')
  const [xpReward, setXpReward] = useState(50)
  const [repeatType, setRepeatType] = useState<'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [proofRequired, setProofRequired] = useState(false)
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null)

  // Enforce Quest Limits (bypassed if editing)
  const limit = profile.is_pro ? 40 : 3
  const isLimitReached = !editingQuestId && customQuests.length >= limit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

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

      setLoading(false)

      if (res.error) {
        setError(res.error)
      } else {
        // Clear form
        setTitle('')
        setDescription('')
        setXpReward(50)
        setProofRequired(false)
        setEditingQuestId(null)
        router.refresh()
      }
      return
    }

    if (isLimitReached) {
      setError(`Active custom quests limit reached (${customQuests.length}/${limit}). ${profile.is_pro ? 'Limit is 40.' : 'Upgrade to PRO to get 40 slots!'}`)
      setLoading(false)
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

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      // Clear form
      setTitle('')
      setDescription('')
      setXpReward(50)
      setProofRequired(false)
      router.refresh()
    }
  }

  const handleDelete = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this custom quest?')) return
    const res = await deleteCustomQuest(questId)
    if (res.error) {
      alert(res.error)
    } else {
      if (editingQuestId === questId) {
        handleCancelEdit()
      }
      router.refresh()
    }
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
    setXpReward(50)
    setProofRequired(false)
    setError(null)
  }

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
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold font-mono tracking-widest text-brand-purple glow-text-purple mb-4 uppercase">
              {editingQuestId ? 'EDIT TRIAL' : 'CREATE TRIAL'}
            </h2>

            {error && (
              <div className="p-3 bg-red-950/20 border border-brand-red/50 rounded-lg text-brand-red text-xs text-center font-mono mb-4">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  Quest Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 15 pages of code"
                  disabled={isLimitReached || loading}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about verification or workout targets..."
                  rows={3}
                  disabled={isLimitReached || loading}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Stat Boost
                  </label>
                  <select
                    value={statCategory}
                    onChange={(e) => setStatCategory(e.target.value)}
                    disabled={isLimitReached || loading}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-brand-purple font-mono"
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
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Schedule
                  </label>
                  <select
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value as any)}
                    disabled={isLimitReached || loading}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-brand-purple font-mono"
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
                <div className="flex justify-between text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                  <span>XP REWARD</span>
                  <span className="text-brand-purple font-bold">+{xpReward} XP</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  disabled={isLimitReached || loading}
                  className="w-full accent-brand-purple cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="proofRequired"
                  checked={proofRequired}
                  onChange={(e) => setProofRequired(e.target.checked)}
                  disabled={isLimitReached || loading}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-purple focus:ring-0 cursor-pointer"
                />
                <label 
                  htmlFor="proofRequired" 
                  className="text-xs text-gray-400 font-mono select-none cursor-pointer uppercase tracking-wider"
                >
                  Require Image Proof
                </label>
              </div>

              <div className="flex gap-2">
                {editingQuestId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="flex-1 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-gray-400 hover:text-white font-extrabold font-mono text-xs uppercase rounded-lg tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={(!editingQuestId && isLimitReached) || loading}
                  className="flex-[2] py-3 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold font-mono text-xs uppercase rounded-lg tracking-wider transition-all glow-purple disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {editingQuestId ? <Zap size={14} /> : <Plus size={14} />} 
                      {editingQuestId ? 'Update Quest' : 'Forge Quest'}
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

      {/* Forging Quest Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md font-mono text-gray-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-8 border-2 border-brand-purple rounded-lg bg-[#02050c]/95 max-w-sm w-full text-center glow-purple"
            >
              {/* Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-purple" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-purple" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-purple" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-purple" />

              {/* Glowing Icon */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full animate-ping bg-brand-purple" />
                <span className="text-[10px] font-black tracking-widest uppercase text-brand-purple">
                  [ SYSTEM STATUS: FORGING TRIAL ]
                </span>
              </div>

              <h3 className="text-sm font-black tracking-widest text-white uppercase mb-2 animate-pulse">
                {editingQuestId ? 'UPDATING TRIAL COORDINATES...' : 'FORGING QUEST IN THE COMPASS...'}
              </h3>
              <p className="text-[9px] text-gray-400 uppercase leading-relaxed mb-6">
                Recalibrating quest objectives parameters and status benefits. Please hold position.
              </p>

              <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-brand-purple to-violet-500"
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
