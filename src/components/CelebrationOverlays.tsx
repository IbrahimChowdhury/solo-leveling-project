'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, ShieldCheck } from 'lucide-react'

interface CelebrationOverlaysProps {
  levelUpActive: boolean
  rankUpActive: boolean
  oldLevel: number
  newLevel: number
  oldRank: string
  newRank: string
  onClose: () => void
}

export default function CelebrationOverlays({
  levelUpActive,
  rankUpActive,
  oldLevel,
  newLevel,
  oldRank,
  newRank,
  onClose,
}: CelebrationOverlaysProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showRankUp, setShowRankUp] = useState(false)

  useEffect(() => {
    if (levelUpActive) {
      setShowLevelUp(true)
    }
  }, [levelUpActive])

  useEffect(() => {
    if (rankUpActive) {
      setShowRankUp(true)
    }
  }, [rankUpActive])

  const handleLevelUpClose = () => {
    setShowLevelUp(false)
    if (rankUpActive) {
      setShowRankUp(true)
    } else {
      onClose()
    }
  }

  const handleRankUpClose = () => {
    setShowRankUp(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {/* 1. Level Up Modal (System Holographic Prompt) */}
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          {/* Holographic scanning line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-full h-1 bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent blur-xs"
            />
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            className="relative w-full max-w-md bg-[#02050c]/95 border-2 border-brand-blue/80 rounded-lg p-8 text-center glow-blue font-mono"
          >
            {/* Tech Corner Brackets */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-brand-blue" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-brand-blue" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-brand-blue" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-brand-blue" />

            {/* Glowing System Title */}
            <div className="text-left text-[10px] text-brand-blue/60 tracking-widest border-b border-brand-blue/20 pb-2 mb-6">
              [ SYSTEM ALERT - STATUS INVENTORY UPDATE ]
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className="mx-auto w-16 h-16 bg-slate-950 border border-brand-blue/60 rounded-full flex items-center justify-center mb-6 glow-blue"
            >
              <Trophy size={32} className="text-brand-blue" />
            </motion.div>

            {/* System Header */}
            <h2 className="text-2xl font-black tracking-widest text-brand-blue glow-text-blue mb-1">
              LEVEL UP
            </h2>
            <div className="h-0.5 w-1/3 mx-auto bg-gradient-to-r from-transparent via-brand-blue to-transparent mb-4" />

            {/* Typewriter message */}
            <p className="text-gray-300 text-xs leading-relaxed uppercase tracking-wider mb-6 px-4">
              "The hunter coordinates have exceeded previous limits. All biological stats are updated."
            </p>

            {/* Level Stat comparison */}
            <div className="bg-slate-950/80 border border-brand-blue/20 rounded-md p-4 mb-6 relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,34,64,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="block text-gray-500 text-[10px] uppercase">FORMER</span>
                  <span className="text-xl font-bold text-gray-400">Lvl {oldLevel}</span>
                </div>
                <div className="text-brand-blue font-bold text-lg animate-pulse">→</div>
                <div className="text-center">
                  <span className="block text-brand-blue text-[10px] uppercase tracking-wider glow-text-blue font-bold">ASCENDED</span>
                  <span className="text-2xl font-black text-white glow-text-blue">
                    Lvl {newLevel}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLevelUpClose}
              className="w-full py-3 bg-brand-blue/15 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/50 hover:border-brand-blue font-extrabold rounded-lg tracking-widest text-xs transition-all uppercase glow-blue cursor-pointer"
            >
              Update Credentials
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* 2. Rank Up Modal (Wings, Golden Particles, Purple/Gold Tech Portal) */}
      {showRankUp && !showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4"
        >
          {/* Floating gold coordinates */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '105%',
                  opacity: Math.random() * 0.7 + 0.3,
                  scale: Math.random() * 0.5 + 0.4,
                }}
                animate={{
                  y: '-5%',
                  opacity: 0,
                }}
                transition={{
                  duration: Math.random() * 3.5 + 2.5,
                  repeat: Infinity,
                  delay: Math.random() * 1.5,
                }}
                className="absolute w-1.5 h-1.5 rounded-full bg-brand-gold glow-gold"
              />
            ))}
          </div>

          {/* Dark Shadow Wings Silhouette Behind */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
            animate={{ opacity: 0.22, scale: 1.1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute z-0 pointer-events-none"
          >
            {/* Wing elements */}
            <svg
              width="700"
              height="450"
              viewBox="0 0 600 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-brand-purple fill-current filter blur-xs"
            >
              <path d="M300 200C210 90 90 60 30 140C10 170 0 210 30 240C70 280 180 295 300 200Z" opacity="0.75" />
              <path d="M300 200C390 90 510 60 570 140C590 170 600 210 570 240C530 280 420 295 300 200Z" opacity="0.75" />
              <path d="M300 200C250 120 120 100 80 170C60 190 60 220 80 240C110 260 200 270 300 200Z" opacity="0.5" />
              <path d="M300 200C350 120 480 100 520 170C540 190 540 220 520 240C490 260 400 270 300 200Z" opacity="0.5" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            className="relative z-10 w-full max-w-lg bg-[#02050c]/95 border-2 border-brand-gold/80 rounded-lg p-10 text-center glow-gold font-mono"
          >
            {/* Gold Brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-gold" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-gold" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-gold" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-gold" />

            <div className="text-left text-[10px] text-brand-gold/60 tracking-widest border-b border-brand-gold/20 pb-2 mb-6">
              [ SYSTEM COMMAND - COGNITIVE AWAKENING DETECTED ]
            </div>

            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 8 }}
              className="mx-auto w-20 h-20 bg-slate-950 border-2 border-brand-gold/60 rounded-full flex items-center justify-center mb-6 glow-gold"
            >
              <Sparkles size={40} className="text-brand-gold" />
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-black tracking-widest text-brand-gold glow-text-gold mb-1">
              AWAKENING REGISTER
            </h2>
            <div className="h-0.5 w-1/3 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent mb-4" />

            <p className="text-gray-300 text-xs leading-relaxed uppercase tracking-wider mb-6 px-6">
              "The magic energy index of the subject has broken normal ratings. The system promotes your hunter rank credentials."
            </p>

            {/* Rank Compare */}
            <div className="bg-slate-950/80 border border-brand-gold/20 rounded-md p-5 mb-8 relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(78,63,33,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <span className="block text-gray-500 text-[10px] uppercase">PREVIOUS LIMIT</span>
                  <span className="text-xl font-bold text-brand-purple/70 font-mono">{oldRank}</span>
                </div>
                <div className="text-brand-gold font-bold text-xl animate-pulse">→</div>
                <div className="text-center">
                  <span className="block text-brand-gold text-[10px] uppercase tracking-wider glow-text-gold font-bold">PROMOTED RANK</span>
                  <span className="text-3xl font-black text-white glow-text-gold animate-bounce">
                    {newRank}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRankUpClose}
              className="w-full py-3.5 bg-brand-gold/15 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/50 hover:border-brand-gold font-black rounded-lg tracking-widest text-xs transition-all uppercase glow-gold cursor-pointer"
            >
              Confirm Awakening Registry
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
