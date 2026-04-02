import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/client'
import { Users, TrendingUp, UserCheck, AlertCircle, ArrowUp, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatRelativeTime } from '../lib/utils'

const statCards = (data: any) => [
  { label: 'Total Leads', value: data?.totalLeads ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
  { label: 'New Leads', value: data?.newLeads ?? 0, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '+8%' },
  { label: 'Converted', value: data?.converted ?? 0, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10', trend: '+23%' },
  { label: 'Conversion Rate', value: `${data?.conversionRate ?? 0}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+2.4%' },
]

const mockChartData = [
  { month: 'Jan', leads: 45, converted: 12 },
  { month: 'Feb', leads: 62, converted: 18 },
  { month: 'Mar', leads: 78, converted: 24 },
  { month: 'Apr', leads: 55, converted: 16 },
  { month: 'May', leads: 91, converted: 31 },
  { month: 'Jun', leads: 104, converted: 38 },
]

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.overview().then(r => r.data),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-display">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-0.5">Track your enrollment performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map((stat) => (
          <div key={stat.label} className="card hover:border-surface-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUp size={12} /> {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-display">
              {isLoading ? '—' : stat.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Trend */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Lead Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#colorLeads)" strokeWidth={2} name="Leads" />
              <Area type="monotone" dataKey="converted" stroke="#10b981" fill="url(#colorConverted)" strokeWidth={2} name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">By Source</h3>
          {data?.bySource?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bySource.slice(0, 6)} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis type="category" dataKey="source" stroke="#475569" fontSize={9} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="_count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Leads</h3>
          <a href="/leads" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
        </div>
        <div className="space-y-2">
          {data?.recentLeads?.slice(0, 6).map((lead: any) => (
            <div key={lead.id} className="flex items-center justify-between py-2.5 border-b border-surface-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {lead.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full border badge-${lead.status.toLowerCase()}`}>
                  {lead.status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} /> {formatRelativeTime(lead.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {!data?.recentLeads?.length && (
            <p className="text-sm text-slate-500 text-center py-8">No leads yet. Forms on landing pages will populate here.</p>
          )}
        </div>
      </div>
    </div>
  )
}
