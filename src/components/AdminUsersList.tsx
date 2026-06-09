'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  User, 
  ShieldAlert, 
  Trash2, 
  RotateCcw, 
  Check, 
  X,
  Zap,
  Sliders
} from 'lucide-react'
import { 
  adminUpdateUser, 
  adminDeleteUser, 
  adminForceResetUser 
} from '@/app/actions/admin'

interface AdminUsersListProps {
  users: any[]
}

export default function AdminUsersList({ users }: AdminUsersListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  
  // Editor form states
  const [displayName, setDisplayName] = useState('')
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [isPro, setIsPro] = useState(false)
  const [attack, setAttack] = useState(10)
  const [intel, setIntel] = useState(10)
  const [endure, setEndure] = useState(10)
  const [stamina, setStamina] = useState(10)
  const [exercise, setExercise] = useState(10)
  const [skills, setSkills] = useState(10)

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase()
    return (
      u.display_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.rank.toLowerCase().includes(term)
    )
  })

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setDisplayName(user.display_name)
    setLevel(user.level)
    setXp(user.total_xp)
    setIsPro(user.is_pro)
    setAttack(user.attack_power)
    setIntel(user.intelligence)
    setEndure(user.endurance)
    setStamina(user.stamina)
    setExercise(user.exercise)
    setSkills(user.skills)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setLoading(true)

    try {
      await adminUpdateUser(selectedUser.id, {
        display_name: displayName,
        level,
        total_xp: xp,
        is_pro: isPro,
        attack_power: attack,
        intelligence: intel,
        endurance: endure,
        stamina,
        exercise,
        skills,
      })
      alert('User records updated successfully!')
      setSelectedUser(null)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to update user.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    if (!confirm(`CRITICAL WARNING: Are you absolutely sure you want to permanently DELETE the hunter "${selectedUser.display_name}"? All progress, quest histories, and Stripe connections will be wiped.`)) return
    setActionLoading('delete')

    try {
      await adminDeleteUser(selectedUser.id)
      alert('Hunter deleted from database register.')
      setSelectedUser(null)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleForceReset = async () => {
    if (!selectedUser) return
    if (!confirm(`Force quest reset coordinates for "${selectedUser.display_name}" today?`)) return
    setActionLoading('reset')

    try {
      await adminForceResetUser(selectedUser.id)
      alert('Daily reset coordinates forced. Today\'s quests marked incomplete.')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to force reset.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Users List (2/3 width on xl screens) */}
      <div className="xl:col-span-2 space-y-4">
        {/* Search */}
        <div className="relative font-mono">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hunters by name, email, or rank..."
            className="w-full px-3 py-2.5 pl-10 bg-[#0b0f19] border border-slate-800 rounded-xl text-white text-xs placeholder-gray-600 focus:outline-none focus:border-brand-red"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-gray-500 uppercase tracking-widest bg-slate-950/20">
                  <th className="py-3 px-4">Hunter</th>
                  <th className="py-3 px-2 text-center">Level</th>
                  <th className="py-3 px-2 text-center">Rank</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-600">
                      No hunters matching coordinate criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr 
                      key={u.id}
                      className={`border-b border-slate-900 last:border-0 hover:bg-slate-900/20 transition-all cursor-pointer ${
                        selectedUser?.id === u.id ? 'bg-brand-red/5' : ''
                      }`}
                      onClick={() => handleSelectUser(u)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.display_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-200 block truncate">{u.display_name}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-white">
                        Lvl {u.level}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-[10px] text-brand-purple font-semibold uppercase tracking-wider">
                          {u.rank}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {u.is_pro ? (
                          <span className="px-1.5 py-0.5 rounded bg-brand-gold/10 text-[9px] text-brand-gold border border-brand-gold/20 font-bold uppercase tracking-wider">Pro</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-gray-500 border border-slate-800 uppercase tracking-wider">Free</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-[10px] text-gray-400 hover:text-white uppercase tracking-wider"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectUser(u)
                          }}
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editor Drawer (1/3 width on xl screens) */}
      <div className="space-y-6">
        {selectedUser ? (
          <div className="bg-[#0b0f19] border border-brand-red/30 rounded-xl p-6 space-y-6 relative overflow-hidden glow-purple">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <h3 className="text-sm font-bold font-mono tracking-widest text-brand-red uppercase flex items-center gap-1.5">
                <Sliders size={16} /> Edit Hunter Status
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs text-left">
              
              {/* Display Name */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red"
                />
              </div>

              {/* Level & XP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Level</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">XP</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Pro Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1"><Zap className="text-brand-gold shrink-0" size={12} /> PRO status</span>
                <input
                  type="checkbox"
                  checked={isPro}
                  onChange={(e) => setIsPro(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-red focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Core Stats Coordinates */}
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <span className="block text-[10px] text-brand-purple uppercase tracking-widest font-bold mb-2">Attribute Blocks (0-1000)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Attack', val: attack, set: setAttack },
                    { label: 'Intelligence', val: intel, set: setIntel },
                    { label: 'Endurance', val: endure, set: setEndure },
                    { label: 'Stamina', val: stamina, set: setStamina },
                    { label: 'Exercise', val: exercise, set: setExercise },
                    { label: 'Skills', val: skills, set: setSkills },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <label className="block text-[9px] text-gray-500 mb-1 uppercase">{stat.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        required
                        value={stat.val}
                        onChange={(e) => stat.set(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3 border-t border-slate-900">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-brand-red text-white font-extrabold uppercase tracking-wider rounded-lg transition-all glow-red disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Commit Status Coordinates'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleForceReset}
                    disabled={actionLoading !== null}
                    className="py-2 border border-slate-800 hover:bg-slate-900 hover:text-white text-gray-400 uppercase text-[10px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={12} /> Force Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={actionLoading !== null}
                    className="py-2 border border-red-900/30 hover:bg-red-950/20 text-brand-red uppercase text-[10px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} /> Delete Hunter
                  </button>
                </div>
              </div>

            </form>
          </div>
        ) : (
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center text-gray-500 font-mono text-xs">
            Select a hunter profile row from the records table to adjust level parameters or remove status files.
          </div>
        )}
      </div>
    </div>
  )
}
