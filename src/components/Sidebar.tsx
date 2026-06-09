'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Compass, 
  BarChart2, 
  User, 
  Trophy, 
  Settings, 
  ShieldAlert, 
  Zap, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { Profile } from '@/types'
import { getXPForNextLevel } from '@/lib/game'

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
    router.push('/login')
  }

  const navItems = [
    { name: 'System Hub', href: '/', icon: Home },
    { name: 'Custom Quests', href: '/my-quests', icon: Compass },
    { name: 'Hunter Stats', href: '/stats', icon: BarChart2 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Add Admin item if admin
  if (profile?.is_admin) {
    navItems.push({ name: 'Admin Control', href: '/admin', icon: ShieldAlert })
  }

  // Calculate XP Percentage
  const xpNeeded = profile ? getXPForNextLevel(profile.level) : 1000
  const xpPercentage = profile ? Math.min(100, (profile.total_xp / xpNeeded) * 100) : 0

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0b0f19] border-r border-[#1f2937] text-gray-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1f2937]">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-xl font-bold font-mono tracking-widest text-brand-blue glow-text-blue">
              SOLO LEVELING
            </span>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="p-6 border-b border-[#1f2937]">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className={`w-12 h-12 rounded-full border-2 ${profile.is_pro ? 'border-brand-gold glow-gold' : 'border-brand-blue glow-blue'} object-cover`}
                />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white bg-slate-800 border-2 ${profile.is_pro ? 'border-brand-gold glow-gold' : 'border-brand-blue glow-blue'}`}>
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              {profile.is_pro && (
                <div className="absolute -bottom-1 -right-1 bg-brand-gold text-black rounded-full p-0.5 text-[8px] font-extrabold uppercase tracking-wide px-1">
                  PRO
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate text-white">{profile.display_name}</p>
              </div>
              <p className="text-xs text-brand-purple font-mono font-bold glow-text-purple">
                {profile.rank}
              </p>
              <p className="text-[10px] text-gray-400">Level {profile.level}</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono mb-1 text-gray-400">
              <span>XP PROGRESS</span>
              <span>{profile.total_xp} / {xpNeeded}</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-500 rounded-full"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-brand-blue border-l-2 border-brand-blue glow-blue'
                    : 'hover:bg-slate-900/50 text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-blue' : 'text-gray-400'} />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}

        {/* Upgrade Pro quick link if free */}
        {profile && !profile.is_pro && (
          <Link href="/upgrade" onClick={() => setIsOpen(false)}>
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-brand-purple/10 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-sm font-medium text-brand-gold cursor-pointer transition-all">
              <Zap size={18} className="text-brand-gold fill-brand-gold animate-pulse" />
              <span>Awaken PRO Version</span>
            </div>
          </Link>
        )}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-[#1f2937]">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-950/20 text-gray-400 hover:text-brand-red transition-all cursor-pointer"
        >
          <LogOut size={18} />
          <span>Leave System</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex lg:hidden items-center justify-between bg-[#0b0f19] border-b border-[#1f2937] p-4 text-white">
        <Link href="/">
          <span className="text-lg font-bold font-mono tracking-widest text-brand-blue glow-text-blue">
            SOLO LEVELING
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 rounded bg-slate-900 border border-slate-800 text-gray-200"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 h-full lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
