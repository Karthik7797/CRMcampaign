import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/client'
import { Users, TrendingUp, BarChart3, UserCheck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1']

const PIPELINE_STAGES = [
  'ENQUIRY', 'CONTACTED', 'DEMO', 'UNIVERSITY_SELECTION', 
  'OFFER_LETTER', 'VISA', 'ACCOMMODATION', 'PART_TIME_JOB', 
  'FULL_TIME', 'SHORTLISTED', 'APPLICATION_SENT', 
  'APPLICATION_RECEIVED', 'ENROLLED'
]

const ROLE_COLORS = {
  ADMIN: '#ef4444',
  MANAGER: '#f59e0b',
  MARKETING: '#8b5cf6',
  INFLUENCER: '#06b6d4',
  COUNSELLOR: '#10b981',
}

export default function UserProgression() {
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['user-progression'],
    queryFn: () => analyticsApi.getUserProgression().then(r => r.data),
  })

  // Prepare chart data for stage distribution
  const chartData = data?.users?.map((user: any) => ({
    name: user.name.split(' ')[0],
    ...user.stageDistribution,
  })) ?? []

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId)
    // Future: Navigate to user detail page or show modal
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">User Progression</h2>
        <p className="text-slate-400 text-sm">Track how users' leads progress through the pipeline</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users size={24} className="text-blue-400" />
            <p className="text-3xl font-bold text-white font-display">{data?.summary?.totalUsers ?? 0}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Total Users</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={24} className="text-green-400" />
            <p className="text-3xl font-bold text-white font-display">{data?.summary?.totalAssignedLeads ?? 0}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Total Assigned Leads</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserCheck size={24} className="text-purple-400" />
            <p className="text-3xl font-bold text-green-400 font-display">{data?.summary?.totalConverted ?? 0}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Total Converted</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 size={24} className="text-amber-400" />
            <p className="text-3xl font-bold text-purple-400 font-display">{data?.summary?.averageConversionRate ?? 0}%</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Avg Conversion Rate</p>
        </div>
      </div>

      {/* Pipeline Stage Distribution Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Pipeline Stage Distribution by User</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              {PIPELINE_STAGES.slice(0, 10).map((stage, index) => (
                <Bar 
                  key={stage} 
                  dataKey={stage} 
                  stackId="a"
                  fill={COLORS[index % COLORS.length]} 
                  name={stage.replace('_', ' ')}
                  radius={[0, 0, 4, 4]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-slate-500 text-sm">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
              No data yet - assign leads to users to see progression
            </div>
          </div>
        )}
      </div>

      {/* User Progression Table */}
      <div className="card overflow-hidden">
        <h3 className="text-sm font-semibold text-white mb-4">User Performance Overview</h3>
        {data?.users && data.users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Converted</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rate</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider" colSpan={5}>Pipeline Stages</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user: any) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors ${selectedUser === user.id ? 'bg-slate-700/50' : ''}`}
                    onClick={() => handleUserClick(user.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                        {user.totalLeads}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                        {user.convertedLeads}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        user.conversionRate >= 50 ? 'bg-purple-500/20 text-purple-400' :
                        user.conversionRate >= 25 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.conversionRate}%
                      </span>
                    </td>
                    {/* Pipeline Stage Distribution */}
                    {PIPELINE_STAGES.slice(0, 5).map((stage) => (
                      <td key={stage} className="text-center py-3 px-2">
                        {user.stageDistribution[stage] ? (
                          <span className="inline-block px-2 py-1 bg-slate-600/50 text-slate-300 rounded text-xs">
                            {user.stageDistribution[stage]}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">
            <div className="text-center">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              No users with assigned leads yet
            </div>
          </div>
        )}
      </div>

      {/* Selected User Detail */}
      {selectedUser && data?.users?.find((u: any) => u.id === selectedUser) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              {data.users.find((u: any) => u.id === selectedUser)?.name}'s Recent Leads
            </h3>
            <button 
              onClick={() => setSelectedUser(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-2">
            {data.users
              .find((u: any) => u.id === selectedUser)?.recentLeads
              .map((lead: any) => (
                <div 
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{lead.name}</p>
                    <p className="text-xs text-slate-400">{lead.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {lead.pipelineStage.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">→</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
