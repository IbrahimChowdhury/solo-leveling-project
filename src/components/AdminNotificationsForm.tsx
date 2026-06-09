'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Bell, User, CheckCircle, Info } from 'lucide-react'
import { adminSendNotification } from '@/app/actions/admin'

interface AdminNotificationsFormProps {
  notifications: any[]
}

export default function AdminNotificationsForm({
  notifications,
}: AdminNotificationsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form States
  const [isGlobal, setIsGlobal] = useState(true)
  const [targetUserId, setTargetUserId] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!isGlobal && (!targetUserId || targetUserId.trim().length < 10)) {
      setError('A valid target User UUID is required for direct messages.')
      setLoading(false)
      return
    }

    if (!message || message.trim().length === 0) {
      setError('Message content cannot be empty.')
      setLoading(false)
      return
    }

    try {
      await adminSendNotification(message, isGlobal ? null : targetUserId)
      setSuccess(true)
      setMessage('')
      setTargetUserId('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch notification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form (1/3 width) */}
      <div className="space-y-6">
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 font-mono text-xs">
          <h3 className="text-sm font-bold tracking-widest text-brand-red uppercase mb-4 flex items-center gap-1.5">
            <Send size={16} /> Dispatch Broadcast
          </h3>

          {error && (
            <div className="p-3 bg-red-950/20 border border-brand-red/50 rounded-lg text-brand-red mb-4 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-950/20 border border-green-500/50 rounded-lg text-green-400 mb-4 text-center flex items-center justify-center gap-1">
              <CheckCircle size={14} /> Message dispatched!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Target Select */}
            <div className="space-y-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Broadcast Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsGlobal(true)}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isGlobal 
                      ? 'bg-brand-red border-brand-red text-white font-bold'
                      : 'bg-slate-950 border-slate-850 text-gray-500 hover:text-white'
                  }`}
                >
                  Global broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setIsGlobal(false)}
                  className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                    !isGlobal 
                      ? 'bg-brand-red border-brand-red text-white font-bold'
                      : 'bg-slate-950 border-slate-850 text-gray-500 hover:text-white'
                  }`}
                >
                  Specific hunter
                </button>
              </div>
            </div>

            {/* Target UUID (visible if DM) */}
            {!isGlobal && (
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Hunter User ID (UUID)</label>
                <input
                  type="text"
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red placeholder-gray-800"
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Message Content</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose announcement..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red placeholder-gray-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-red text-white font-extrabold uppercase tracking-wider rounded-lg transition-all glow-red disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? 'Dispatching...' : 'Dispatch Message'}
            </button>
          </form>
        </div>
      </div>

      {/* Log list (2/3 width) */}
      <div className="lg:col-span-2 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold tracking-widest text-brand-purple glow-text-purple uppercase">
          Broadcast History logs
        </h3>

        {notifications.length === 0 ? (
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center text-gray-500">
            No notification logs dispatched yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className="bg-[#0b0f19] border border-slate-850 p-4 rounded-xl space-y-2"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-950 border border-slate-900 text-brand-blue">
                      <Bell size={12} />
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      n.user_id === null 
                        ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' 
                        : 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'
                    }`}>
                      {n.user_id === null ? 'GLOBAL' : 'DIRECT MSG'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-200 leading-relaxed pl-1">{n.message}</p>
                {n.user_id && (
                  <p className="text-[9px] text-gray-500 pl-1 truncate">
                    Target User ID: {n.user_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
