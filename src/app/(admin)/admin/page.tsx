import { adminGetAnalytics } from '@/app/actions/admin'
import { 
  Users, 
  Activity, 
  CheckSquare, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Award 
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const stats = await adminGetAnalytics()

  const cards = [
    {
      title: 'Total Hunters',
      value: stats.totalUsers,
      desc: 'Registered hunter profiles',
      icon: Users,
      color: 'text-brand-blue border-brand-blue/20',
    },
    {
      title: 'Active Hunters (7d)',
      value: stats.activeUsers,
      desc: 'Active system operations',
      icon: Activity,
      color: 'text-green-400 border-green-500/20',
    },
    {
      title: 'Cleared Quests',
      value: stats.questsCompleted,
      desc: 'System and Custom clearances',
      icon: CheckSquare,
      color: 'text-brand-purple border-brand-purple/20',
    },
    {
      title: 'Total XP Earned',
      value: `${(stats.totalXP / 1000).toFixed(1)}k`,
      desc: 'All-time coordinate progression',
      icon: Sparkles,
      color: 'text-pink-400 border-pink-500/20',
    },
    {
      title: 'Pro Subscribers',
      value: stats.proSubscribers,
      desc: 'Active awakened hunters',
      icon: Zap,
      color: 'text-brand-gold border-brand-gold/20',
    },
    {
      title: 'Estimated Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      desc: 'Active monthly/yearly payments',
      icon: TrendingUp,
      color: 'text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Average Hunter Level',
      value: `Lvl ${stats.avgLevel}`,
      desc: 'Average register status',
      icon: Award,
      color: 'text-cyan-400 border-cyan-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
          SYSTEM DIMENSIONS ANALYTICS
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          Live feed of core hunter registry parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div 
              key={index}
              className={`bg-[#0b0f19] border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">{card.title}</span>
                  <span className="text-2xl font-black text-white block mt-1">{card.value}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">{card.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
