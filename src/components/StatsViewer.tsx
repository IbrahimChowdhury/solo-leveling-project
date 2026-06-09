'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Profile, StatHistory } from '@/types'
import { Zap, ShieldCheck } from 'lucide-react'

interface StatsViewerProps {
  profile: Profile
  history: StatHistory[]
}

export default function StatsViewer({ profile, history }: StatsViewerProps) {
  const router = useRouter()

  // 1. Prepare Radar Chart Data
  const radarData = [
    { name: 'Attack', value: profile.attack_power, fullMark: 1000 },
    { name: 'Intelligence', value: profile.intelligence, fullMark: 1000 },
    { name: 'Endurance', value: profile.endurance, fullMark: 1000 },
    { name: 'Stamina', value: profile.stamina, fullMark: 1000 },
    { name: 'Exercise', value: profile.exercise, fullMark: 1000 },
    { name: 'Skills', value: profile.skills, fullMark: 1000 }
  ]

  // 2. Prepare Line Chart Data (make sure there is at least one data point)
  const lineData = history.length > 0
    ? history.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Attack: item.attack_power,
        Intel: item.intelligence,
        Endure: item.endurance,
        Stamina: item.stamina,
        Exercise: item.exercise,
        Skills: item.skills,
      }))
    : [
        {
          date: 'Start',
          Attack: profile.attack_power,
          Intel: profile.intelligence,
          Endure: profile.endurance,
          Stamina: profile.stamina,
          Exercise: profile.exercise,
          Skills: profile.skills,
        }
      ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-wider text-white">
            HUNTER COORDINATES
          </h1>
          <p className="text-sm text-gray-400">
            Monitor your attribute dimensions and progression history.
          </p>
        </div>

        {/* Upgrade Banner for Free Users */}
        {!profile.is_pro && (
          <button
            onClick={() => router.push('/upgrade')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-brand-purple/10 border border-brand-gold/30 hover:border-brand-gold/50 text-brand-gold font-mono font-bold text-xs uppercase rounded-lg transition-all glow-gold cursor-pointer"
          >
            <Zap size={14} className="fill-brand-gold text-brand-gold" />
            <span>Unlock Unlimited History</span>
          </button>
        )}
      </div>

      {/* Grid: Radar Chart & Stats List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-widest text-brand-blue glow-text-blue uppercase mb-4">
              Attribute Dimensions (0 - 1000)
            </h2>
          </div>
          <div className="flex-1 w-full h-[320px] min-w-0">
            <ResponsiveContainer width="99%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontFamily="monospace" />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} stroke="#475569" fontSize={9} />
                <Radar
                  name="Hunter Stats"
                  dataKey="value"
                  stroke="#00f0ff"
                  fill="#00f0ff"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats breakdown (1/3 width) */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold font-mono tracking-widest text-brand-purple glow-text-purple uppercase">
            Hunter Core Values
          </h2>

          <div className="grid grid-cols-1 gap-4 font-mono">
            {radarData.map(stat => (
              <div key={stat.name} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-900 rounded-lg">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{stat.value}</span>
                  <span className="text-[10px] text-gray-600">/ 1000</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progression Line Chart */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-widest text-white uppercase">
              Chronological Growth Chart
            </h2>
            <p className="text-xs text-gray-500">
              {profile.is_pro 
                ? 'Showing full historical logs of stats progression.' 
                : 'Free tier limits coordinates to the last 30 entries.'}
            </p>
          </div>
          {!profile.is_pro && (
            <span className="text-[9px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded uppercase">
              30 Days Cap Active
            </span>
          )}
        </div>

        <div className="w-full h-[320px] min-w-0">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              data={lineData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" domain={[0, 1000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b0f19',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Attack" stroke="#00f0ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Intel" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Endure" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Stamina" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Exercise" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Skills" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
