import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { influencerLeadsApi } from '../api/client'
import { ArrowLeft, User, Mail, Phone, GraduationCap, Calendar, MapPin, Save, Edit2, Loader2, Send, MessageSquare, Users, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatDateTime } from '../lib/utils'
import { usePermissions } from '../hooks/usePermissions'

export default function InfluencerLeadDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [newNote, setNewNote] = useState('')
  const notesEndRef = useRef<HTMLDivElement>(null)

  const { canEditInfluencerLeads } = usePermissions()

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['influencer-lead', id],
    queryFn: () => influencerLeadsApi.getOne(id!).then(r => r.data),
    enabled: !!id,
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        studentName: lead.studentName || '',
        studentEmail: lead.studentEmail || '',
        studentMobile: lead.studentMobile || '',
        collegeName: lead.collegeName || '',
        parentName: lead.parentName || '',
        parentMobile: lead.parentMobile || '',
        parentOccupation: lead.parentOccupation || '',
        intake: lead.intake || '',
        interestedCountry: lead.interestedCountry || '',
        mode: lead.mode || '',
        remarks: lead.remarks || '',
        status: lead.status || 'NEW',
        priority: lead.priority || 'MEDIUM',
      })
    }
  }, [lead])

  const updateMutation = useMutation({
    mutationFn: (data: any) => influencerLeadsApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-lead', id] })
      qc.invalidateQueries({ queryKey: ['influencer-leads'] })
      setIsEditing(false)
      toast.success('Influencer lead updated successfully')
    },
    onError: () => {
      toast.error('Failed to update influencer lead')
    }
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => influencerLeadsApi.addNote(id!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-lead', id] })
      setNewNote('')
      toast.success('Note added successfully')
    },
    onError: () => {
      toast.error('Failed to add note')
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote.trim())
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl text-red-400">Error loading influencer lead details</h2>
        <button className="btn-secondary mt-4" onClick={() => navigate('/influencer-leads')}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-surface-700 text-slate-400 hover:text-white rounded-full transition-colors"
            onClick={() => navigate('/influencer-leads')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
              {lead.studentName}
              <span className={`text-xs px-2.5 py-1 rounded-full badge-${lead.status.toLowerCase()}`}>
                {lead.status}
              </span>
            </h2>
            <p className="text-slate-400 text-sm">Added {formatRelativeTime(lead.createdAt)}</p>
          </div>
        </div>
        <div>
          {canEditInfluencerLeads && (
            isEditing ? (
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button 
                  className="btn-primary flex items-center gap-2" 
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  Save Changes
                </button>
              </div>
            ) : (
              <button className="btn-secondary flex items-center gap-2" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit Details
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-brand-500" />
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><User size={12}/> Student Name</label>
                {isEditing ? (
                  <input name="studentName" value={formData.studentName} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.studentName}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Mail size={12}/> Student Email</label>
                {isEditing ? (
                  <input type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.studentEmail}
                    <a href={`mailto:${lead.studentEmail}`} className="text-brand-500 hover:text-brand-400"><Mail size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Phone size={12}/> Student Mobile</label>
                {isEditing ? (
                  <input name="studentMobile" value={formData.studentMobile} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.studentMobile}
                    <a href={`tel:${lead.studentMobile}`} className="text-green-500 hover:text-green-400"><Phone size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><GraduationCap size={12}/> College Name</label>
                {isEditing ? (
                  <input name="collegeName" value={formData.collegeName} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.collegeName || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-brand-500" />
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><User size={12}/> Parent Name</label>
                {isEditing ? (
                  <input name="parentName" value={formData.parentName} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.parentName || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Phone size={12}/> Parent Mobile</label>
                {isEditing ? (
                  <input name="parentMobile" value={formData.parentMobile} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.parentMobile || '—'}
                    {lead.parentMobile && <a href={`tel:${lead.parentMobile}`} className="text-green-500 hover:text-green-400"><Phone size={14}/></a>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Parent Occupation</label>
                {isEditing ? (
                  <input name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.parentOccupation || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-brand-500" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Calendar size={12}/> Intake</label>
                {isEditing ? (
                  <input name="intake" value={formData.intake} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.intake || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><MapPin size={12}/> Interested Country</label>
                {isEditing ? (
                  <input name="interestedCountry" value={formData.interestedCountry} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.interestedCountry || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Mode</label>
                {isEditing ? (
                  <select name="mode" value={formData.mode} onChange={handleChange} className="input w-full">
                    <option value="">Select mode...</option>
                    <option value="Office Visit">Office Visit</option>
                    <option value="Online">Online</option>
                    <option value="Phone">Phone</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.mode || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Remarks</label>
                {isEditing ? (
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="input w-full h-20 resize-none" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent min-h-[60px]">{lead.remarks || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-500" />
              Notes & Activity
            </h3>
            
            {/* Chat History */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {lead.leadNotes && lead.leadNotes.length > 0 ? (
                [...lead.leadNotes].reverse().map((note: any) => {
                  const isCurrentUser = note.user?.id === lead.assignedTo?.id
                  return (
                    <div key={note.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-medium">
                          {note.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                          isCurrentUser 
                            ? 'bg-brand-500 text-white rounded-br-md' 
                            : 'bg-surface-700 text-slate-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-xs text-slate-500">{note.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes yet. Start the conversation!</p>
                </div>
              )}
              <div ref={notesEndRef} />
            </div>
            
            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-4 border-t border-surface-700">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a note..."
                className="flex-1 input"
                disabled={addNoteMutation.isPending}
              />
              <button
                type="submit"
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="btn-primary flex items-center gap-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addNoteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase text-slate-300">Lead Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Status</label>
                {isEditing ? (
                  <select name="status" value={formData.status} onChange={handleChange} className="input w-full mt-1">
                    {['NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'JUNK'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 font-medium text-slate-200">{lead.status}</div>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Priority</label>
                {isEditing ? (
                  <select name="priority" value={formData.priority} onChange={handleChange} className="input w-full mt-1">
                    {['HIGH', 'MEDIUM', 'LOW'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      lead.priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      lead.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {lead.priority}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-surface-700">
                <label className="text-xs text-slate-400 font-medium block mb-1">Source</label>
                <div className="text-sm font-medium text-slate-200">{lead.source}</div>
              </div>
              
              <div className="pt-4 border-t border-surface-700">
                <label className="text-xs text-slate-400 font-medium block mb-1">Pipeline Stage</label>
                <div className="text-sm font-medium text-slate-200">{lead.pipelineStage}</div>
              </div>

              {lead.assignedTo && (
                <div className="pt-4 border-t border-surface-700">
                  <label className="text-xs text-slate-400 font-medium block mb-1">Assigned To</label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {lead.assignedTo.name[0]}
                    </div>
                    <span className="text-sm text-slate-300">{lead.assignedTo.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
