'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react'
import { signIn } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#02050c] px-4 py-16 font-mono relative overflow-hidden">
      {/* Background Hologram scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.25)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Laser line moving */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-full h-0.5 bg-brand-blue/20 blur-xs"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 bg-[#02050c]/98 border-2 border-brand-blue rounded-lg p-8 shadow-2xl glow-blue relative"
      >
        {/* Tech Corner Brackets */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-brand-blue" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-brand-blue" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-brand-blue" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-brand-blue" />

        <div className="text-left text-[9px] text-brand-blue/50 tracking-widest border-b border-brand-blue/20 pb-2 uppercase select-none">
          [ ACCESS CONTROLLER - BIND SIGNATURE ]
        </div>

        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-blue bg-slate-950 text-brand-blue glow-blue"
          >
            <ShieldAlert size={28} />
          </motion.div>
          
          <h2 className="mt-4 text-2xl font-black tracking-widest text-brand-blue glow-text-blue uppercase">
            SYSTEM ACCESS
          </h2>
          <p className="mt-2 text-xs text-gray-400 uppercase tracking-wider">
            Authorize Hunter Signature Coordinates.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-950/20 border-2 border-brand-red/50 rounded text-brand-red text-xs text-center font-bold uppercase"
          >
            {error}
          </motion.div>
        )}

        <form className="mt-6 space-y-6 text-left" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Mail size={14} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded bg-slate-950 border-2 border-slate-900 py-3.5 pl-11 pr-3 text-white placeholder-gray-800 focus:outline-none focus:border-brand-blue text-sm"
                  placeholder="hunter_email@coordinates.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Secret Access Key</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock size={14} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded bg-slate-950 border-2 border-slate-900 py-3.5 pl-11 pr-3 text-white placeholder-gray-800 focus:outline-none focus:border-brand-blue text-sm"
                  placeholder="Enter credential keys"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded bg-brand-blue hover:bg-[#00d0dd] py-3.5 text-xs font-black text-black uppercase tracking-widest transition-all glow-blue disabled:opacity-50 cursor-pointer border-none"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border border-black border-t-transparent" />
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Sync <LogIn size={14} />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] text-gray-400 pt-4 border-t border-slate-900 flex justify-between items-center select-none uppercase tracking-wider">
          <span>Unregistered Hunter?</span>
          <Link href="/" className="text-brand-purple hover:underline font-bold">
            Create Profile
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
