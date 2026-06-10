'use client'

import { useState } from 'react'
import { useRouter as useNextRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Check, 
  X,
  Clock,
  User,
  DollarSign,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react'
import { BkashConfig, BkashRequest } from '@/types'
import { adminUpdateBkashConfig, adminProcessBkashRequest } from '@/app/actions/admin'

interface AdminBkashPanelProps {
  initialConfig: BkashConfig
  initialRequests: BkashRequest[]
}

type TabType = 'pending' | 'approved' | 'rejected' | 'all'

export default function AdminBkashPanel({
  initialConfig,
  initialRequests
}: AdminBkashPanelProps) {
  const router = useNextRouter()

  // Configuration settings form state
  const [configNumber, setConfigNumber] = useState(initialConfig.number)
  const [price1m, setPrice1m] = useState(initialConfig.price_1_month)
  const [price3m, setPrice3m] = useState(initialConfig.price_3_months)
  const [price6m, setPrice6m] = useState(initialConfig.price_6_months)
  const [price1y, setPrice1y] = useState(initialConfig.price_1_year)
  const [configLoading, setConfigLoading] = useState(false)
  const [configSuccess, setConfigSuccess] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)

  // Requests queue states
  const [requests, setRequests] = useState<BkashRequest[]>(initialRequests)
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Processing dialog states
  const [selectedRequest, setSelectedRequest] = useState<BkashRequest | null>(null)
  const [processStatus, setProcessStatus] = useState<'approved' | 'rejected' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processLoading, setProcessLoading] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfigLoading(true)
    setConfigSuccess(null)
    setConfigError(null)

    try {
      const res = await adminUpdateBkashConfig(
        configNumber,
        Number(price1m),
        Number(price3m),
        Number(price6m),
        Number(price1y)
      )

      if (res.success) {
        setConfigSuccess('System gate configurations successfully updated.')
        router.refresh()
      }
    } catch (err: any) {
      setConfigError(err.message || 'Failed to update system config parameters.')
    } finally {
      setConfigLoading(false)
    }
  }

  const handleOpenProcessDialog = (req: BkashRequest, status: 'approved' | 'rejected') => {
    setSelectedRequest(req)
    setProcessStatus(status)
    setAdminNotes('')
    setProcessError(null)
  }

  const handleCloseProcessDialog = () => {
    setSelectedRequest(null)
    setProcessStatus(null)
    setAdminNotes('')
    setProcessError(null)
  }

  const handleConfirmProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !processStatus) return

    if (processStatus === 'rejected' && !adminNotes.trim()) {
      setProcessError('Rejection notes are required to inform the hunter.')
      return
    }

    setProcessLoading(true)
    setProcessError(null)

    try {
      const res = await adminProcessBkashRequest(
        selectedRequest.id,
        processStatus,
        adminNotes.trim() || null
      )

      if (res.success) {
        // Update local request list
        setRequests(prev => prev.map(r => 
          r.id === selectedRequest.id 
            ? { ...r, status: processStatus, admin_notes: adminNotes.trim() || null, updated_at: new Date().toISOString() } 
            : r
        ))
        handleCloseProcessDialog()
        router.refresh()
      }
    } catch (err: any) {
      setProcessError(err.message || 'An error occurred while processing status changes.')
    } finally {
      setProcessLoading(false)
    }
  }

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (activeTab !== 'all' && req.status !== activeTab) {
      return false
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const displayName = req.profiles?.display_name?.toLowerCase() || ''
      const email = req.email?.toLowerCase() || ''
      const txn = req.transaction_id.toLowerCase()
      const sender = req.sender_number.toLowerCase()
      return displayName.includes(term) || email.includes(term) || txn.includes(term) || sender.includes(term)
    }

    return true
  })

  const getPackageLabel = (type: string) => {
    switch (type) {
      case '1_month': return 'Hunter Recruit (1m)'
      case '3_months': return 'Elite Aspirant (3m)'
      case '6_months': return 'Shadow Monarch (6m)'
      case '1_year': return 'Eternal Sovereign (1y)'
      default: return type
    }
  }

  const getPackageColor = (type: string) => {
    switch (type) {
      case '1_month': return 'text-sky-400 bg-sky-500/10 border-sky-400/30'
      case '3_months': return 'text-brand-blue bg-brand-blue/10 border-brand-blue/30'
      case '6_months': return 'text-brand-purple bg-brand-purple/10 border-brand-purple/30'
      case '1_year': return 'text-brand-gold bg-brand-gold/15 border-brand-gold/30 glow-gold'
      default: return 'text-slate-300 bg-slate-900 border-slate-800'
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 font-mono text-slate-100 text-sm">
      
      {/* 1. Payment Configuration Card */}
      <div className="space-y-6">
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-600" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-600" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Settings size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              [ Gateway Parameters ]
            </h3>
          </div>

          <form onSubmit={handleUpdateConfig} className="space-y-4 text-xs text-left">
            {configSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-bold uppercase">
                ✓ {configSuccess}
              </div>
            )}

            {configError && (
              <div className="p-3 bg-brand-red/10 border border-brand-red/40 rounded text-brand-red text-xs font-bold uppercase">
                ⚠️ {configError}
              </div>
            )}

            {/* bKash Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Recipient bKash Phone
              </label>
              <input
                type="text"
                required
                value={configNumber}
                onChange={(e) => setConfigNumber(e.target.value)}
                placeholder="+8801700000000"
                disabled={configLoading}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Price 1 Month */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hunter Recruit Price (1m BDT)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price1m}
                onChange={(e) => setPrice1m(Number(e.target.value))}
                disabled={configLoading}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Price 3 Months */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Elite Aspirant Price (3m BDT)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price3m}
                onChange={(e) => setPrice3m(Number(e.target.value))}
                disabled={configLoading}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Price 6 Months */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Shadow Monarch Price (6m BDT)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price6m}
                onChange={(e) => setPrice6m(Number(e.target.value))}
                disabled={configLoading}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Price 1 Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Eternal Sovereign Price (1y BDT)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price1y}
                onChange={(e) => setPrice1y(Number(e.target.value))}
                disabled={configLoading}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              disabled={configLoading}
              className="w-full mt-3 py-3 bg-brand-blue hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-widest rounded transition-all glow-blue disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {configLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving Config...
                </>
              ) : (
                'Commit Gate Configurations'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Requests Auditor Console */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Tabs switcher */}
          <div className="flex border border-slate-800 bg-slate-950 p-1 rounded-lg text-xs font-bold">
            {(['pending', 'approved', 'rejected', 'all'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 uppercase font-extrabold tracking-wider rounded transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-900 text-brand-blue border border-slate-700 glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab} ({requests.filter(r => tab === 'all' || r.status === tab).length})
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, TxnID, number..."
              className="w-full px-3 py-2.5 pl-10 bg-[#0b0f19] border border-slate-750 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Requests Table Box */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-300 uppercase tracking-widest bg-slate-900/60">
                  <th className="py-4 px-4 font-bold">Hunter Profile</th>
                  <th className="py-4 px-3 font-bold">Upgrade Order</th>
                  <th className="py-4 px-3 font-bold">bKash Sender</th>
                  <th className="py-4 px-3 font-bold">Receipt TxnID</th>
                  <th className="py-4 px-4 text-right font-bold">Actions / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500 font-bold text-sm">
                      No matching manual payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      className="border-b border-slate-900 last:border-0 hover:bg-slate-900/30 transition-all font-mono"
                    >
                      {/* 1. Profile cell */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0 shadow">
                            {req.profiles?.avatar_url ? (
                              <img src={req.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (req.profiles?.display_name || 'H').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-white block truncate text-sm leading-tight">
                              {req.profiles?.display_name || 'System Hunter'}
                            </span>
                            <span className="text-xs text-slate-400 block truncate mt-0.5">
                              {req.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Package & BDT Amount */}
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border inline-block ${getPackageColor(req.package_type)}`}>
                            {getPackageLabel(req.package_type)}
                          </span>
                          <div className="text-xs text-slate-100 font-bold block pt-1">
                            {req.amount} BDT
                          </div>
                        </div>
                      </td>

                      {/* 3. Sender Mobile */}
                      <td className="py-4 px-3">
                        <span className="text-sm text-white font-extrabold block">
                          {req.sender_number}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">SENDER</span>
                      </td>

                      {/* 4. TxnID */}
                      <td className="py-4 px-3">
                        <span className="text-sm text-brand-blue font-extrabold tracking-wider block uppercase glow-text-blue select-all">
                          {req.transaction_id}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">TRANSACTION ID</span>
                      </td>

                      {/* 5. Gate Status & Actions */}
                      <td className="py-4 px-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => handleOpenProcessDialog(req, 'approved')}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 hover:border-green-400 rounded text-xs font-bold text-green-400 uppercase flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenProcessDialog(req, 'rejected')}
                              className="px-3 py-1.5 bg-brand-red/10 hover:bg-brand-red/20 border border-brand-red/50 hover:border-red-400 rounded text-xs font-bold text-brand-red uppercase flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 justify-end">
                              {req.status === 'approved' ? (
                                <span className="px-2.5 py-1 rounded bg-green-500/15 border border-green-500/40 text-xs text-green-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Validated
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded bg-brand-red/15 border border-brand-red/40 text-xs text-brand-red font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <XCircle size={12} /> Rejected
                                </span>
                              )}
                            </div>
                            {req.admin_notes && (
                              <span className="text-xs text-slate-400 block truncate max-w-[200px] leading-tight italic" title={req.admin_notes}>
                                Note: {req.admin_notes}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Action Dialog overlay */}
      <AnimatePresence>
        {selectedRequest && processStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseProcessDialog}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-lg overflow-hidden rounded-xl border bg-[#02050c] p-6 shadow-2xl z-10 ${
                processStatus === 'approved' ? 'border-green-500 glow-green' : 'border-brand-red glow-red'
              }`}
            >
              {/* Scanline decoration */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 50%)', backgroundSize: '100% 4px' }} />

              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  {processStatus === 'approved' ? (
                    <>
                      <ShieldCheck className="text-green-400 animate-pulse" size={18} /> [ Approve Pro Awakening ]
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-brand-red animate-pulse" size={18} /> [ Reject Upgrade Request ]
                    </>
                  )}
                </h4>
                <button 
                  onClick={handleCloseProcessDialog} 
                  disabled={processLoading}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {processError && (
                <div className="p-3 bg-brand-red/10 border border-brand-red/40 rounded text-brand-red text-xs font-bold uppercase mb-4">
                  ⚠️ {processError}
                </div>
              )}

              <form onSubmit={handleConfirmProcess} className="space-y-5">
                
                {/* Details info */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">HUNTER:</span> 
                    <span className="text-white font-extrabold">{selectedRequest.profiles?.display_name || 'System User'} ({selectedRequest.email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">PACKAGE TIER:</span> 
                    <span className="text-white font-extrabold">{getPackageLabel(selectedRequest.package_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">TRANSACTION ID:</span> 
                    <span className="text-brand-blue font-extrabold uppercase tracking-wide select-all">{selectedRequest.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">SENDER NUMBER:</span> 
                    <span className="text-white font-extrabold">{selectedRequest.sender_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">BDT AMOUNT:</span> 
                    <span className="text-white font-extrabold text-sm">{selectedRequest.amount} BDT</span>
                  </div>
                </div>

                {/* Notes input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {processStatus === 'approved' ? 'Verification Notes (Optional)' : 'Rejection Reason (Required)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={processStatus === 'approved' ? 'e.g. Transaction verified. Pro parameters loaded.' : 'e.g. Transaction ID was not found in admin bKash account statement.'}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required={processStatus === 'rejected'}
                    disabled={processLoading}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                </div>

                {/* Confirmation actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCloseProcessDialog}
                    disabled={processLoading}
                    className="px-4 py-2.5 border border-slate-700 hover:bg-slate-900 text-slate-300 font-extrabold text-xs uppercase rounded transition-all cursor-pointer disabled:opacity-50"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={processLoading}
                    className={`px-5 py-2.5 font-black text-xs uppercase tracking-widest rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all ${
                      processStatus === 'approved'
                        ? 'bg-green-500 text-black hover:bg-green-400 glow-green'
                        : 'bg-brand-red text-white hover:bg-red-650 glow-red'
                    }`}
                  >
                    {processLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Executing...
                      </>
                    ) : (
                      processStatus === 'approved' ? '[ Confirm Upgrade ]' : '[ Confirm Reject ]'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
