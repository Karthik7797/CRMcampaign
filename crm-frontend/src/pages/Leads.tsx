import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'
import { Search, Plus, Phone, Mail, MoreVertical, ChevronLeft, ChevronRight, Globe, Megaphone, X, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import { usePermissions } from '../hooks/usePermissions'
import toast from 'react-hot-toast'
import { Users } from 'lucide-react'

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'JUNK']
const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'All Sources' },
  { value: 'SELF_LOCAL', label: '👤 Self Local Leads' },
  { value: 'LANDING_PAGE_MBA', label: '📊 MBA Campaign' },
  { value: 'LANDING_PAGE_ENGINEERING', label: '⚡ Engineering Campaign' },
  { value: 'LANDING_PAGE_EDUCATION', label: '🎓 Education Campaign' },
  { value: 'LANDING_PAGE_SCHOLARSHIP', label: '🏆 Scholarship Campaign' },
  { value: 'LANDING_PAGE_ONLINE', label: '🌐 Online Campaign' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'REFERRAL', label: 'Referral' },
]

// Color-coded campaign badges
const SOURCE_BADGES: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  LANDING_PAGE_MBA: { bg: 'bg-blue-500/15 border-blue-500/25', text: 'text-blue-400', label: 'MBA', icon: '📊' },
  LANDING_PAGE_ENGINEERING: { bg: 'bg-cyan-500/15 border-cyan-500/25', text: 'text-cyan-400', label: 'Engineering', icon: '⚡' },
  LANDING_PAGE_EDUCATION: { bg: 'bg-amber-500/15 border-amber-500/25', text: 'text-amber-400', label: 'Education', icon: '🎓' },
  LANDING_PAGE_SCHOLARSHIP: { bg: 'bg-purple-500/15 border-purple-500/25', text: 'text-purple-400', label: 'Scholarship', icon: '🏆' },
  LANDING_PAGE_ONLINE: { bg: 'bg-emerald-500/15 border-emerald-500/25', text: 'text-emerald-400', label: 'Online', icon: '🌐' },
  WEBSITE: { bg: 'bg-slate-500/15 border-slate-500/25', text: 'text-slate-400', label: 'Website', icon: '🌍' },
  FACEBOOK: { bg: 'bg-blue-600/15 border-blue-600/25', text: 'text-blue-500', label: 'Facebook', icon: '📘' },
  GOOGLE: { bg: 'bg-red-500/15 border-red-500/25', text: 'text-red-400', label: 'Google', icon: '🔍' },
  REFERRAL: { bg: 'bg-green-500/15 border-green-500/25', text: 'text-green-400', label: 'Referral', icon: '🤝' },
  SELF_LOCAL: { bg: 'bg-indigo-500/15 border-indigo-500/25', text: 'text-indigo-400', label: 'Self Local', icon: '👤' },
}

function SourceBadge({ source }: { source: string }) {
  const badge = SOURCE_BADGES[source] || { bg: 'bg-slate-500/15 border-slate-500/25', text: 'text-slate-400', label: source, icon: '📎' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
      <span className="text-[10px]">{badge.icon}</span>
      {badge.label}
    </span>
  )
}

export default function Leads() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [source, setSource] = useState('ALL')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [newLeadForm, setNewLeadForm] = useState({ name: '', email: '', phone: '', city: '', course: '' })
  const navigate = useNavigate()
  const { canCreateLeads, canEditLeads, canDeleteLeads, canAssignLeads } = usePermissions()

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { search, status, source, page }],
    queryFn: () => leadsApi.getAll({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      source: source === 'ALL' ? undefined : source,
      page,
      limit: 20,
    }).then(r => r.data),
  })

  // Fetch users for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: () => leadsApi.getAll({ limit: 100 }).then(() => 
      fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      }).then(r => r.json())
    ),
    enabled: canAssignLeads && isAssignModalOpen,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => leadsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead deleted successfully')
    },
    onError: () => toast.error('Failed to delete lead')
  })

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (window.confirm(`Are you sure you want to delete "${leadName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(leadId)
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => leadsApi.create({ ...data, source: 'SELF_LOCAL', status: 'NEW' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead added successfully')
      setIsAddModalOpen(false)
      setNewLeadForm({ name: '', email: '', phone: '', city: '', course: '' })
    },
    onError: () => toast.error('Failed to create lead')
  })

  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) => leadsApi.assign(leadId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead assigned successfully')
      setIsAssignModalOpen(false)
      setSelectedLead(null)
    },
    onError: () => toast.error('Failed to assign lead')
  })

  const handleAssignLead = (lead: any) => {
    setSelectedLead(lead)
    setIsAssignModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Leads</h2>
          <p className="text-slate-400 text-sm">{data?.total ?? 0} total leads from all campaigns</p>
        </div>
        {canCreateLeads && (
          <button 
            className="btn-primary flex items-center gap-1.5"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={15} /> Add Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className="input pl-9 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input h-9 w-auto min-w-[140px]"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          className="input h-9 w-auto min-w-[200px]"
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(1) }}
        >
          {SOURCE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                {['Lead', 'Contact', 'Course', 'Campaign Source', 'Status', 'Assigned', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface-700 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.leads?.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.city || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1.5"><Mail size={11} /> {lead.email}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} /> {lead.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{lead.course || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <SourceBadge source={lead.source} />
                      {lead.landingPage && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Globe size={9} /> /{lead.landingPage}
                        </p>
                      )}
                      {lead.utmCampaign && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Megaphone size={9} /> {lead.utmCampaign}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     {canEditLeads ? (
                      <select
                        className={`text-xs px-2 py-1 rounded-full border cursor-pointer bg-transparent badge-${lead.status.toLowerCase()}`}
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateMutation.mutate({ id: lead.id, data: { status: e.target.value } })}
                      >
                        {['NEW','CONTACTED','QUALIFIED','NURTURING','CONVERTED','LOST','JUNK'].map(s => (
                          <option key={s} value={s} className="bg-surface-800 text-slate-200">{s}</option>
                        ))}
                      </select>
                     ) : (
                      <span className={`text-xs px-2 py-1 rounded-full border badge-${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                     )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {lead.assignedTo.name[0]}
                        </div>
                        <span className="text-xs text-slate-300">{lead.assignedTo.name.split(' ')[0]}</span>
                        {canAssignLeads && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignLead(lead)
                            }}
                            className="ml-1 text-[10px] text-slate-400 hover:text-brand-400 transition-colors"
                            title="Reassign lead"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      canAssignLeads ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssignLead(lead)
                          }}
                          className="text-xs px-2 py-1 bg-brand-500/20 text-brand-400 rounded hover:bg-brand-500/30 transition-colors flex items-center gap-1"
                        >
                          <Users size={12} /> Assign
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Unassigned</span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </button>
                    {canDeleteLeads && (
                      <button 
                        className="text-red-400 hover:text-red-300 transition-colors ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLead(lead.id, lead.name)
                        }}
                        title="Delete lead"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !data?.leads?.length && (
            <div className="text-center py-16 text-slate-500 text-sm">No leads found</div>
          )}
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700">
            <p className="text-xs text-slate-400">
              Page {data.page} of {data.totalPages} · {data.total} leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary h-8 px-3 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-secondary h-8 px-3 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-md w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Add New Lead</h3>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Name *</label>
                <input required className="input w-full" value={newLeadForm.name} onChange={e => setNewLeadForm(p => ({...p, name: e.target.value}))} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Email *</label>
                <input required type="email" className="input w-full" value={newLeadForm.email} onChange={e => setNewLeadForm(p => ({...p, email: e.target.value}))} placeholder="john@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Phone *</label>
                <input required className="input w-full" value={newLeadForm.phone} onChange={e => setNewLeadForm(p => ({...p, phone: e.target.value}))} placeholder="+91 9876543210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Course</label>
                  <input className="input w-full" value={newLeadForm.course} onChange={e => setNewLeadForm(p => ({...p, course: e.target.value}))} placeholder="e.g. MBA" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">City</label>
                  <input className="input w-full" value={newLeadForm.city} onChange={e => setNewLeadForm(p => ({...p, city: e.target.value}))} placeholder="e.g. Mumbai" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={() => {
                  if (!newLeadForm.name || (!newLeadForm.email && !newLeadForm.phone)) {
                    toast.error('Name, and Email or Phone are required')
                    return
                  }
                  createMutation.mutate(newLeadForm)
                }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {isAssignModalOpen && selectedLead && canAssignLeads && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-md w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Assign Lead</h3>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300 font-medium">{selectedLead.name}</p>
                <p className="text-xs text-slate-500">{selectedLead.email} • {selectedLead.phone}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Assign To</label>
                <select 
                  className="input w-full"
                  defaultValue=""
                  id="user-select"
                >
                  <option value="" disabled>Select a user...</option>
                  {usersData?.users?.filter((u: any) => u.isActive).map((user: any) => (
                    <option key={user.id} value={user.id} className="bg-surface-800 text-slate-200">
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={() => {
                  const select = document.getElementById('user-select') as HTMLSelectElement
                  if (!select?.value) {
                    toast.error('Please select a user')
                    return
                  }
                  assignMutation.mutate({ leadId: selectedLead.id, userId: select.value })
                }}
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Assign Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
