'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono text-gray-200 space-y-6">
      {/* Holographic bracket decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative p-8 border border-brand-blue/30 rounded-lg bg-[#02050c]/80 glow-blue max-w-sm w-full text-center"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue" />

        {/* Pulsing indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />
          <span className="text-[10px] font-black tracking-widest text-brand-blue uppercase">
            [ SYSTEM INTERACTION IN PROGRESS ]
          </span>
        </div>

        {/* Main holographic message */}
        <h3 className="text-sm font-black tracking-widest text-white uppercase animate-pulse">
          hunter data fetching...
        </h3>

        {/* Loader Spinner */}
        <div className="flex justify-center mt-6">
          <Loader2 className="animate-spin text-brand-blue shrink-0" size={32} />
        </div>

        {/* Dynamic status lines */}
        <div className="mt-6 space-y-1.5 text-[9px] text-gray-500 uppercase tracking-wider text-left border-t border-slate-900 pt-4">
          <div className="flex justify-between">
            <span>Querying Supabase DB...</span>
            <span className="text-brand-blue">[OK]</span>
          </div>
          <div className="flex justify-between">
            <span>Resolving Level & XP Sync...</span>
            <span className="text-brand-blue">[SYNC]</span>
          </div>
          <div className="flex justify-between">
            <span>Drawing Status Coordinates...</span>
            <span className="text-brand-purple">[DRAW]</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
