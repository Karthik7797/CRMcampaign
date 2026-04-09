import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Edit2, Calendar, FileText, Tag, Loader2, Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatDateTime } from '../lib/utils'

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [newNote, setNewNote] = useState('')
  const notesEndRef = useRef<HTMLDivElement>(null)

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getOne(id!).then(r => r.data),
    enabled: !!id,
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        city: lead.city || '',
        course: lead.course || '',
        qualification: lead.qualification || '',
        status: lead.status || 'NEW',
        priority: lead.priority || 'MEDIUM',
      })
    }
  }, [lead])

  const updateMutation = useMutation({
    mutationFn: (data: any) => leadsApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      qc.invalidateQueries({ queryKey: ['leads'] })
      setIsEditing(false)
      toast.success('Lead details updated successfully')
    },
    onError: () => {
      toast.error('Failed to update lead')
    }
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => leadsApi.addNote(id!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
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
        <h2 className="text-xl text-red-400">Error loading lead details</h2>
        <button className="btn-secondary mt-4" onClick={() => navigate('/leads')}>Go Back</button>
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
            onClick={() => navigate('/leads')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
              {lead.name}
              <span className={`text-xs px-2.5 py-1 rounded-full badge-${lead.status.toLowerCase()}`}>
                {lead.status}
              </span>
            </h2>
            <p className="text-slate-400 text-sm">Added {formatRelativeTime(lead.createdAt)}</p>
          </div>
        </div>
        <div>
          {isEditing ? (
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><User size={12}/> Name</label>
                {isEditing ? (
                  <input name="name" value={formData.name} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.name}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Mail size={12}/> Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.email}
                    <a href={`mailto:${lead.email}`} className="text-brand-500 hover:text-brand-400"><Mail size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Phone size={12}/> Phone</label>
                {isEditing ? (
                  <input name="phone" value={formData.phone} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.phone}
                    <a href={`tel:${lead.phone}`} className="text-green-500 hover:text-green-400"><Phone size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><MapPin size={12}/> City</label>
                {isEditing ? (
                  <input name="city" value={formData.city} onChange={handleChange} className="input w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.city || '—'}</div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-500" />
              Notes & Requirements
            </h3>
            
            {/* Chat History */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {lead.leadNotes && lead.leadNotes.length > 0 ? (
                [...lead.leadNotes].reverse().map((note: any, index: number) => {
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
              
              {lead.landingPage && (
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Landing Page</label>
                  <div className="text-sm text-slate-300">/{lead.landingPage}</div>
                </div>
              )}
              
              {(lead.utmSource || lead.utmCampaign) && (
                <div className="pt-4 border-t border-surface-700">
                  <label className="text-xs text-brand-400 font-medium flex items-center gap-1.5 mb-2"><Tag size={12}/> Marketing Attribution</label>
                  <div className="space-y-1.5 mt-2 bg-surface-800/50 p-2.5 rounded-lg border border-surface-700">
                    {lead.utmSource && <div className="text-xs flex justify-between"><span className="text-slate-500">Source:</span> <span className="text-slate-300 font-medium">{lead.utmSource}</span></div>}
                    {lead.utmMedium && <div className="text-xs flex justify-between"><span className="text-slate-500">Medium:</span> <span className="text-slate-300 font-medium">{lead.utmMedium}</span></div>}
                    {lead.utmCampaign && <div className="text-xs flex justify-between"><span className="text-slate-500">Campaign:</span> <span className="text-slate-300 font-medium">{lead.utmCampaign}</span></div>}
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
