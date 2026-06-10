'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Smartphone, 
  Send, 
  AlertCircle, 
  History, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/stripe'
import { createProUpgradeRequest } from '@/app/actions/bkash'
import { Profile, BkashConfig, BkashRequest } from '@/types'

interface UpgradeOptionsProps {
  profile: Profile
  bkashConfig: BkashConfig
  initialRequests: BkashRequest[]
}

type MethodType = 'stripe' | 'bkash'

export default function UpgradeOptions({ 
  profile, 
  bkashConfig, 
  initialRequests 
}: UpgradeOptionsProps) {
  const router = useRouter()
  const [method, setMethod] = useState<MethodType>('bkash')
  
  // Stripe States
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [stripeError, setStripeError] = useState<string | null>(null)

  // bKash States
  const [selectedBkashPackage, setSelectedBkashPackage] = useState<'1_month' | '3_months' | '6_months' | '1_year' | null>(null)
  const [senderNumber, setSenderNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [bkashLoading, setBkashLoading] = useState(false)
  const [bkashError, setBkashError] = useState<string | null>(null)
  const [bkashSuccess, setBkashSuccess] = useState<string | null>(null)
  const [requests, setRequests] = useState<BkashRequest[]>(initialRequests)

  const handleSubscribeStripe = async (plan: 'monthly' | 'yearly') => {
    setLoadingPlan(plan)
    setStripeError(null)

    const res = await createCheckoutSession(plan)
    setLoadingPlan(null)

    if (res.error) {
      setStripeError(res.error)
    } else if (res.url) {
      window.location.href = res.url
    }
  }

  const handleBkashSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBkashPackage) return

    setBkashLoading(true)
    setBkashError(null)
    setBkashSuccess(null)

    let amount = bkashConfig.price_3_months
    if (selectedBkashPackage === '1_month') amount = bkashConfig.price_1_month
    else if (selectedBkashPackage === '6_months') amount = bkashConfig.price_6_months
    else if (selectedBkashPackage === '1_year') amount = bkashConfig.price_1_year

    const res = await createProUpgradeRequest(senderNumber, transactionId, selectedBkashPackage, amount)
    setBkashLoading(false)

    if (res.error) {
      setBkashError(res.error)
    } else {
      setBkashSuccess('Your upgrade request has been submitted successfully to the gatekeeper admin. Checking credentials shortly.')
      setSenderNumber('')
      setTransactionId('')
      setSelectedBkashPackage(null)
      // Optimistic/Local refresh of requests list
      const newRequest: BkashRequest = {
        id: Math.random().toString(),
        user_id: profile.id,
        sender_number: senderNumber,
        transaction_id: transactionId.trim().toUpperCase(),
        package_type: selectedBkashPackage,
        amount,
        status: 'pending',
        admin_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setRequests(prev => [newRequest, ...prev])
      router.refresh()
    }
  }

  const getPackageLabel = (type: string) => {
    switch(type) {
      case '1_month': return 'Hunter Recruit (1m)'
      case '3_months': return 'Elite Aspirant (3m)'
      case '6_months': return 'Shadow Monarch (6m)'
      case '1_year': return 'Eternal Sovereign (1y)'
      default: return type
    }
  }

  const features = [
    { title: 'Unlimited Custom Quests', desc: 'Free users are locked to active custom quest limits.' },
    { title: 'Double XP on Weekends', desc: 'Earn 2x standard XP on Saturday and Sunday completions.' },
    { title: 'Weekly Penalty Shield', desc: 'Avoid one stat/XP degradation penalty per week.' },
    { title: 'Unlimited Stat History', desc: 'View historical coordinate graphs beyond 30 days.' },
    { title: 'Exclusive Profile Avatar Border', desc: 'Showcase status credentials with glowing gold borders.' },
    { title: 'Priority Support Access', desc: 'Direct priority communications queue to system admins.' }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono text-gray-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-widest text-brand-gold glow-text-gold uppercase flex items-center justify-center gap-2">
          <Zap className="fill-brand-gold text-brand-gold animate-pulse" size={24} /> STATUS AWAKENING
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Overcome the system limitations. Ascend past human limits and unlock your true Hunter potential.
        </p>
      </div>

      {profile.is_pro ? (
        <div className="bg-[#02050c]/90 border-2 border-brand-gold p-6 sm:p-8 rounded-xl text-center max-w-md mx-auto space-y-4 glow-gold relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-gold" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-gold" />
          <Sparkles className="mx-auto text-brand-gold animate-bounce" size={40} />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            YOU ARE ALREADY AWAKENED!
          </h2>
          <p className="text-xs text-gray-400">
            Your Pro hunter credentials are active. Enjoy the unlocked gate features.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-brand-gold hover:bg-yellow-400 text-black font-extrabold text-xs uppercase rounded tracking-wider glow-gold cursor-pointer transition-all"
          >
            Go to Status coordinates
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Method Switcher */}
          <div className="flex justify-center max-w-sm mx-auto bg-slate-950/80 p-1 border border-slate-900 rounded-lg">
            <button
              onClick={() => setMethod('bkash')}
              className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                method === 'bkash'
                  ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/30 glow-blue'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              bKash (BDT)
            </button>
            <button
              onClick={() => setMethod('stripe')}
              className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                method === 'stripe'
                  ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/30 glow-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Card (USD)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === 'stripe' ? (
              <motion.div
                key="stripe"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {stripeError && (
                  <div className="max-w-md mx-auto p-3 bg-brand-red/5 border border-brand-red/40 rounded-lg text-brand-red text-xs text-center">
                    ⚠️ {stripeError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Stripe Monthly */}
                  <div className="bg-[#02050c]/95 border border-slate-850 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-brand-purple/40 transition-all relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-purple/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-purple/30" />
                    <div className="space-y-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                        Monthly Tier
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase">Hunter Elite</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Continuous active progression mode.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">$4.99</span>
                        <span className="text-xs text-gray-500">/ month</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubscribeStripe('monthly')}
                      disabled={loadingPlan !== null}
                      className="mt-6 w-full py-2.5 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold text-xs uppercase tracking-wider rounded transition-all glow-purple disabled:opacity-50 cursor-pointer"
                    >
                      {loadingPlan === 'monthly' ? 'Initializing...' : 'Awaken Monthly Perks'}
                    </button>
                  </div>

                  {/* Stripe Yearly */}
                  <div className="bg-[#02050c]/95 border-2 border-brand-gold rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-brand-gold/60 transition-all relative glow-gold">
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-gold text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      Save 17%
                    </div>
                    <div className="space-y-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-brand-gold/25 text-[9px] text-brand-gold uppercase tracking-widest font-semibold">
                        Yearly Tier
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase">Monarch Ascension</h3>
                        <p className="text-[10px] text-amber-500/80 mt-1">Unlock supreme Monarch stats.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">$49.99</span>
                        <span className="text-xs text-gray-500">/ year</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubscribeStripe('yearly')}
                      disabled={loadingPlan !== null}
                      className="mt-6 w-full py-2.5 bg-brand-gold hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded transition-all glow-gold disabled:opacity-50 cursor-pointer"
                    >
                      {loadingPlan === 'yearly' ? 'Initializing...' : 'Awaken Yearly Perks'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="bkash"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* bKash Packages Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                  {/* 1 Month */}
                  <div className={`bg-[#02050c]/95 border rounded-xl p-5 flex flex-col justify-between transition-all relative cursor-pointer ${
                    selectedBkashPackage === '1_month' 
                      ? 'border-brand-blue glow-blue' 
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                    onClick={() => setSelectedBkashPackage('1_month')}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-blue/30" />
                    <div className="space-y-3">
                      <span className="px-2 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[9px] text-brand-blue font-bold uppercase tracking-wider">
                        1 Month
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase">Hunter Recruit</h3>
                        <p className="text-[9px] text-gray-500 mt-1">Excellent for brief coordinate sync.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{bkashConfig.price_1_month} BDT</span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 w-full py-1.5 font-bold text-[10px] uppercase rounded transition-all cursor-pointer ${
                        selectedBkashPackage === '1_month'
                          ? 'bg-brand-blue text-black glow-blue'
                          : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {selectedBkashPackage === '1_month' ? 'Package Selected' : 'Select Package'}
                    </button>
                  </div>

                  {/* 3 Months */}
                  <div className={`bg-[#02050c]/95 border rounded-xl p-5 flex flex-col justify-between transition-all relative cursor-pointer ${
                    selectedBkashPackage === '3_months' 
                      ? 'border-brand-blue glow-blue' 
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                    onClick={() => setSelectedBkashPackage('3_months')}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-blue/30" />
                    <div className="space-y-3">
                      <span className="px-2 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[9px] text-brand-blue font-bold uppercase tracking-wider">
                        3 Months
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase">Elite Aspirant</h3>
                        <p className="text-[9px] text-gray-500 mt-1">Excellent for active coordinate sync.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{bkashConfig.price_3_months} BDT</span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 w-full py-1.5 font-bold text-[10px] uppercase rounded transition-all cursor-pointer ${
                        selectedBkashPackage === '3_months'
                          ? 'bg-brand-blue text-black glow-blue'
                          : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {selectedBkashPackage === '3_months' ? 'Package Selected' : 'Select Package'}
                    </button>
                  </div>

                  {/* 6 Months */}
                  <div className={`bg-[#02050c]/95 border rounded-xl p-5 flex flex-col justify-between transition-all relative cursor-pointer ${
                    selectedBkashPackage === '6_months' 
                      ? 'border-brand-purple glow-purple' 
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                    onClick={() => setSelectedBkashPackage('6_months')}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-purple/30" />
                    <div className="space-y-3">
                      <span className="px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-[9px] text-brand-purple font-bold uppercase tracking-wider">
                        6 Months
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase">Shadow Monarch</h3>
                        <p className="text-[9px] text-gray-500 mt-1">High level progression capabilities.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{bkashConfig.price_6_months} BDT</span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 w-full py-1.5 font-bold text-[10px] uppercase rounded transition-all cursor-pointer ${
                        selectedBkashPackage === '6_months'
                          ? 'bg-brand-purple text-white glow-purple'
                          : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {selectedBkashPackage === '6_months' ? 'Package Selected' : 'Select Package'}
                    </button>
                  </div>

                  {/* 1 Year */}
                  <div className={`bg-[#02050c]/95 border rounded-xl p-5 flex flex-col justify-between transition-all relative glow-gold cursor-pointer ${
                    selectedBkashPackage === '1_year' 
                      ? 'border-brand-gold' 
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                    onClick={() => setSelectedBkashPackage('1_year')}
                  >
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-gold text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Best Value
                    </div>
                    <div className="space-y-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-brand-gold/25 text-[9px] text-brand-gold font-bold uppercase tracking-wider">
                        1 Year
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase">Eternal Sovereign</h3>
                        <p className="text-[9px] text-amber-500/70 mt-1">Supreme status. Full override limits.</p>
                      </div>
                      <div className="py-2 border-y border-slate-900/60 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{bkashConfig.price_1_year} BDT</span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 w-full py-1.5 font-bold text-[10px] uppercase rounded transition-all cursor-pointer ${
                        selectedBkashPackage === '1_year'
                          ? 'bg-brand-gold text-black glow-gold'
                          : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {selectedBkashPackage === '1_year' ? 'Package Selected' : 'Select Package'}
                    </button>
                  </div>
                </div>

                {/* bKash Payment Form Segment */}
                {selectedBkashPackage ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="max-w-xl mx-auto bg-[#02050c]/98 border border-slate-850 p-5 rounded-lg space-y-4 relative"
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-blue/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-blue/40" />

                    <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                      <Smartphone className="text-brand-blue animate-pulse" size={18} />
                      <h4 className="text-xs font-black tracking-widest text-brand-blue uppercase">
                        [ bKash Manual Transfer Portal ]
                      </h4>
                    </div>

                    {bkashError && (
                      <div className="p-3 bg-brand-red/5 border border-brand-red/40 rounded text-brand-red text-[10px] uppercase">
                        ⚠️ {bkashError}
                      </div>
                    )}

                    {bkashSuccess && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-[10px] uppercase">
                        ✓ {bkashSuccess}
                      </div>
                    )}

                    <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                      <p>
                        1. Go to your **bKash App** or dial `*247#` and select **Send Money**.
                      </p>
                      <p>
                        2. Send exactly <strong className="text-white">
                          {selectedBkashPackage === '1_month' ? bkashConfig.price_1_month : selectedBkashPackage === '3_months' ? bkashConfig.price_3_months : selectedBkashPackage === '6_months' ? bkashConfig.price_6_months : bkashConfig.price_1_year} BDT
                        </strong> to the official bKash number: <strong className="text-brand-blue underline decoration-dashed glow-text-blue">{bkashConfig.number}</strong>
                      </p>
                      <p>
                        3. Once payment is sent, fill out the form below with your details to request manual verification by admin:
                      </p>
                    </div>

                    <form onSubmit={handleBkashSubmit} className="space-y-4 pt-3 border-t border-slate-900">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">
                            Your bKash Number (Sender)
                          </label>
                          <input
                            type="text"
                            placeholder="017XXXXXXXX"
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            required
                            disabled={bkashLoading}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded font-mono text-xs text-white focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">
                            bKash Transaction ID (TxnID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 8N7X2L9P4K"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            required
                            disabled={bkashLoading}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded font-mono text-xs text-white focus:outline-none focus:border-brand-blue uppercase"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => { setSelectedBkashPackage(null); setBkashError(null); setBkashSuccess(null) }}
                          className="px-4 py-2 border border-slate-850 hover:bg-slate-900 text-gray-400 font-extrabold text-[10px] uppercase rounded transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={bkashLoading}
                          className="px-5 py-2 bg-brand-blue text-black font-black text-[10px] uppercase tracking-wider rounded glow-blue flex items-center gap-2 cursor-pointer hover:bg-cyan-400 disabled:opacity-50"
                        >
                          {bkashLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={12} />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <Send size={12} />
                              [ Request Pro Sync ]
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <div className="max-w-md mx-auto text-center p-6 border border-dashed border-slate-900 rounded-lg text-gray-500 text-xs">
                    💡 Select one of the bKash packages above to trigger the mobile payment portal.
                  </div>
                )}

                {/* bKash Payment Request Logs */}
                {requests.length > 0 && (
                  <div className="max-w-2xl mx-auto space-y-4 pt-6 border-t border-slate-900">
                    <h3 className="font-bold text-xs text-white uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-brand-blue" /> [ Upgrade Request Logs ]
                    </h3>

                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div 
                          key={req.id}
                          className="bg-[#02050c]/90 border border-slate-900 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black text-white uppercase">
                                {getPackageLabel(req.package_type)}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                {new Date(req.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400">
                              Sender: <strong className="text-gray-300">{req.sender_number}</strong> | TxnID: <strong className="text-gray-300 uppercase">{req.transaction_id}</strong>
                            </div>
                            {req.admin_notes && (
                              <div className="text-[9px] text-brand-red bg-brand-red/5 border border-brand-red/10 px-2 py-1 rounded mt-1.5">
                                Notes: {req.admin_notes}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0">
                            {req.status === 'pending' && (
                              <span className="px-2.5 py-1 rounded bg-slate-950 border border-amber-500/35 text-[9px] font-bold text-amber-500 uppercase tracking-wider animate-pulse">
                                Pending
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-[9px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 size={10} /> Validated
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded bg-brand-red/10 border border-brand-red/30 text-[9px] font-bold text-brand-red uppercase tracking-wider flex items-center gap-1">
                                <XCircle size={10} /> Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Benefits List */}
      <div className="pt-8 border-t border-slate-900 max-w-3xl mx-auto">
        <h3 className="text-center font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">
          System Perk Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
