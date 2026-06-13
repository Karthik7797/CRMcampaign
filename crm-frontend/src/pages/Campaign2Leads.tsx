// TODO: Replace placeholder fields below with the real Campaign 2 Google Form fields
// once finalized. Update: emptyForm, the table columns, and the add-lead modal inputs.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaign2Api, usersApi } from '../api/client'
import { Search, Plus, Phone, Mail, MoreVertical, ChevronLeft, ChevronRight, X, Loader2, Users, MapPin } from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import { usePermissions } from '../hooks/usePermissions'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'JUNK']

const emptyForm = {
  studentName: '', studentEmail: '', studentMobile: '',
  city: '', currentQualification: '', course: '',
  budget: '', preferredIntake: '', socialHandle: '', remarks: ''
}

export default function Campaign2Leads() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()
  const { can } = usePermissions()

  const canCreate = can('campaign_2:create')
  const canEdit   = can('campaign_2:edit')
  const canDelete = can('campaign_2:delete')
  const canAssign = can('campaign_2:assign')

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-2-leads', { search, status, page }],
    queryFn: () => campaign2Api.getAll({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      page,
      limit: 20,
    }).then(r => r.data),
  })

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-for-c2-assignment'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then(r => r.data),
    enabled: canAssign && isAssignModalOpen,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => campaign2Api.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign-2-leads'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaign2Api.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-2-leads'] })
      toast.success('Lead deleted')
    },
    onError: () => toast.error('Failed to delete lead'),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => campaign2Api.create({ ...data, source: 'GOOGLE_FORM', status: 'NEW' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-2-leads'] })
      toast.success('Lead added successfully')
      setIsAddModalOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to create lead'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) => campaign2Api.assign(leadId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-2-leads'] })
      toast.success('Lead assigned')
      setIsAssignModalOpen(false)
      setSelectedLead(null)
    },
    onError: () => toast.error('Failed to assign lead'),
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Campaign 2 — Leads</h2>
          <p className="text-slate-400 text-sm">{data?.total ?? 0} total leads from Google Form</p>
        </div>
        {canCreate && (
          <button type="button" className="btn-primary flex items-center gap-1.5" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={15} /> Add Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by name, email, phone, city..."
            className="input pl-9 h-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input h-9 w-auto min-w-[140px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                {['Student', 'Contact', 'City / Course', 'Budget', 'Status', 'Assigned', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-700 rounded animate-pulse w-24" /></td>
                    ))}</tr>
                  ))
                : data?.leads?.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-surface-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/campaigns/2/${lead.id}`, { state: { listContext: { search, status, page } } })}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {lead.studentName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{lead.studentName}</p>
                          <p className="text-xs text-slate-500">{lead.currentQualification || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-300 flex items-center gap-1.5"><Mail size={11} /> {lead.studentEmail}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} /> {lead.studentMobile}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1"><MapPin size={10} className="text-slate-500" />{lead.city || '—'}</p>
                        <p className="text-slate-400">{lead.course || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{lead.budget || '—'}</td>
                    <td className="px-4 py-3">
                      {canEdit ? (
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
                        <span className={`text-xs px-2 py-1 rounded-full border badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {lead.assignedTo.name[0]}
                          </div>
                          <span className="text-xs text-slate-300">{lead.assignedTo.name.split(' ')[0]}</span>
                          {canAssign && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsAssignModalOpen(true) }}
                              className="ml-1 text-[10px] text-slate-400 hover:text-brand-400" title="Reassign">✕</button>
                          )}
                        </div>
                      ) : canAssign ? (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsAssignModalOpen(true) }}
                          className="text-xs px-2 py-1 bg-brand-500/20 text-brand-400 rounded hover:bg-brand-500/30 flex items-center gap-1">
                          <Users size={12} /> Assign
                        </button>
                      ) : <span className="text-xs text-slate-500">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="text-slate-500 hover:text-slate-300" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                      </button>
                      {canDelete && (
                        <button type="button" className="text-red-400 hover:text-red-300 ml-2"
                          onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${lead.studentName}"?`)) deleteMutation.mutate(lead.id) }}
                          title="Delete lead"><X size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!isLoading && !data?.leads?.length && (
            <div className="text-center py-16 text-slate-500 text-sm">No Campaign 2 leads found</div>
          )}
        </div>
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700">
            <p className="text-xs text-slate-400">Page {data.page} of {data.totalPages} · {data.total} leads</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary h-8 px-3 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button type="button" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="btn-secondary h-8 px-3 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-lg w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Add Campaign 2 Lead</h3>
              <button type="button" className="text-slate-400 hover:text-white" onClick={() => setIsAddModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Student Name *</label>
                <input required className="input w-full" value={form.studentName} onChange={e => setForm(p => ({...p, studentName: e.target.value}))} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Student Email *</label>
                  <input required type="email" className="input w-full" value={form.studentEmail} onChange={e => setForm(p => ({...p, studentEmail: e.target.value}))} placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Student Mobile *</label>
                  <input required className="input w-full" value={form.studentMobile} onChange={e => setForm(p => ({...p, studentMobile: e.target.value}))} placeholder="9876543210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">City</label>
                  <input className="input w-full" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="Mumbai" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Current Qualification</label>
                  <input className="input w-full" value={form.currentQualification} onChange={e => setForm(p => ({...p, currentQualification: e.target.value}))} placeholder="12th / Bachelor's" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Course of Interest</label>
                  <input className="input w-full" value={form.course} onChange={e => setForm(p => ({...p, course: e.target.value}))} placeholder="MBA" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Budget</label>
                  <input className="input w-full" value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))} placeholder="10–15 LPA" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Preferred Intake</label>
                  <input className="input w-full" value={form.preferredIntake} onChange={e => setForm(p => ({...p, preferredIntake: e.target.value}))} placeholder="Sep 2026" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium ml-1">Social Handle</label>
                  <input className="input w-full" value={form.socialHandle} onChange={e => setForm(p => ({...p, socialHandle: e.target.value}))} placeholder="@handle" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Remarks</label>
                <textarea className="input w-full h-20 resize-none" value={form.remarks} onChange={e => setForm(p => ({...p, remarks: e.target.value}))} placeholder="Any notes..." />
              </div>
            </div>
            <div className="p-4 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary flex items-center gap-2"
                onClick={() => {
                  if (!form.studentName || !form.studentEmail || !form.studentMobile) {
                    toast.error('Student Name, Email, and Mobile are required')
                    return
                  }
                  createMutation.mutate(form)
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

      {/* Assign Modal */}
      {isAssignModalOpen && selectedLead && canAssign && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-800 rounded-xl max-w-md w-full border border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-800/50">
              <h3 className="font-semibold text-white">Assign Lead</h3>
              <button type="button" className="text-slate-400 hover:text-white" onClick={() => setIsAssignModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300 font-medium">{selectedLead.studentName}</p>
                <p className="text-xs text-slate-500">{selectedLead.studentEmail} • {selectedLead.studentMobile}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1">Assign To</label>
                <select className="input w-full" defaultValue="" id="c2-user-select" aria-label="Select user">
                  <option value="" disabled>Select a user...</option>
                  {isLoadingUsers ? <option disabled>Loading...</option>
                    : usersData?.users?.filter((u: any) => u.isActive).map((u: any) => (
                      <option key={u.id} value={u.id} className="bg-surface-800 text-slate-200">{u.name} ({u.role})</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary flex items-center gap-2"
                onClick={() => {
                  const sel = document.getElementById('c2-user-select') as HTMLSelectElement
                  if (!sel?.value) { toast.error('Please select a user'); return }
                  assignMutation.mutate({ leadId: selectedLead.id, userId: sel.value })
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
