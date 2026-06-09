'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Zap, 
  ShieldAlert, 
  Award, 
  BarChart3, 
  Compass, 
  Flame, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      title: 'Holographic Daily Trials',
      desc: 'System targets weaker stats daily to construct custom workout/focus schedules.',
      icon: Compass,
      color: 'text-brand-blue border-brand-blue/30 bg-brand-blue/5 glow-blue/10'
    },
    {
      title: 'Hunter Rank Promotions',
      desc: 'Ascend your credentials from E-Rank coordinates all the way to National Level Ratings.',
      icon: Award,
      color: 'text-brand-purple border-brand-purple/30 bg-brand-purple/5 glow-purple/10'
    },
    {
      title: 'Status Coordinate Grid',
      desc: 'Visual radars mapping Attack, Intelligence, Endurance, Stamina, Exercise, and Skills values.',
      icon: BarChart3,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 glow-blue/10'
    },
    {
      title: 'Daily Clearance Streaks',
      desc: 'Clear 80%+ daily objectives to multiply XP rewards and claim bonus modifiers.',
      icon: Flame,
      color: 'text-brand-gold border-brand-gold/30 bg-brand-gold/5 glow-gold/10'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 font-mono relative flex flex-col justify-between overflow-x-hidden">
      {/* Portals / Grid Visual Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Portal Links */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-900">
        <span className="text-lg font-black tracking-widest text-brand-blue glow-text-blue select-none">
          SOLO LEVELING SYSTEM
        </span>
        
        <Link href="/login">
          <div className="px-4 py-2 border border-slate-800 hover:border-brand-blue hover:text-white rounded text-xs tracking-wider transition-all cursor-pointer">
            [ LOG IN GATE ]
          </div>
        </Link>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 lg:py-24 text-center space-y-12">
        {/* System Alert Hologram Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-xl mx-auto bg-[#02050c]/90 border-2 border-brand-blue rounded-lg p-6 glow-blue text-left"
        >
          {/* Corner frames */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue" />

          <div className="text-[10px] text-brand-blue/50 uppercase tracking-widest border-b border-brand-blue/20 pb-1.5 mb-3">
            [ System Command - Subject Awakening Trigger ]
          </div>
          <h2 className="text-base font-extrabold text-white tracking-widest uppercase">
            THE GATE OF AWAKENING HAS OPENED.
          </h2>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed uppercase">
            Will you accept the status coordinates upgrade? Sync your daily schedule variables, complete trials, level coordinates, and avoid midnight degradation penalties.
          </p>
        </motion.div>

        {/* Brand Titles */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 font-sans"
          >
            SOLO LEVELING
          </motion.h1>
          <p className="text-xs sm:text-sm text-brand-purple tracking-widest uppercase font-bold glow-text-purple">
            [ GAMIFY YOUR DAILY LIFE REQ COORDINATES ]
          </p>
        </div>

        {/* CTA triggers */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
        >
          <Link href="/signup">
            <div className="px-8 py-4 bg-brand-blue hover:bg-[#00d0dd] text-black font-black text-xs uppercase tracking-widest rounded transition-all glow-blue cursor-pointer flex items-center gap-2">
              Sync Hunter Signature <ArrowRight size={14} />
            </div>
          </Link>

          <Link href="/login">
            <div className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-brand-purple text-brand-purple hover:text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all cursor-pointer">
              Resume Registry Gate
            </div>
          </Link>
        </motion.div>

        {/* System Warnings Info Box */}
        <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`border rounded p-5 relative overflow-hidden flex gap-4 ${f.color}`}
              >
                {/* Visual frames */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-current/25" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-current/25" />
                
                <div className="shrink-0 p-2 rounded bg-slate-950 border border-slate-900 text-white flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-widest uppercase text-white">{f.title}</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed uppercase">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Footer Alerts */}
      <footer className="relative z-10 py-8 text-center text-[9px] text-slate-700 border-t border-slate-950">
        SYSTEM AWAKENING PROTOCOL V2.06 • RIGHTS REGISTERED FOR HUNTERS COORD CO.
      </footer>
    </div>
  )
}
