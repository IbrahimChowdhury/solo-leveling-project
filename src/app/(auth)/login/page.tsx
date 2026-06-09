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
      router.push('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 bg-[#0b0f19] border border-brand-blue/30 rounded-xl p-8 shadow-2xl glow-blue"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-blue bg-slate-900 text-brand-blue glow-blue"
          >
            <ShieldAlert size={32} />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold font-mono tracking-widest text-brand-blue glow-text-blue">
            SYSTEM ACCESS
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Acknowledge the program, Hunter.
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  className="block w-full rounded-lg bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue text-sm"
                  placeholder="Enter hunter email"
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
                  className="block w-full rounded-lg bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue text-sm"
                  placeholder="Enter credentials"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-brand-blue hover:bg-[#00d0dd] py-3 text-sm font-extrabold font-mono text-black uppercase tracking-wider transition-all glow-blue disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Sync <LogIn size={16} />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-400 font-mono">
          <span>Unregistered Hunter? </span>
          <Link href="/signup" className="text-brand-purple hover:underline glow-text-purple">
            Create Profile
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
