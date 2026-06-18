import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { influencerLeadsApi } from '../api/client'
import { ArrowLeft, User, Mail, Phone, GraduationCap, Calendar, MapPin, Save, Edit2, Loader2, Send, MessageSquare, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatDateTime, formatDate, followUpBucket, followUpPillClass, followUpPillLabel } from '../lib/utils'
import { usePermissions } from '../hooks/usePermissions'
import { useLeadNavigator } from '../hooks/useLeadNavigator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function InfluencerLeadDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [newNote, setNewNote] = useState('')
  const notesEndRef = useRef<HTMLDivElement>(null)

  const { canEditInfluencerLeads } = usePermissions()

  const listContext = (location.state as any)?.listContext
  const { prevId, nextId, goPrev, goNext, position, total, hasContext } = useLeadNavigator(id, listContext, {
    api: influencerLeadsApi,
    listKey: 'influencer-leads',
    detailKey: 'influencer-lead',
    routeBase: '/influencer-leads',
  })

  // Keyboard navigation: ← / → step between leads, but not while typing in a field.
  useEffect(() => {
    if (!hasContext) return
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft' && prevId) { e.preventDefault(); goPrev() }
      else if (e.key === 'ArrowRight' && nextId) { e.preventDefault(); goNext() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasContext, prevId, nextId, goPrev, goNext])

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
        followUpDate: lead.followUpDate ? String(lead.followUpDate).slice(0, 10) : '',
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
    const payload = {
      ...formData,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
    }
    updateMutation.mutate(payload)
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
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/influencer-leads')}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-surface-700 text-slate-400 hover:text-slate-100 rounded-full transition-colors"
            onClick={() => navigate('/influencer-leads')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-display flex items-center gap-3">
              {lead.studentName}
              <span className={`text-xs px-2.5 py-1 rounded-full badge-${lead.status.toLowerCase()}`}>
                {lead.status}
              </span>
            </h2>
            <p className="text-slate-400 text-sm">Added {formatRelativeTime(lead.createdAt)}</p>
          </div>
          {hasContext && (
            <div className="flex items-center gap-1 ml-2 border-l border-surface-700 pl-3">
              <button
                type="button"
                disabled={!prevId}
                onClick={goPrev}
                title="Previous lead (←)"
                aria-label="Previous lead"
                className="p-2 rounded-full hover:bg-surface-700 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {position && <span className="text-xs text-slate-500 tabular-nums px-1">{position} / {total}</span>}
              <button
                type="button"
                disabled={!nextId}
                onClick={goNext}
                title="Next lead (→)"
                aria-label="Next lead"
                className="p-2 rounded-full hover:bg-surface-700 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        <div>
          {canEditInfluencerLeads && (
            isEditing ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant="secondary" className="flex items-center gap-2" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit Details
              </Button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-brand-500" />
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentName" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><User size={12}/> Student Name</Label>
                {isEditing ? (
                  <Input id="studentName" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.studentName}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studentEmail" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Mail size={12}/> Student Email</Label>
                {isEditing ? (
                  <Input id="studentEmail" type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.studentEmail}
                    <a href={`mailto:${lead.studentEmail}`} className="text-brand-500 hover:text-brand-400"><Mail size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studentMobile" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Phone size={12}/> Student Mobile</Label>
                {isEditing ? (
                  <Input id="studentMobile" name="studentMobile" value={formData.studentMobile} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.studentMobile}
                    <a href={`tel:${lead.studentMobile}`} className="text-green-500 hover:text-green-400"><Phone size={14}/></a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="collegeName" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><GraduationCap size={12}/> College Name</Label>
                {isEditing ? (
                  <Input id="collegeName" name="collegeName" value={formData.collegeName} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.collegeName || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
              <Users size={20} className="text-brand-500" />
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="parentName" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><User size={12}/> Parent Name</Label>
                {isEditing ? (
                  <Input id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.parentName || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parentMobile" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Phone size={12}/> Parent Mobile</Label>
                {isEditing ? (
                  <Input id="parentMobile" name="parentMobile" value={formData.parentMobile} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent flex items-center gap-2">
                    {lead.parentMobile || '—'}
                    {lead.parentMobile && <a href={`tel:${lead.parentMobile}`} className="text-green-500 hover:text-green-400"><Phone size={14}/></a>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="parentOccupation" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Parent Occupation</Label>
                {isEditing ? (
                  <Input id="parentOccupation" name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.parentOccupation || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-brand-500" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="intake" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><Calendar size={12}/> Intake</Label>
                {isEditing ? (
                  <Input id="intake" name="intake" value={formData.intake} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.intake || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interestedCountry" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><MapPin size={12}/> Interested Country</Label>
                {isEditing ? (
                  <Input id="interestedCountry" name="interestedCountry" value={formData.interestedCountry} onChange={handleChange} className="w-full" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.interestedCountry || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Mode</Label>
                {isEditing ? (
                  <Select
                    value={formData.mode ? formData.mode : 'none'}
                    onValueChange={(v) => setFormData((prev: any) => ({ ...prev, mode: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select mode..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select mode...</SelectItem>
                      <SelectItem value="Office Visit">Office Visit</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">{lead.mode || '—'}</div>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="remarks" className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5"><FileText size={12}/> Remarks</Label>
                {isEditing ? (
                  <Textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} className="w-full h-20 resize-none" />
                ) : (
                  <div className="px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent min-h-[60px]">{lead.remarks || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="card">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-brand-500" />
              Follow-up
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="followUpDate" className="text-xs text-slate-400 font-medium ml-1">Follow-up Date</Label>
              {isEditing ? (
                <Input
                  id="followUpDate"
                  type="date"
                  name="followUpDate"
                  title="Follow-up Date"
                  value={formData.followUpDate || ''}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center gap-3 px-3 py-2 bg-surface-800 rounded-lg text-slate-200 border border-transparent">
                  {lead.followUpDate ? (
                    <>
                      <span>{formatDate(lead.followUpDate)}</span>
                      {(() => {
                        const bucket = followUpBucket(lead.followUpDate)
                        if (bucket === 'none') return null
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${followUpPillClass[bucket]}`}>
                            {followUpPillLabel[bucket]}
                          </span>
                        )
                      })()}
                    </>
                  ) : (
                    <span className="text-slate-500">— not set —</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
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
              <Input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a note..."
                className="flex-1"
                disabled={addNoteMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="flex items-center gap-2 px-4"
              >
                {addNoteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Add Note
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold mb-4 tracking-wide uppercase text-slate-300">Lead Metadata</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-400 font-medium">Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(v) => setFormData((prev: any) => ({ ...prev, status: v }))}>
                    <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'JUNK', 'DNP'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 font-medium text-slate-200">{lead.status}</div>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-400 font-medium">Priority</Label>
                {isEditing ? (
                  <Select value={formData.priority} onValueChange={(v) => setFormData((prev: any) => ({ ...prev, priority: v }))}>
                    <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {['HIGH', 'MEDIUM', 'LOW'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Label className="text-xs text-slate-400 font-medium block mb-1">Source</Label>
                <div className="text-sm font-medium text-slate-200">{lead.source}</div>
              </div>

              <div className="pt-4 border-t border-surface-700">
                <Label className="text-xs text-slate-400 font-medium block mb-1">Pipeline Stage</Label>
                <div className="text-sm font-medium text-slate-200">{lead.pipelineStage}</div>
              </div>

              {lead.assignedTo && (
                <div className="pt-4 border-t border-surface-700">
                  <Label className="text-xs text-slate-400 font-medium block mb-1">Assigned To</Label>
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
