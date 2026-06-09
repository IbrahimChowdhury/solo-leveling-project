'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  User,
  Mail,
  Lock,
  Compass,
  Award,
  BarChart3,
  Flame
} from 'lucide-react'
import { signUp } from '@/app/actions/auth'

export default function LandingPage() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const classes = [
    {
      id: 'monarch',
      name: 'Shadow Sovereign',
      bonus: '+15 Intelligence, +15 Skills',
      desc: 'Controls dark energy from the shadow void. Specialized in mental focus, coding, and heavy research projects.',
      stats: { attack: 40, intelligence: 90, speed: 60, stamina: 50 },
      glowColor: 'border-brand-purple glow-purple/40 text-brand-purple bg-brand-purple/5'
    },
    {
      id: 'vanguard',
      name: 'Vanguard Defender',
      bonus: '+15 Endurance, +15 Stamina',
      desc: 'Heavy shielding hunter. Specialized in direct physical workouts, weight training, and endurance conditioning.',
      stats: { attack: 70, intelligence: 30, speed: 40, stamina: 90 },
      glowColor: 'border-brand-blue glow-blue/40 text-brand-blue bg-brand-blue/5'
    },
    {
      id: 'assassin',
      name: 'Swift Monarch',
      bonus: '+15 Attack, +15 Agility',
      desc: 'Agile coordinates striker. Optimized for active cardio runs, sprint intervals, and high-intensity trials.',
      stats: { attack: 90, intelligence: 40, speed: 90, stamina: 40 },
      glowColor: 'border-brand-red glow-red/40 text-brand-red bg-brand-red/5'
    },
    {
      id: 'spellweaver',
      name: 'Rune Spellweaver',
      bonus: '+15 Intelligence, +15 Focus',
      desc: 'Buff spellweaver. Specialized in study targets, language learning schedules, and consistent side tasks.',
      stats: { attack: 30, intelligence: 95, speed: 50, stamina: 60 },
      glowColor: 'border-cyan-400 glow-blue/40 text-cyan-400 bg-cyan-500/5'
    }
  ]

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId)
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)

    try {
      const res = await signUp(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setStage(4)
      }
    } catch (err: any) {
      setError(err.message || 'System awakening link failure.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#02050c] text-gray-200 font-mono relative flex flex-col justify-between overflow-hidden">
      
      {/* Background Holographic Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.25)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      
      {/* Giant Ambient Portal Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-8 py-8 flex justify-between items-center border-b border-slate-900">
        <span className="text-base font-black tracking-widest text-brand-blue glow-text-blue select-none">
          SYSTEM AWAKENING GATEWAY
        </span>
        
        <Link href="/login">
          <div className="px-6 py-2.5 border-2 border-slate-800 bg-[#02050c]/80 hover:border-brand-blue hover:text-white rounded text-xs font-bold tracking-widest transition-all cursor-pointer uppercase">
            [ Re-sync Hunter Identity ]
          </div>
        </Link>
      </header>

      {/* Interactive Main Body */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-6 py-16">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: Holographic Portal */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl w-full text-center space-y-10"
            >
              {/* Spinning Portals Visual */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-double border-brand-blue/30 glow-blue/20"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-4 rounded-full border-2 border-dashed border-brand-purple/40 glow-purple/10"
                />
                
                {/* Concentric ripples */}
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-8 rounded-full border border-cyan-500/20 bg-slate-950/80 flex items-center justify-center"
                />

                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 rounded-full bg-slate-950 border-2 border-brand-blue flex items-center justify-center glow-blue z-10"
                >
                  <Zap size={36} className="text-brand-blue animate-pulse" />
                </motion.div>
              </div>

              <div className="space-y-6">
                <div className="inline-block px-4 py-1.5 bg-brand-blue/10 border-2 border-brand-blue/30 rounded text-xs font-bold tracking-widest text-brand-blue uppercase animate-pulse">
                  [ System Onboarding Status: Waiting ]
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-sans tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500">
                  AWAKEN PROTOCOL
                </h1>
                <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto uppercase leading-relaxed tracking-wider">
                  You are chosen to interface with the System coordinates. Synchronize your custom routine variables to clear daily gates and survive.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStage(2)}
                  className="group px-10 py-5 bg-brand-blue text-black font-black text-xs uppercase tracking-widest rounded transition-all glow-blue hover:bg-[#00d0dd] flex items-center gap-2 mx-auto cursor-pointer border-none"
                >
                  Initiate System Sync <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: Archetype Selector (Interactive progress bars) */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-5xl w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-xs text-brand-purple font-extrabold tracking-widest uppercase">[ COORD ASSIGNMENT - ARCHETYPE DEPLOYMENT ]</span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wider">SELECT ARCHETYPE CONFIG</h2>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Select your starting class to calibrate initial base coordinates.</p>
              </div>

              {/* Class Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls) => {
                  const isCurrent = selectedClass === cls.id
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleClassSelect(cls.id)}
                      className={`relative rounded-xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[240px] ${
                        isCurrent 
                          ? `${cls.glowColor.split(' ')[0]} bg-[#02050c]/80 ${cls.glowColor.split(' ')[1]}`
                          : 'border-slate-900 hover:border-slate-800 bg-[#02050c]/50'
                      }`}
                    >
                      <div className="absolute top-3 right-3 text-[9px] text-gray-600 font-mono">
                        [ TYPE: {cls.id.toUpperCase()} ]
                      </div>
                      
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${isCurrent ? 'bg-current animate-pulse' : 'bg-slate-800'}`} />
                          <h3 className="text-base font-black uppercase tracking-wider text-white">{cls.name}</h3>
                        </div>
                        <p className="text-xs text-gray-400 uppercase leading-relaxed font-mono">
                          {cls.desc}
                        </p>
                      </div>

                      {/* Attribute sliders */}
                      <div className="space-y-2 pt-4 border-t border-slate-900/60 font-mono text-[9px]">
                        <div className="flex justify-between items-center text-gray-500">
                          <span>BASE BOOSER: <strong className="text-white">{cls.bonus}</strong></span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-gray-500">
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>ATTACK</span>
                              <span className="text-white">{cls.stats.attack}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: isCurrent ? `${cls.stats.attack}%` : '15%' }}
                                className="h-full bg-current rounded-full"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>STAMINA</span>
                              <span className="text-white">{cls.stats.stamina}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: isCurrent ? `${cls.stats.stamina}%` : '15%' }}
                                className="h-full bg-current rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-900">
                <button
                  onClick={() => setStage(1)}
                  className="px-6 py-3 border-2 border-slate-900 hover:border-slate-800 text-gray-500 hover:text-white text-xs uppercase tracking-widest rounded transition-all cursor-pointer font-bold"
                >
                  Back
                </button>

                <button
                  onClick={() => setStage(3)}
                  disabled={!selectedClass}
                  className="px-8 py-4 bg-brand-purple disabled:opacity-30 text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all glow-purple cursor-pointer flex items-center gap-1.5"
                >
                  Commit Selection Coordinates <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Hunter Contract (Neon Brackets & Large Fields) */}
          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-lg w-full bg-[#02050c]/98 border-2 border-brand-purple rounded-lg p-8 glow-purple text-center relative"
            >
              {/* Aesthetic Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-purple" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-purple" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-purple" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-purple" />

              <div className="text-left text-[9px] text-brand-purple/60 tracking-widest border-b border-brand-purple/20 pb-2.5 mb-6 uppercase font-bold">
                [ SIGN SYSTEM CONTRACT: HUNTER REGISTRY ]
              </div>

              <h2 className="text-2xl font-black tracking-widest text-white uppercase mb-1">
                SYSTEM REGISTRY
              </h2>
              <div className="h-0.5 w-1/3 mx-auto bg-gradient-to-r from-transparent via-brand-purple to-transparent mb-4" />
              
              <p className="text-xs text-gray-400 uppercase leading-relaxed tracking-wider mb-6">
                Fulfill the identification details to bind your registry signature.
              </p>

              {error && (
                <div className="p-3.5 bg-red-950/20 border-2 border-brand-red/50 rounded text-brand-red text-xs text-center font-bold mb-4 uppercase">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-5 text-left">
                {/* Name */}
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Hunter Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-505 pointer-events-none">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sung Jinwoo"
                      className="w-full px-4 py-3.5 pl-11 bg-slate-950 border-2 border-slate-900 rounded text-sm focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Registry Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-505 pointer-events-none">
                      <Mail size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3.5 pl-11 bg-slate-950 border-2 border-slate-900 rounded text-sm focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Access Key Credentials</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-505 pointer-events-none">
                      <Lock size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password code"
                      className="w-full px-4 py-3.5 pl-11 bg-slate-950 border-2 border-slate-900 rounded text-sm focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all glow-purple disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                    ) : (
                      <>
                        Sign System Contract <ShieldCheck size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Navigation Back link */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-900 text-[10px]">
                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="text-gray-500 hover:text-white uppercase tracking-wider cursor-pointer bg-transparent border-none font-bold"
                >
                  Change Archetype
                </button>
                <Link href="/login" className="text-brand-purple hover:underline uppercase tracking-wider font-bold">
                  Login gate
                </Link>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: System link email dispatcher */}
          {stage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#02050c]/98 border-2 border-brand-blue rounded-lg p-8 glow-blue text-center relative"
            >
              {/* Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-blue" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-blue" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-blue" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-blue" />

              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="mx-auto w-18 h-18 bg-slate-950 border border-brand-blue rounded-full flex items-center justify-center mb-6 glow-blue"
              >
                <Sparkles className="text-brand-blue animate-pulse" size={32} />
              </motion.div>

              <h2 className="text-xl font-black tracking-widest text-white uppercase mb-2">
                AWAKENING COMMENCED
              </h2>
              <div className="text-xs text-brand-blue font-bold uppercase tracking-widest mb-4">
                [ COORDINATES TRANSMITTED ]
              </div>

              <p className="text-sm text-gray-300 leading-relaxed uppercase tracking-wider mb-6 px-2">
                Verification link dispatched to your email credentials. Fulfill link check to instantiate Level 1 coordinates parameters.
              </p>

              <Link
                href="/login"
                className="block w-full py-4 bg-brand-blue/15 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/40 hover:border-brand-blue font-extrabold text-xs uppercase tracking-widest rounded transition-all text-center glow-blue cursor-pointer"
              >
                Go to Login Gate
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[9px] text-slate-800 border-t border-slate-950 uppercase tracking-widest font-bold select-none">
        SYSTEM SECURITY LOGS V2.06 • DEPLOYED REGISTRY PARAMS SECURE
      </footer>
    </div>
  )
}
