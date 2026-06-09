'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Download, ShieldAlert, CheckCircle, Save } from 'lucide-react'
import { Profile } from '@/types'
import { exportUserData } from '@/app/actions/profile'

interface SettingsFormProps {
  profile: Profile
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [loadingExport, setLoadingExport] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Notifications state
  const [reminders, setReminders] = useState({
    morning: true,
    afternoon: true,
    evening: true,
  })

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportData = async () => {
    setLoadingExport(true)
    const data = await exportUserData()
    setLoadingExport(false)

    if ('error' in data) {
      alert(data.error)
      return
    }

    // Convert object to JSON and download
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `hunter_profile_${profile.id.substring(0, 6)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-wider text-white">
          SYSTEM PREFERENCES
        </h1>
        <p className="text-sm text-gray-400">
          Modify notification sync targets and trigger backups of your local profile data.
        </p>
      </div>

      {/* Notifications Sync */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold font-mono tracking-widest text-brand-blue glow-text-blue uppercase flex items-center gap-2">
          <Bell size={20} />
          Reminders & Synchronization
        </h2>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Enable active push notification targets to ensure daily quest targets are cleared before midnight UTC penalty threshold checks.
          </p>

          <div className="space-y-3 font-mono">
            {[
              { key: 'morning', label: 'Morning Sync Alert (10:00 UTC)' },
              { key: 'afternoon', label: 'Mid-Day Sync Alert (18:00 UTC)' },
              { key: 'evening', label: 'Final Clears Alert (21:00 UTC)' },
            ].map((reminder) => (
              <div 
                key={reminder.key}
                className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-all"
              >
                <span className="text-xs text-gray-300">{reminder.label}</span>
                <input
                  type="checkbox"
                  checked={reminders[reminder.key as keyof typeof reminders]}
                  onChange={(e) => setReminders(prev => ({ ...prev, [reminder.key]: e.target.checked }))}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-blue focus:ring-0 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-blue text-black font-extrabold font-mono text-xs uppercase tracking-wider rounded-lg transition-all glow-blue flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Update Sync Rules
            </button>
            {savedSuccess && (
              <span className="text-[10px] text-green-500 font-mono flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle size={12} /> Rules Saved Successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Data Export Box */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold font-mono tracking-widest text-brand-purple glow-text-purple uppercase flex items-center gap-2">
          <Download size={20} />
          Hunter Ledger Backup
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed font-mono">
          Download your complete system history (profile specifications, completed trial lists, active custom quests, penalty charts) as a portable JSON file.
        </p>

        <button
          onClick={handleExportData}
          disabled={loadingExport}
          className="px-6 py-2.5 bg-brand-purple hover:bg-[#906ef6] text-white font-extrabold font-mono text-xs uppercase tracking-wider rounded-lg transition-all glow-purple disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={14} /> 
          {loadingExport ? 'Syncing...' : 'Export JSON Log'}
        </button>
      </div>
    </div>
  )
}
