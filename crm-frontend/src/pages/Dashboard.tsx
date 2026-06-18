import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/client'
import {
  Users, TrendingUp, UserCheck, AlertCircle, ArrowUp, ArrowDown,
  Clock, CalendarClock, Sparkles, ArrowRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import {
  formatRelativeTime, formatDate, formatNumber, avatarGradient, initials,
  leadDetailsPath, type LeadType,
} from '../lib/utils'
import { useChartTheme } from '../hooks/useChartTheme'
import { useCountUp } from '../hooks/useCountUp'

type FollowUpRow = {
  id: string
  name: string
  leadType: LeadType
  followUpDate: string
  status: string
  assignedTo?: { name: string } | null
}

// ── Avatar ───────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${avatarGradient(name)}
                  flex items-center justify-center font-bold text-white
                  ring-2 ring-surface-800 flex-shrink-0 shadow-sm`}
    >
      {initials(name)}
    </div>
  )
}

// ── Sparkline (decorative trend hint inside a stat card) ─────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 100
  const h = 28
  const step = w / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-7" aria-hidden="true">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.85}
      />
    </svg>
  )
}

// ── Stat card ────────────────────────────────────────────────────────
type Stat = {
  label: string
  value: number
  display?: string        // for non-numeric values like "23%"
  icon: typeof Users
  glow: string            // RGB triplet for the radial glow
  iconWrap: string
  iconColor: string
  trend: number           // percentage delta (signed)
  spark: number[]
}

function StatCard({ stat, index, loading }: { stat: Stat; index: number; loading: boolean }) {
  const counted = useCountUp(stat.value)
  const up = stat.trend >= 0

  return (
    <div
      className="card-glass card-glass-hover stat-glow rise-in group"
      style={{ ['--glow' as string]: stat.glow, animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${stat.iconWrap} flex items-center justify-center`}>
          <stat.icon size={18} className={stat.iconColor} />
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md
                      ${up ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}
        >
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(stat.trend)}%
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-8 w-24 mb-1" />
      ) : (
        <p className="text-3xl font-bold text-slate-100 font-display tabular-nums leading-none tracking-tight">
          {stat.display ?? formatNumber(Math.round(counted))}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-2 font-medium">{stat.label}</p>

      <div className="mt-3 -mb-1">
        <Sparkline data={stat.spark} color={`rgb(${stat.glow})`} />
      </div>
    </div>
  )
}

// ── Follow-up card ───────────────────────────────────────────────────
function FollowUpCard({
  title, icon, accent, items, emptyText, loading,
}: {
  title: string
  icon: React.ReactNode
  accent: string
  items: FollowUpRow[]
  emptyText: string
  loading: boolean
}) {
  return (
    <div className="card-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 font-display">
          <span className={accent}>{icon}</span> {title}
        </h3>
        <span className="text-xs font-semibold text-slate-400 tabular-nums bg-surface-700/60 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-2.5 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-surface-700/50 flex items-center justify-center mb-2">
            <Sparkles size={16} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[260px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
          {items.map((row) => (
            <Link
              key={`${row.leadType}-${row.id}`}
              to={leadDetailsPath(row.leadType, row.id)}
              className="flex items-center justify-between py-2.5 px-2.5 -mx-1 rounded-xl
                         hover:bg-surface-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={row.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-100">{row.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(row.followUpDate)}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border badge-${row.status.toLowerCase()} flex-shrink-0`}>
                {row.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const mockChartData = [
  { month: 'Jan', leads: 45, converted: 12 },
  { month: 'Feb', leads: 62, converted: 18 },
  { month: 'Mar', leads: 78, converted: 24 },
  { month: 'Apr', leads: 55, converted: 16 },
  { month: 'May', leads: 91, converted: 31 },
  { month: 'Jun', leads: 104, converted: 38 },
]

// Distinct bar colors so each source reads on its own (vs one flat blue).
const SOURCE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

function buildStats(data: any): Stat[] {
  return [
    {
      label: 'Total Leads', value: data?.totalLeads ?? 0, icon: Users,
      glow: '59 130 246', iconWrap: 'bg-blue-500/10', iconColor: 'text-blue-500',
      trend: 12, spark: [40, 52, 48, 61, 58, 72, 84],
    },
    {
      label: 'New Leads', value: data?.newLeads ?? 0, icon: AlertCircle,
      glow: '245 158 11', iconWrap: 'bg-amber-500/10', iconColor: 'text-amber-500',
      trend: 8, spark: [20, 28, 24, 30, 26, 34, 38],
    },
    {
      label: 'Converted', value: data?.converted ?? 0, icon: UserCheck,
      glow: '16 185 129', iconWrap: 'bg-emerald-500/10', iconColor: 'text-emerald-500',
      trend: 23, spark: [8, 12, 14, 11, 18, 24, 31],
    },
    {
      label: 'Conversion Rate', value: data?.conversionRate ?? 0,
      display: `${data?.conversionRate ?? 0}%`, icon: TrendingUp,
      glow: '139 92 246', iconWrap: 'bg-violet-500/10', iconColor: 'text-violet-500',
      trend: 2.4, spark: [18, 20, 19, 22, 21, 24, 26],
    },
  ]
}

export default function Dashboard() {
  const chart = useChartTheme()
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.overview().then(r => r.data),
    refetchInterval: 30000,
  })

  const stats = buildStats(data)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-display tracking-tight">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Track your enrollment performance in real time</p>
        </div>
        <Link to="/leads" className="btn-primary group">
          View all leads
          <ArrowRight size={15} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} loading={isLoading} />
        ))}
      </div>

      {/* Follow-ups: Overdue & Due Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FollowUpCard
          title="Overdue Follow-ups"
          icon={<AlertCircle size={16} />}
          accent="text-rose-500"
          items={data?.followUpsOverdue ?? []}
          emptyText="Nothing overdue — you're all caught up."
          loading={isLoading}
        />
        <FollowUpCard
          title="Due Today"
          icon={<CalendarClock size={16} />}
          accent="text-amber-500"
          items={data?.followUpsDueToday ?? []}
          emptyText="No follow-ups due today."
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Trend */}
        <div className="card-glass lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-100 font-display">Lead Trend</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Leads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Converted
              </span>
              <span className="hidden sm:inline text-slate-500">· 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="month" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} dy={6} />
              <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={chart.tooltip} cursor={{ stroke: chart.grid, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#colorLeads)" strokeWidth={2.5} name="Leads" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="converted" stroke="#10b981" fill="url(#colorConverted)" strokeWidth={2.5} name="Converted" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="card-glass">
          <h3 className="text-sm font-semibold text-slate-100 mb-5 font-display">By Source</h3>
          {isLoading ? (
            <div className="space-y-3 h-[240px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-4 flex-1" style={{ width: `${80 - i * 12}%` }} />
                </div>
              ))}
            </div>
          ) : data?.bySource?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.bySource.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 8 }}>
                <XAxis type="number" stroke={chart.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="source" stroke={chart.axis} fontSize={10} width={84} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chart.tooltip} cursor={{ fill: chart.grid, opacity: 0.3 }} />
                <Bar dataKey="_count" radius={[0, 6, 6, 0]} name="Leads" maxBarSize={22}>
                  {data.bySource.slice(0, 6).map((_: any, i: number) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-center">
              <div className="w-10 h-10 rounded-full bg-surface-700/50 flex items-center justify-center mb-2">
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm">No source data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100 font-display">Recent Leads</h3>
          <Link to="/leads" className="text-xs font-medium text-brand-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton h-2.5 w-40" />
                  </div>
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : data?.recentLeads?.length ? (
          <div className="space-y-1">
            {data.recentLeads.slice(0, 6).map((lead: any) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-2.5 px-2.5 -mx-1 rounded-xl hover:bg-surface-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={lead.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-100">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border badge-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                  <span className="text-xs text-slate-500 items-center gap-1 hidden sm:flex">
                    <Clock size={11} /> {formatRelativeTime(lead.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-700/50 flex items-center justify-center mb-3">
              <Users size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">No leads yet</p>
            <p className="text-xs text-slate-500 mt-1">Forms on landing pages will populate here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
