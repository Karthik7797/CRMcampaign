import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/client'
import { BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.overview().then(r => r.data),
  })

  const statusData = data?.byStatus?.map((s: any) => ({
    name: s.status,
    value: s._count,
  })) ?? []

  const sourceData = data?.bySource?.map((s: any) => ({
    name: s.source?.replace('LANDING_PAGE_', 'LP ').replace('_', ' '),
    value: s._count,
  })) ?? []

  const stageData = data?.byStage?.map((s: any) => ({
    name: s.pipelineStage?.replace('_', ' ').replace('_', ' '),
    count: s._count,
  })) ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Analytics</h2>
        <p className="text-slate-400 text-sm">Deep dive into enrollment metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-white font-display">{data?.totalLeads ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Total Leads</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-400 font-display">{data?.converted ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Converted</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-400 font-display">{data?.conversionRate ?? 0}%</p>
          <p className="text-xs text-slate-400 mt-1">Conversion Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Lead Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              <div className="text-center">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                No data yet
              </div>
            </div>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Leads by Source</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={9} width={90} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              <div className="text-center">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                No data yet
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Funnel */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Funnel</h3>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
              <div className="text-center">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                Pipeline funnel will appear when leads progress through stages
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
