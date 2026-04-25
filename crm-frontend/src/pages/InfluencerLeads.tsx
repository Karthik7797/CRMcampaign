import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { influencerLeadsApi, usersApi } from '../api/client'
import { Search, Plus, Phone, Mail, MoreVertical, ChevronLeft, ChevronRight, X, Loader2, Users, GraduationCap, MapPin, Calendar, User } from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import { usePermissions } from '../hooks/usePermissions'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'JUNK']

// Color-coded status badges
const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  NEW: { bg: 'bg-blue-500/15 border-blue-500/25', text: 'text-blue-400' },
  CONTACTED: { bg: 'bg-amber-500/15 border-amber-500/25', text: 'text-amber-400' },
  QUALIFIED: { bg: 'bg-emerald-500/15 border-emerald-500/25', text: 'text-emerald-400' },
  NURTURING: { bg: 'bg-purple-500/15 border-purple-500/25', text: 'text-purple-400' },
  CONVERTED: { bg: 'bg-green-500/15 border-green-500/25', text: 'text-green-400' },
  LOST: { bg: 'bg-red-500/15 border-red-500/25', text: 'text-red-400' },
  JUNK: { bg: 'bg-slate-500/15 border-slate-500/25', text: 'text-slate-400' },
}

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.NEW
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
      {status}
    </span>
  )
}

export default function InfluencerLeads() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [newLeadForm, setNewLeadForm] = useState({
    studentName: '', studentEmail: '', studentMobile: '',
    collegeName: '', parentName: '', parentMobile: '',
    parentOccupation: '', intake: '', interestedCountry: '',
    mode: '', remarks: ''
  })
  const navigate = useNavigate()
  const { canCreateInfluencerLeads, canEditInfluencerLeads, canDeleteInfluencerLeads, canAssignInfluencerLeads } = usePermissions()

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['influencer-leads', { search, status, page }],
    queryFn: () => influencerLeadsApi.getAll({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      page,
      limit: 20,
    }).then(r => r.data),
  })

  // Fetch users for assignment dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-for-influencer-assignment'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then(r => r.data),
    enabled: canAssignInfluencerLeads && isAssignModalOpen,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => influencerLeadsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-leads'] })
      toast.success('Influencer lead updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => influencerLeadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-leads'] })
      toast.success('Influencer lead deleted successfully')
    },
    onError: () => toast.error('Failed to delete influencer lead')
  })

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (window.confirm(`Are you sure you want to delete "${leadName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(leadId)
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => influencerLeadsApi.create({ ...data, source: 'GOOGLE_FORM', status: 'NEW' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-leads'] })
      toast.success('Influencer lead added successfully')
      setIsAddModalOpen(false)
      setNewLeadForm({
        studentName: '', studentEmail: '', studentMobile: '',
        collegeName: '', parentName: '', parentMobile: '',
        parentOccupation: '', intake: '', interestedCountry: '',
        mode: '', remarks: ''
      })
    },
    onError: () => toast.error('Failed to create influencer lead')
  })

  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) => influencerLeadsApi.assign(leadId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-leads'] })
      toast.success('Influencer lead assigned successfully')
      setIsAssignModalOpen(false)
      setSelectedLead(null)
    },
    onError: () => toast.error('Failed to assign influencer lead')
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
          <h2 className="text-xl font-bold text-white font-display">Influencer Leads</h2>
          <p className="text-slate-400 text-sm">{data?.total ?? 0} total leads from Google Forms</p>
        </div>
        {canCreateInfluencerLeads && (
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
            placeholder="Search by student name, email, phone, college..."
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
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                {['Student', 'Contact', 'College', 'Parent', 'Status', 'Assigned', 'Created', ''].map(h => (
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
                  onClick={() => navigate(`/influencer-leads/${lead.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {lead.studentName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{lead.studentName}</p>
                        <p className="text-xs text-slate-500">{lead.intake || '—'} · {lead.interestedCountry || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1.5"><Mail size={11} /> {lead.studentEmail}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} /> {lead.studentMobile}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <GraduationCap size={11} className="text-slate-500" />
                      {lead.collegeName || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1"><User size={10} /> {lead.parentName || '—'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} /> {lead.parentMobile || '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     {canEditInfluencerLeads ? (
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
                        {canAssignInfluencerLeads && (
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
                      canAssignInfluencerLeads ? (
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
                    {canDeleteInfluencerLeads && (
                      <button 
                        className="text-red-400 hover:text-red-300 transition-colors ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLead(lead.id, lead.studentName)
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
            <div className="text-center py-16 text-slate-500 text-sm">No influencer leads found</div>
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

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-lg w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Add Influencer Lead</h3>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Student Name *</label>
                <input required className="input w-full" value={newLeadForm.studentName} onChange={e => setNewLeadForm(p => ({...p, studentName: e.target.value}))} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Student Email *</label>
                  <input required type="email" className="input w-full" value={newLeadForm.studentEmail} onChange={e => setNewLeadForm(p => ({...p, studentEmail: e.target.value}))} placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Student Mobile *</label>
                  <input required className="input w-full" value={newLeadForm.studentMobile} onChange={e => setNewLeadForm(p => ({...p, studentMobile: e.target.value}))} placeholder="9876543210" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">College Name</label>
                <input className="input w-full" value={newLeadForm.collegeName} onChange={e => setNewLeadForm(p => ({...p, collegeName: e.target.value}))} placeholder="Example University" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Parent Name</label>
                  <input className="input w-full" value={newLeadForm.parentName} onChange={e => setNewLeadForm(p => ({...p, parentName: e.target.value}))} placeholder="Jane Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Parent Mobile</label>
                  <input className="input w-full" value={newLeadForm.parentMobile} onChange={e => setNewLeadForm(p => ({...p, parentMobile: e.target.value}))} placeholder="0123456789" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Parent Occupation</label>
                <input className="input w-full" value={newLeadForm.parentOccupation} onChange={e => setNewLeadForm(p => ({...p, parentOccupation: e.target.value}))} placeholder="Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Intake</label>
                  <input className="input w-full" value={newLeadForm.intake} onChange={e => setNewLeadForm(p => ({...p, intake: e.target.value}))} placeholder="May 2026" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Interested Country</label>
                  <input className="input w-full" value={newLeadForm.interestedCountry} onChange={e => setNewLeadForm(p => ({...p, interestedCountry: e.target.value}))} placeholder="UK" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Mode</label>
                <select className="input w-full" value={newLeadForm.mode} onChange={e => setNewLeadForm(p => ({...p, mode: e.target.value}))}>
                  <option value="">Select mode...</option>
                  <option value="Office Visit">Office Visit</option>
                  <option value="Online">Online</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Remarks</label>
                <textarea className="input w-full h-20 resize-none" value={newLeadForm.remarks} onChange={e => setNewLeadForm(p => ({...p, remarks: e.target.value}))} placeholder="Looking forward to starting my applications..." />
              </div>
            </div>
            <div className="p-4 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={() => {
                  if (!newLeadForm.studentName || !newLeadForm.studentEmail || !newLeadForm.studentMobile) {
                    toast.error('Student Name, Email, and Mobile are required')
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
      {isAssignModalOpen && selectedLead && canAssignInfluencerLeads && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-md w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Assign Influencer Lead</h3>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setIsAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300 font-medium">{selectedLead.studentName}</p>
                <p className="text-xs text-slate-500">{selectedLead.studentEmail} • {selectedLead.studentMobile}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Assign To</label>
                <select 
                  className="input w-full"
                  defaultValue=""
                  id="influencer-user-select"
                  aria-label="Select user to assign lead"
                >
                  <option value="" disabled>Select a user...</option>
                  {isLoadingUsers ? (
                    <option value="" disabled>Loading users...</option>
                  ) : usersData?.users?.filter((u: any) => u.isActive).map((user: any) => (
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
                  const select = document.getElementById('influencer-user-select') as HTMLSelectElement
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
