'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  Flame, 
  Zap, 
  User, 
  Mail, 
  Trophy, 
  CreditCard,
  CheckCircle,
  HelpCircle,
  UploadCloud
} from 'lucide-react'
import { Profile, Subscription } from '@/types'
import { updateProfile, usePenaltyShield } from '@/app/actions/profile'
import { createPortalSession } from '@/app/actions/stripe'
import { getXPForNextLevel } from '@/lib/game'

interface ProfileDetailsProps {
  profile: Profile
  subscription: Subscription | null
}

export default function ProfileDetails({
  profile,
  subscription,
}: ProfileDetailsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shieldLoading, setShieldLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form edit states
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isEditing, setIsEditing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const supabase = createClient()
      
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB.')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Upload failed: ${err.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  // XP calculations
  const xpNeeded = getXPForNextLevel(profile.level)
  const xpPercent = Math.min(100, (profile.total_xp / xpNeeded) * 100)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await updateProfile(displayName, avatarUrl || null)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setIsEditing(false)
      router.refresh()
    }
  }

  const handleUseShield = async () => {
    if (profile.penalty_shield_used_this_week) return
    setShieldLoading(true)
    const res = await usePenaltyShield()
    setShieldLoading(false)

    if (res.error) {
      alert(res.error)
    } else {
      router.refresh()
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    const res = await createPortalSession()
    setPortalLoading(false)

    if (res.error) {
      alert(res.error)
    } else if (res.url) {
      router.push(res.url)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-wider text-white">
          HUNTER PROFILE
        </h1>
        <p className="text-sm text-gray-400">
          View your rank coordinates, customize identity, and manage status perks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Main identity */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          {profile.is_pro && (
            <div className="absolute top-4 right-4 bg-brand-gold text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full glow-gold animate-pulse">
              PRO LEVEL
            </div>
          )}

          {/* Avatar and Info */}
          <div className="relative mt-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className={`w-28 h-28 rounded-full border-4 ${profile.is_pro ? 'border-brand-gold glow-gold' : 'border-brand-blue glow-blue'} object-cover`}
              />
            ) : (
              <div className={`w-28 h-28 rounded-full bg-slate-900 border-4 ${profile.is_pro ? 'border-brand-gold glow-gold' : 'border-brand-blue glow-blue'} flex items-center justify-center font-bold text-4xl text-white`}>
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
              {profile.display_name}
            </h2>
            <p className="text-sm text-brand-purple font-mono font-bold glow-text-purple uppercase tracking-wider">
              {profile.rank}
            </p>
            <p className="text-xs text-gray-400">Level {profile.level} Hunter</p>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className="w-full space-y-3 text-left">
              {error && (
                <div className="p-2 bg-red-950/20 border border-brand-red/50 rounded-lg text-brand-red text-[11px] text-center font-mono">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Avatar Upload (Drag & Drop or Select)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-brand-purple bg-brand-purple/10 text-white'
                      : 'border-slate-800 hover:border-brand-blue/50 bg-slate-950/50 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue glow-text-blue">
                        [ UPLOADING SIGNATURE... ]
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className={isDragging ? 'text-brand-purple' : 'text-gray-500'} />
                      <div className="text-[10px] font-mono uppercase tracking-wide">
                        {avatarUrl ? (
                          <span className="text-brand-blue">[ IMAGE READY - CLICK TO REPLACE ]</span>
                        ) : (
                          <span>DROP IMAGE HERE OR CLICK TO CHOOSE</span>
                        )}
                      </div>
                      <p className="text-[8px] text-gray-500 uppercase">
                        PNG, JPG, WEBP UP TO 2MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Avatar Link URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue placeholder-gray-700"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-brand-blue text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all glow-blue disabled:opacity-50 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 border border-slate-800 hover:bg-slate-900 text-gray-400 text-xs font-mono uppercase rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 border border-slate-800 hover:bg-slate-900 hover:text-white text-gray-400 font-mono text-xs uppercase rounded-lg tracking-wider transition-all cursor-pointer"
            >
              Modify Identity
            </button>
          )}

          {/* XP details */}
          <div className="w-full pt-4 border-t border-slate-900">
            <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
              <span>SYSTEM LEVEL PROGRESS</span>
              <span>{profile.total_xp} / {xpNeeded}</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div 
                className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Section (2/3 width): Status Perks & Perks info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pro Panel Perks & Stripe billing details */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-bold font-mono tracking-widest text-brand-gold glow-text-gold uppercase flex items-center gap-2">
              <Zap className="fill-brand-gold text-brand-gold" size={20} />
              Hunter Status Perks
            </h3>

            {profile.is_pro ? (
              <div className="space-y-4">
                <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm font-mono text-white">
                    <span className="font-bold flex items-center gap-1"><CheckCircle className="text-brand-gold" size={16} /> PRO MEMBERSHIP</span>
                    <span className="text-brand-gold glow-text-gold font-extrabold uppercase">ACTIVE</span>
                  </div>
                  {subscription && (
                    <p className="text-xs text-gray-400 font-mono">
                      Stripe Period End: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="mt-2 flex items-center gap-2 px-4 py-2 border border-brand-gold/30 hover:border-brand-gold/50 text-brand-gold font-mono font-bold text-xs uppercase rounded-lg transition-all glow-gold disabled:opacity-50 cursor-pointer"
                  >
                    <CreditCard size={12} />
                    {portalLoading ? 'Syncing...' : 'Manage Stripe Billing'}
                  </button>
                </div>

                {/* Penalty Shield Section */}
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                      <ShieldCheck className="text-brand-blue" size={16} />
                      WEEKLY PENALTY SHIELD
                    </h4>
                    <p className="text-xs text-gray-400">
                      Shield yourself from a single daily quest missed penalty once per week.
                    </p>
                  </div>

                  <button
                    onClick={handleUseShield}
                    disabled={profile.penalty_shield_used_this_week || shieldLoading}
                    className={`px-4 py-2 font-mono font-extrabold text-xs uppercase rounded-lg transition-all shrink-0 cursor-pointer ${
                      profile.penalty_shield_used_this_week
                        ? 'bg-slate-900 border border-slate-800 text-gray-500'
                        : 'bg-brand-blue text-black glow-blue hover:bg-[#00d0dd]'
                    }`}
                  >
                    {shieldLoading 
                      ? 'Activating...' 
                      : profile.penalty_shield_used_this_week 
                        ? 'Shield Exhausted' 
                        : 'Deploy Shield'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  You are currently registered as a Free hunter. Upgrade your credentials to unlock elite perks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-300">
                  <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <CheckCircle className="text-brand-purple" size={14} /> Unlimited Custom Quests
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <CheckCircle className="text-brand-purple" size={14} /> Weekend Double XP Trigger
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <CheckCircle className="text-brand-purple" size={14} /> Weekly Penalty Shield
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <CheckCircle className="text-brand-purple" size={14} /> Unlimited Stat Dimensions history
                  </div>
                </div>
                <button
                  onClick={() => router.push('/upgrade')}
                  className="w-full py-3 bg-brand-gold text-black font-black font-mono text-sm uppercase rounded-lg tracking-wider transition-all glow-gold cursor-pointer"
                >
                  Initiate Awakening ($4.99/mo)
                </button>
              </div>
            )}
          </div>

          {/* Stats breakdown */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono tracking-widest text-brand-blue glow-text-blue uppercase">
              Hunter Attributes Coordinates
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center font-mono">
              {[
                { name: 'Attack Power', value: profile.attack_power },
                { name: 'Intelligence', value: profile.intelligence },
                { name: 'Endurance', value: profile.endurance },
                { name: 'Stamina', value: profile.stamina },
                { name: 'Exercise', value: profile.exercise },
                { name: 'Skills', value: profile.skills },
              ].map((coord) => (
                <div key={coord.name} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider">{coord.name}</span>
                  <span className="text-lg font-bold text-white">{coord.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
