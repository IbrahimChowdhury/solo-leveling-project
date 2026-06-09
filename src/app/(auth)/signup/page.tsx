'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Mail, Lock, User } from 'lucide-react'
import { signUp } from '@/app/actions/auth'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 bg-[#0b0f19] border border-brand-purple/30 rounded-xl p-8 shadow-2xl glow-purple"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-purple bg-slate-900 text-brand-purple glow-purple"
          >
            <Sparkles size={32} />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold font-mono tracking-widest text-brand-purple glow-text-purple">
            HUNTER REGISTRY
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Awaken your status information.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-950/20 border border-brand-red/50 rounded-lg text-brand-red text-xs text-center font-mono"
          >
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 border border-brand-purple/40 bg-purple-950/10 rounded-xl space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-brand-purple text-brand-purple glow-purple">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold font-mono text-white tracking-wide">
              REGISTRATION COMPLETED! 🎮
            </h3>
            <p className="text-sm text-gray-300">
              Now go to the Login Gate and Login.
            </p>
            <div className="pt-4">
              <Link 
                href="/login" 
                className="inline-block px-6 py-2 bg-brand-purple text-white font-mono font-bold rounded-lg text-xs tracking-wider glow-purple cursor-pointer"
              >
                Go to Login Gate
              </Link>
            </div>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Display Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple text-sm"
                    placeholder="Hunter display name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple text-sm"
                    placeholder="Hunter email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple text-sm"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-brand-purple hover:bg-[#906ef6] py-3 text-sm font-extrabold font-mono text-white uppercase tracking-wider transition-all glow-purple disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span className="flex items-center gap-2">
                    Begin Awakening <Sparkles size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {!success && (
          <div className="text-center text-xs text-gray-400 font-mono">
            <span>Already registered? </span>
            <Link href="/login" className="text-brand-blue hover:underline glow-text-blue">
              Login Gate
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
