import Link from 'next/link'
import { Sparkles, CheckCircle } from 'lucide-react'

export default function UpgradeSuccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div className="max-w-md bg-[#0b0f19] border-2 border-brand-gold p-8 rounded-xl space-y-6 glow-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />

        <div className="mx-auto w-20 h-20 bg-slate-900 border border-brand-gold rounded-full flex items-center justify-center glow-gold">
          <Sparkles className="text-brand-gold animate-pulse" size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black font-mono text-white uppercase tracking-wider">
            STATUS ASCENSION COMPLETE
          </h1>
          <p className="text-sm text-brand-gold font-mono uppercase tracking-widest font-semibold glow-text-gold">
            [PRO HUNTER ACTIVATED]
          </p>
          <p className="text-xs text-gray-400 mt-2">
            The system coordinates have successfully processed your payment. You are now unlocked at maximum rank capabilities.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block w-full py-3 bg-brand-gold text-black font-black font-mono text-xs uppercase tracking-wider rounded-lg text-center glow-gold hover:bg-yellow-400 transition-all cursor-pointer"
          >
            Enter System Hub
          </Link>
        </div>
      </div>
    </div>
  )
}
