'use client'

import { useState, useEffect, useRef } from 'react'
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
import { createClient } from '@/lib/supabase/client'

function AwakenHeading() {
  const targetText = "AWAKEN"
  const [displayText, setDisplayText] = useState("ΞΔΨΩ⏃1")
  const [isGlitching, setIsGlitching] = useState(false)
  const [triggerCount, setTriggerCount] = useState(0)
  
  const chars = "ΔΞΨΩ01X⏃$#@%+=-_?~*{}[]<>:;"

  useEffect(() => {
    let active = true
    let frame = 0
    const finalLength = targetText.length
    
    const interval = setInterval(() => {
      if (!active) return

      let current = ""
      let solved = true
      const solvedCount = Math.floor(frame / 3)

      for (let i = 0; i < finalLength; i++) {
        if (i < solvedCount) {
          current += targetText[i]
        } else {
          current += chars[Math.floor(Math.random() * chars.length)]
          solved = false
        }
      }

      setDisplayText(current)
      frame++

      if (solved) {
        clearInterval(interval)
      }
    }, 45)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [triggerCount])

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerGlitch()
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="relative cursor-pointer select-none group"
      onMouseEnter={() => {
        setTriggerCount(prev => prev + 1)
        setIsGlitching(true)
      }}
    >
      {/* Glitch Layer 1 - Cyan Shift */}
      <motion.span 
        animate={isGlitching ? { 
          x: [-5, 6, -3, 4, 0], 
          y: [2, -2, 1, 0],
          clipPath: [
            'inset(15% 0 65% 0)',
            'inset(75% 0 8% 0)',
            'inset(25% 0 50% 0)',
            'inset(4% 0 88% 0)',
            'inset(0% 0 0% 0)'
          ]
        } : { x: 0, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 text-brand-blue glow-text-cyan opacity-80 select-none pointer-events-none font-extrabold tracking-widest text-5xl sm:text-8xl lg:text-9xl font-sans"
      >
        {displayText}
      </motion.span>

      {/* Glitch Layer 2 - Magenta/Red Shift */}
      <motion.span 
        animate={isGlitching ? { 
          x: [5, -6, 3, -4, 0], 
          y: [-2, 2, -1, 0],
          clipPath: [
            'inset(50% 0 25% 0)',
            'inset(10% 0 75% 0)',
            'inset(70% 0 15% 0)',
            'inset(55% 0 30% 0)',
            'inset(0% 0 0% 0)'
          ]
        } : { x: 0, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 text-brand-red glow-text-red opacity-80 select-none pointer-events-none font-extrabold tracking-widest text-5xl sm:text-8xl lg:text-9xl font-sans"
      >
        {displayText}
      </motion.span>

      {/* Main Layer */}
      <motion.span 
        className="relative block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 group-hover:from-white group-hover:to-brand-blue transition-colors duration-300 font-extrabold tracking-widest text-5xl sm:text-8xl lg:text-9xl font-sans"
        animate={isGlitching ? {
          scaleY: [1, 1.06, 0.94, 1],
          skewX: [0, 2.5, -2.5, 0]
        } : {}}
        transition={{ duration: 0.15 }}
      >
        {displayText}
      </motion.span>
    </div>
  )
}

function ProtocolSubheading() {
  const targetText = "PROTOCOL"
  const [displayText, setDisplayText] = useState("ΔΞΨΩ01X⏃")
  const [triggerCount, setTriggerCount] = useState(0)
  const chars = "ΔΞΨΩ01X⏃$#@%+=-_?~*{}[]<>:;"

  useEffect(() => {
    let active = true
    let frame = 0
    const finalLength = targetText.length
    
    const interval = setInterval(() => {
      if (!active) return

      let current = ""
      let solved = true
      const solvedCount = Math.floor(frame / 2)

      for (let i = 0; i < finalLength; i++) {
        if (i < solvedCount) {
          current += targetText[i]
        } else {
          current += chars[Math.floor(Math.random() * chars.length)]
          solved = false
        }
      }

      setDisplayText(current)
      frame++

      if (solved) {
        clearInterval(interval)
      }
    }, 45)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [triggerCount])

  return (
    <span 
      className="cursor-pointer hover:text-brand-blue transition-colors duration-300"
      onMouseEnter={() => setTriggerCount(prev => prev + 1)}
    >
      {displayText}
    </span>
  )
}

function AwakeningCore() {
  const [coords, setCoords] = useState({ x: 127.0241, y: 37.5665 })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCoords(prev => ({
        x: Number((prev.x + (Math.random() - 0.5) * 0.001).toFixed(4)),
        y: Number((prev.y + (Math.random() - 0.5) * 0.001).toFixed(4))
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center select-none">
      {/* Scanning laser line */}
      <div className="absolute left-0 w-full h-0.5 bg-brand-blue/60 shadow-[0_0_8px_rgba(0,240,255,0.8)] z-20 animate-laser-sweep pointer-events-none" />

      {/* Grid Overlay inside core area */}
      <div className="absolute inset-2 rounded-full border border-slate-900/85 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none opacity-40" />

      {/* Rotating Outer SVG Orbit ring */}
      <div className="absolute inset-0 animate-rotate-cw pointer-events-none">
        <svg className="w-full h-full text-brand-blue/30" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Rotating Inner SVG Orbit ring */}
      <div className="absolute inset-2 animate-rotate-ccw pointer-events-none">
        <svg className="w-full h-full text-brand-purple/40" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 4 4 4" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Center rings and ripples */}
      <motion.div 
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-8 rounded-full border border-cyan-500/20 bg-slate-950/90 flex flex-col items-center justify-center shadow-[inset_0_0_15px_rgba(0,240,255,0.1)]"
      >
        {/* Core Center Orb */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 12px rgba(0, 240, 255, 0.3)', '0 0 20px rgba(0, 240, 255, 0.6)', '0 0 12px rgba(0, 240, 255, 0.3)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-14 h-14 rounded-full bg-slate-950 border-2 border-brand-blue flex flex-col items-center justify-center z-10"
        >
          <Zap size={20} className="text-brand-blue animate-pulse drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
          <span className="text-[7px] text-brand-blue tracking-widest uppercase font-mono font-bold mt-0.5">CORE</span>
        </motion.div>
      </motion.div>

      {/* Orbit Coordinates Ticker overlay (placed absolute below core) */}
      <div className="absolute bottom-1 bg-slate-950/80 px-2 py-0.5 border border-slate-900 rounded text-[7px] font-mono text-gray-500 tracking-wider">
        GATE_LOC: <span className="text-brand-blue">{coords.x}N</span> / <span className="text-brand-purple">{coords.y}E</span>
      </div>
    </div>
  )
}

function SystemLogTerminal() {
  const logPool = [
    "[INFO] Initializing System Registry Synchronizer...",
    "[INFO] Scanning user biometrics... D-rank latency detected.",
    "[WARN] Anomalous mana flow detected in local coordinates.",
    "[INFO] Calibrating class affinity parameters...",
    "[INFO] Querying dimensional gateway access keys...",
    "[INFO] Security clearance verified. Protocol status: ACTIVE.",
    "[WARN] Heart rate divergence detected. Retrying sync...",
    "[INFO] Binding bio-signature to Hunter Registry DB.",
    "[INFO] Syncing daily routine gates... Status: PENDING.",
    "[WARN] Warning: Level E hunter status detected. Awakening required.",
    "[INFO] Loading Monarch shadow database...",
    "[INFO] Loading Vanguard endurance grids...",
    "[INFO] System firewall update complete. Security level: MAX."
  ]

  const [logs, setLogs] = useState<string[]>([
    "[INFO] System Registry Synchronizer online.",
    "[INFO] Idle state reached. Awaiting coordinates..."
  ])
  
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLine = logPool[Math.floor(Math.random() * logPool.length)]
      const timestamp = new Date().toLocaleTimeString().split(' ')[0]
      setLogs(prev => [...prev.slice(-30), `[${timestamp}] ${randomLine}`])
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div 
      ref={terminalRef}
      className="w-full h-24 bg-[#02050c]/90 border border-slate-950 rounded p-3 font-mono text-[9px] text-green-400 overflow-y-auto shadow-inner relative select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/2 to-transparent pointer-events-none crt-flicker-overlay" />
      
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-1.5 leading-relaxed tracking-wide">
            <span className="text-brand-blue shrink-0">▶</span>
            <span className={log.includes("[WARN]") ? "text-brand-red font-bold" : "text-green-400"}>
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GlitchLockoutProps {
  countdown: number
  onClose: () => void
}

function GlitchLockout({ countdown, onClose }: GlitchLockoutProps) {
  return (
    <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-6 text-center select-none animate-digital-flicker border-2 border-brand-red">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-red/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-brand-red" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-brand-red" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-brand-red" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-brand-red" />

      <div className="space-y-6 max-w-md">
        <div className="inline-block px-4 py-1.5 bg-brand-red/10 border-2 border-brand-red text-brand-red text-xs font-black tracking-widest uppercase animate-pulse">
          🚨 SYSTEM SECURITY BREACH DETECTED 🚨
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase glow-text-red leading-tight">
          ABORT PROTOCOL DENIED
        </h2>

        <p className="text-xs sm:text-sm text-gray-400 font-mono uppercase leading-relaxed">
          Termination of the Awakening Sync is unauthorized. Escape parameters cannot be instantiated. Vitals are destabilizing.
        </p>

        <div className="text-5xl sm:text-6xl font-black text-brand-red tracking-wider font-mono animate-pulse">
          T-MINUS: {countdown}s
        </div>

        <p className="text-[10px] text-brand-red/70 font-mono uppercase">
          ⚠️ failure to registry signature will engage the daily dungeon survival trial immediately.
        </p>

        <button
          onClick={onClose}
          className="px-8 py-3.5 bg-brand-red text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all glow-red hover:bg-[#ff3333] cursor-pointer border-none"
        >
          [ Stabilize Vitals & Return ]
        </button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'OAuth initialization failed')
    }
  }

  // New States for sync sequence & lockout
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [showGlitchLockout, setShowGlitchLockout] = useState(false)
  const [lockoutCountdown, setLockoutCountdown] = useState(10)

  // Glitch Lockout Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showGlitchLockout) {
      if (lockoutCountdown > 0) {
        timer = setTimeout(() => {
          setLockoutCountdown(prev => prev - 1)
        }, 1000)
      } else {
        setShowGlitchLockout(false)
        setStage(3)
        setError("SYSTEM SECURITY EXCLUSION AVOIDED. EMERGENCY CONTRACT SIGNATURE BINDING DEPLOYED. Vitals stabilized at 12%. SIGN REGISTRY TO FULLY RESTORE CORE VALUES.")
        setLockoutCountdown(10)
      }
    }
    return () => clearTimeout(timer)
  }, [showGlitchLockout, lockoutCountdown])

  // Sync Progress loader logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (syncing) {
      if (syncProgress < 100) {
        timer = setTimeout(() => {
          setSyncProgress(prev => prev + 5)
        }, 80)
      } else {
        setSyncing(false)
        setStage(2)
      }
    }
    return () => clearTimeout(timer)
  }, [syncing, syncProgress])

  const handleStartSync = () => {
    setSyncing(true)
    setSyncProgress(0)
  }

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
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#02050c] text-gray-200 font-mono relative flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
      
      {/* Background Holographic Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.25)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      
      {/* Giant Ambient Portal Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-8 py-4 sm:py-5 flex justify-between items-center border-b border-slate-900">
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
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full items-stretch relative">
          
          {/* Left Panel: Gateway Singularity Core & Telemetry Log Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-slate-950/20 border border-slate-900/60 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue/40" />

            {/* Glowing ambient background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_96%,rgba(0,240,255,0.02)_96%)] bg-[size:100%_24px] pointer-events-none animate-scanline" />

            <div className="space-y-6 text-center lg:text-left">
              {/* Warnings and alerts */}
              <div className="inline-block relative overflow-hidden px-4 py-2 bg-slate-950 border border-brand-blue/30 rounded text-[10px] font-bold tracking-widest text-brand-blue uppercase">
                <div className="absolute inset-0 bg-brand-blue/5 animate-pulse" />
                <span className="flex items-center gap-2 relative z-10 animate-digital-flicker">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-ping" />
                  <span>⚠️ ALERT: DIMENSIONAL GATE OVERFLOW DETECTED ⚠️</span>
                </span>
              </div>

              {/* Holographic Header Title Block */}
              <div className="flex flex-col space-y-2 select-none items-center lg:items-start pt-2">
                <div className="relative leading-none h-[60px] sm:h-[90px] flex items-center">
                  <AwakenHeading />
                </div>
                <div className="text-xl sm:text-2xl font-black font-sans tracking-[0.25em] sm:tracking-[0.35em] uppercase text-slate-500 flex items-center gap-2 select-none leading-none pt-2 sm:pt-4 font-mono">
                  <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-ping" />
                  <ProtocolSubheading />
                  <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-ping" />
                </div>
              </div>

              {/* Mobile Google Login Button (First View) */}
              {stage === 1 && !syncing && (
                <div className="block lg:hidden w-full max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 rounded bg-slate-950 border border-slate-900 hover:border-brand-blue/60 text-gray-400 hover:text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer glow-blue/5 hover:glow-blue/20"
                  >
                    <svg className="h-4 w-4 text-brand-blue" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    [ AWAKEN WITH GOOGLE ]
                  </button>
                </div>
              )}
            </div>

            {/* Singularity Core Animation */}
            <div className="py-4">
              <AwakeningCore />
            </div>

            {/* Diagnostics logger terminal */}
            <div className="space-y-2 w-full">
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold font-mono">
                [ REAL-TIME DIAGNOSTIC TELEMETRY LOGGER ]
              </div>
              <SystemLogTerminal />
            </div>
          </div>

          {/* Right Panel: Interactive Step Controllers (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/40 border border-slate-900/60 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-2xl backdrop-blur-sm min-h-[480px] lg:min-h-0 lg:h-full">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-purple/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-purple/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-purple/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-purple/40" />

            {/* Glitch lockout screen override */}
            {showGlitchLockout && (
              <GlitchLockout 
                countdown={lockoutCountdown} 
                onClose={() => setShowGlitchLockout(false)} 
              />
            )}

            <AnimatePresence mode="wait">
              {/* STAGE 1: Sync Initiation Diagnostic */}
              {stage === 1 && (
                <motion.div
                  key="stage1"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 text-left font-mono my-auto py-6"
                >
                  <div className="border border-brand-blue/25 bg-brand-blue/5 p-4 rounded relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-blue" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-blue" />
                    <h3 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-2 glow-text-blue">[ TELEMETRY SCAN DATA ]</h3>
                    <div className="space-y-1 text-[10px] text-gray-400 uppercase">
                      <div>ACCESS KEY RATING: <span className="text-white">D-RANK</span></div>
                      <div>SURVIVAL PROBABILITY: <span className="text-brand-red animate-pulse font-bold">0.02% (CRITICAL)</span></div>
                      <div>RECOMMENDED ACTION: <span className="text-brand-blue font-bold">IMMEDIATE AWAKENING SYNCHRONIZATION</span></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed uppercase">
                    The dimensional rift is calibrating. Click below to synchronize your bio-coordinates with the System. Delaying alignment will register high latency and structural penalty degradation.
                  </p>

                  {syncing ? (
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-[10px] text-brand-blue uppercase font-bold tracking-widest animate-pulse">
                        <span>⚡ Aligning Soul Coords...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-75"
                          style={{ width: `${syncProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 flex flex-col gap-4">
                      <button
                        onClick={handleStartSync}
                        className="w-full group py-4 bg-brand-blue text-black font-black text-xs uppercase tracking-widest rounded transition-all glow-blue hover:bg-[#00d0dd] flex items-center justify-center gap-2 cursor-pointer border-none order-3 lg:order-1"
                      >
                        Initiate System Sync <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <div className="hidden lg:flex relative items-center justify-center py-1.5 order-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-900/60" />
                        </div>
                        <span className="relative bg-[#02050c] px-3 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                          OR
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full hidden lg:flex items-center justify-center gap-2.5 rounded bg-slate-950 border border-slate-900 hover:border-brand-blue/60 text-gray-400 hover:text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer glow-blue/5 hover:glow-blue/20 order-1 lg:order-3"
                      >
                        <svg className="h-4 w-4 text-brand-blue" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        [ AWAKEN WITH GOOGLE ]
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STAGE 2: Archetype Selector */}
              {stage === 2 && (
                <motion.div
                  key="stage2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6 text-left font-mono"
                >
                  <div>
                    <span className="text-[9px] text-brand-purple font-extrabold tracking-widest uppercase block">[ ARCHETYPE SELECTOR ]</span>
                    <h2 className="text-lg font-black uppercase text-white tracking-wider mt-1">SELECT ARCHETYPE CONFIG</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Select your starting class to calibrate initial base coordinates.</p>
                  </div>

                  {/* Class List (Stacked scroll view for split-screen spacing) */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {classes.map((cls) => {
                      const isCurrent = selectedClass === cls.id
                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleClassSelect(cls.id)}
                          className={`relative rounded-lg p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                            isCurrent 
                              ? `${cls.glowColor.split(' ')[0]} bg-[#02050c]/90 ${cls.glowColor.split(' ')[1]}`
                              : 'border-slate-900 hover:border-slate-800 bg-[#02050c]/40'
                          }`}
                        >
                          <div className="absolute top-2 right-2 text-[8px] text-gray-600 font-mono">
                            [ {cls.id.toUpperCase()} ]
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-current animate-pulse' : 'bg-slate-850'}`} />
                              <h3 className="text-xs font-black uppercase tracking-wider text-white">{cls.name}</h3>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-mono">
                              {cls.desc}
                            </p>
                          </div>

                          {/* Attribute sliders */}
                          {isCurrent && (
                            <div className="space-y-2 pt-3 border-t border-slate-900/60 mt-2 font-mono text-[8px] text-gray-500">
                              <div>BASE BOOSTER: <strong className="text-white">{cls.bonus}</strong></div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                  <div className="flex justify-between mb-0.5">
                                    <span>ATTACK</span>
                                    <span className="text-white">{cls.stats.attack}</span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${cls.stats.attack}%` }}
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
                                      animate={{ width: `${cls.stats.stamina}%` }}
                                      className="h-full bg-current rounded-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Navigation Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-900 mt-2 text-[10px]">
                    <button
                      onClick={() => setStage(1)}
                      className="px-4 py-2 border border-slate-900 hover:border-slate-800 text-gray-500 hover:text-white uppercase tracking-widest rounded transition-all cursor-pointer font-bold bg-transparent"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => {
                        setShowGlitchLockout(true)
                        setLockoutCountdown(10)
                      }}
                      className="px-4 py-2 border border-brand-red/30 hover:border-brand-red text-brand-red uppercase tracking-widest rounded transition-all cursor-pointer font-bold bg-brand-red/5"
                    >
                      [ Abort Sync ]
                    </button>

                    <button
                      onClick={() => setStage(3)}
                      disabled={!selectedClass}
                      className="px-5 py-2.5 bg-brand-purple disabled:opacity-30 text-white font-extrabold uppercase tracking-widest rounded transition-all glow-purple cursor-pointer flex items-center gap-1 border-none"
                    >
                      Next <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: Hunter Contract */}
              {stage === 3 && (
                <motion.div
                  key="stage3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 text-left font-mono"
                >
                  <div className="text-left text-[9px] text-brand-purple/60 tracking-widest border-b border-brand-purple/20 pb-2 mb-2 uppercase font-bold">
                    [ SIGN SYSTEM CONTRACT: HUNTER REGISTRY ]
                  </div>

                  <h2 className="text-lg font-black tracking-widest text-white uppercase mb-1">
                    SYSTEM REGISTRY
                  </h2>
                  
                  <p className="text-xs text-gray-400 uppercase leading-relaxed tracking-wider mb-2">
                    Fulfill the identification details to bind your registry signature.
                  </p>

                  {error && (
                    <div className="p-3 bg-brand-red/10 border border-brand-red/40 rounded text-brand-red text-[10px] text-center font-bold mb-4 uppercase leading-relaxed animate-pulse">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    {/* Name */}
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Hunter Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={12} className="text-gray-500" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sung Jinwoo"
                          className="w-full px-3 py-2.5 pl-9 bg-slate-950 border border-slate-900 rounded text-xs focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Registry Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={12} className="text-gray-500" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="w-full px-3 py-2.5 pl-9 bg-slate-950 border border-slate-900 rounded text-xs focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Access Key Credentials</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock size={12} className="text-gray-500" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password code"
                          className="w-full px-3 py-2.5 pl-9 bg-slate-950 border border-slate-900 rounded text-xs focus:outline-none focus:border-brand-purple text-white placeholder-gray-800"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all glow-purple disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border-none"
                      >
                        {loading ? (
                          <span className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                        ) : (
                          <>
                            Sign System Contract <ShieldCheck size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Navigation Back link */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-900 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStage(2)}
                      className="text-gray-500 hover:text-white uppercase tracking-wider cursor-pointer bg-transparent border-none font-bold"
                    >
                      Change Archetype
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowGlitchLockout(true)
                        setLockoutCountdown(10)
                      }}
                      className="text-brand-red hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none font-bold"
                    >
                      Terminate Sync
                    </button>
                    
                    <Link href="/login" className="text-brand-purple hover:underline uppercase tracking-wider font-bold">
                      Login gate
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: Success coordinate transmission */}
              {stage === 4 && (
                <motion.div
                  key="stage4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center font-mono space-y-6 py-6 my-auto"
                >
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="mx-auto w-16 h-16 bg-slate-950 border border-brand-blue rounded-full flex items-center justify-center glow-blue"
                  >
                    <Sparkles className="text-brand-blue animate-pulse" size={28} />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-black tracking-widest text-white uppercase">
                      AWAKENING COMMENCED
                    </h2>
                    <div className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">
                      [ COORDINATES TRANSMITTED ]
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed uppercase tracking-wider px-2">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[9px] text-slate-800 border-t border-slate-950 uppercase tracking-widest font-bold select-none">
        SYSTEM SECURITY LOGS V2.06 • DEPLOYED REGISTRY PARAMS SECURE
      </footer>
    </div>
  )
}
