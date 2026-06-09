'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Check, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/stripe'
import { Profile } from '@/types'

interface UpgradeOptionsProps {
  profile: Profile
}

export default function UpgradeOptions({ profile }: UpgradeOptionsProps) {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoadingPlan(plan)
    setError(null)

    const res = await createCheckoutSession(plan)
    setLoadingPlan(null)

    if (res.error) {
      setError(res.error)
    } else if (res.url) {
      window.location.href = res.url
    }
  }

  const features = [
    { title: 'Unlimited Custom Quests', desc: 'Free users are locked to 5 active custom quests.' },
    { title: 'Double XP on Weekends', desc: 'Earn 2x standard XP on Saturday and Sunday completions.' },
    { title: 'Weekly Penalty Shield', desc: 'Avoid one stat/XP degradation penalty per week.' },
    { title: 'Unlimited Stat History', desc: 'View historical coordinate graphs beyond 30 days.' },
    { title: 'Exclusive Profile Avatar Border', desc: 'Showcase status credentials with glowing gold borders.' },
    { title: 'Priority Support Access', desc: 'Direct priority communications queue to system admins.' }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-extrabold font-mono tracking-widest text-brand-gold glow-text-gold uppercase flex items-center justify-center gap-2">
          <Zap className="fill-brand-gold" /> STATUS AWAKENING
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Overcome the system limitations. Ascend past human limits and unlock your true Hunter potential.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-3 bg-red-950/20 border border-brand-red/50 rounded-lg text-brand-red text-xs text-center font-mono">
          {error}
        </div>
      )}

      {profile.is_pro ? (
        <div className="bg-[#0b0f19] border-2 border-brand-gold p-8 rounded-xl text-center max-w-md mx-auto space-y-4 glow-gold">
          <Sparkles className="mx-auto text-brand-gold animate-spin-slow" size={40} />
          <h2 className="text-xl font-bold font-mono text-white uppercase tracking-wider">
            YOU ARE ALREADY AWAKENED!
          </h2>
          <p className="text-xs text-gray-400">
            Your Pro hunter credentials are active. You can manage or cancel your subscription directly from your Profile settings.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="w-full py-2.5 bg-brand-gold text-black font-extrabold font-mono text-xs uppercase rounded-lg tracking-wider glow-gold cursor-pointer"
          >
            Go to Profile coordinates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Monthly Card */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all relative">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold">
                Monthly Tier
              </span>
              <div>
                <h3 className="text-2xl font-black text-white font-mono uppercase">Hunter Elite</h3>
                <p className="text-xs text-gray-500 mt-1">Perfect for continuous progression.</p>
              </div>
              <div className="py-2 border-y border-slate-900 flex items-baseline gap-1.5 font-mono">
                <span className="text-4xl font-extrabold text-white">$4.99</span>
                <span className="text-xs text-gray-500">/ month</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null}
              className="mt-6 w-full py-3 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold font-mono text-xs uppercase tracking-wider rounded-lg transition-all glow-purple disabled:opacity-50 cursor-pointer"
            >
              {loadingPlan === 'monthly' ? 'Initializing...' : 'Awaken Monthly Perks'}
            </button>
          </div>

          {/* Yearly Card */}
          <div className="bg-[#0b0f19] border-2 border-brand-gold rounded-2xl p-6 flex flex-col justify-between hover:border-brand-gold/60 transition-all relative glow-gold">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-gold text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Best Value (Save 17%)
            </div>

            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-brand-gold/20 text-[10px] font-mono text-brand-gold uppercase tracking-widest font-semibold">
                Yearly Tier
              </span>
              <div>
                <h3 className="text-2xl font-black text-white font-mono uppercase">Monarch Ascension</h3>
                <p className="text-xs text-amber-500/80 mt-1">Unlock supreme hunter potential.</p>
              </div>
              <div className="py-2 border-y border-slate-900 flex items-baseline gap-1.5 font-mono">
                <span className="text-4xl font-extrabold text-white">$49.99</span>
                <span className="text-xs text-gray-500">/ year</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingPlan !== null}
              className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black font-mono text-xs uppercase tracking-wider rounded-lg transition-all glow-gold disabled:opacity-50 cursor-pointer"
            >
              {loadingPlan === 'yearly' ? 'Initializing...' : 'Awaken Yearly Perks'}
            </button>
          </div>

        </div>
      )}

      {/* Benefits List */}
      <div className="pt-8 border-t border-slate-900 max-w-3xl mx-auto">
        <h3 className="text-center font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">
          System Perk Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{f.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
