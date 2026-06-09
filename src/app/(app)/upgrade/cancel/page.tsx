import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function UpgradeCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div className="max-w-md bg-[#0b0f19] border border-slate-800 p-8 rounded-xl space-y-6 relative overflow-hidden">
        <div className="mx-auto w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
          <AlertCircle className="text-gray-400" size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold font-mono text-white uppercase tracking-wider">
            ASCENSION ABORTED
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            The registration checkout session was closed or cancelled by the user. No status upgrades were initiated.
          </p>
        </div>

        <div className="pt-4 flex gap-4">
          <Link
            href="/upgrade"
            className="flex-1 py-2.5 bg-brand-purple text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer"
          >
            Retry Awakening
          </Link>
          <Link
            href="/"
            className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-900 text-gray-400 font-bold font-mono text-xs uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer"
          >
            Return Hub
          </Link>
        </div>
      </div>
    </div>
  )
}
