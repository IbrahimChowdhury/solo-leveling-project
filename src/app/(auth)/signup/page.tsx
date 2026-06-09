'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Mail, Lock, User } from 'lucide-react'
import { signUp } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGoogleSignup = async () => {
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
          <>
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-900" />
              </div>
              <span className="relative bg-[#0b0f19] px-3 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                OR
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-brand-purple/60 text-gray-400 hover:text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer glow-purple/5 hover:glow-purple/25"
            >
              <svg className="h-4 w-4 text-brand-purple" viewBox="0 0 24 24">
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

            <div className="text-center text-xs text-gray-400 font-mono">
              <span>Already registered? </span>
              <Link href="/login" className="text-brand-blue hover:underline glow-text-blue">
                Login Gate
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
