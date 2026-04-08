import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { leadsApi } from '../api/client'
import { Users } from 'lucide-react'

const STAGES = [
  { key: 'ENQUIRY', label: 'Enquiry', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { key: 'DEMO', label: 'Demo (Virtual & Walking)', color: 'border-orange-500', bg: 'bg-orange-500/10' },
  { key: 'UNIVERSITY_SELECTION', label: 'Country & University Selection', color: 'border-purple-500', bg: 'bg-purple-500/10' },
  { key: 'OFFER_LETTER', label: 'Offer Letter', color: 'border-cyan-500', bg: 'bg-cyan-500/10' },
  { key: 'VISA', label: 'Visa', color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
  { key: 'ACCOMMODATION', label: 'Accommodation', color: 'border-pink-500', bg: 'bg-pink-500/10' },
  { key: 'PART_TIME_JOB', label: 'Part-time Job', color: 'border-green-500', bg: 'bg-green-500/10' },
  { key: 'FULL_TIME', label: 'Full-time', color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
]

export default function Pipeline() {
  const qc = useQueryClient()
  const [viewByAssignee, setViewByAssignee] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => leadsApi.getAll({ limit: 500 }).then(r => r.data),
  })

  const moveStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => leadsApi.moveStage(id, stage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const { draggableId, destination } = result
    const newStage = STAGES.find(s => s.key === destination.droppableId)
    
    if (!newStage) return

    moveStageMutation.mutate({
      id: draggableId,
      stage: newStage.key,
    })
  }

  const counsellors = Array.from(new Set(data?.leads?.map((l: any) => l.assignedTo).filter(Boolean)))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Pipeline</h2>
          <p className="text-slate-400 text-sm">Drag leads through enrollment stages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewByAssignee(!viewByAssignee)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewByAssignee 
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                : 'bg-surface-700 text-slate-400 border border-surface-600'
            }`}
          >
            <Users size={14} className="inline mr-1.5" />
            {viewByAssignee ? 'View: By Assignee' : 'View: All Leads'}
          </button>
        </div>
      </div>

      {/* View by Assignee Section */}
      {viewByAssignee && (
        <div className="space-y-6">
          {counsellors.map((counsellor: any) => (
            <div key={counsellor.id} className="card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {counsellor.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{counsellor.name}</h3>
                  <p className="text-xs text-slate-400">{counsellor.role}</p>
                </div>
                <span className="ml-auto text-xs text-slate-400">
                  {data?.leads?.filter((l: any) => l.assignedTo?.id === counsellor.id).length} leads
                </span>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {STAGES.map(({ key, label, color, bg }) => {
                    const leads = data?.leads?.filter(
                      (l: any) => l.pipelineStage === key && l.assignedTo?.id === counsellor.id
                    ) ?? []
                    
                    return (
                      <div key={key} className="flex-shrink-0 w-60">
                        <div className={`${bg} border ${color} border-t-2 rounded-lg p-2`}>
                          <div className="flex items-center justify-between mb-2 px-1">
                            <h4 className="text-xs font-semibold text-white">{label}</h4>
                            <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full">
                              {leads.length}
                            </span>
                          </div>
                          <Droppable droppableId={key}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="min-h-[100px] space-y-2"
                              >
                                {leads.map((lead: any, index: number) => (
                                  <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-surface-900 border border-surface-600 rounded p-2 cursor-grab active:cursor-grabbing hover:border-surface-500 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                            {lead.name[0]}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-white truncate">{lead.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{lead.course || 'No course'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {leads.length === 0 && (
                                  <div className="text-center py-4 text-slate-600 text-xs">No leads</div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </DragDropContext>
            </div>
          ))}
          {counsellors.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">No assigned leads found</div>
          )}
        </div>
      )}

      {/* Unified Board View */}
      {!viewByAssignee && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(({ key, label, color, bg }) => {
              const leads = data?.leads?.filter((l: any) => l.pipelineStage === key) ?? []
              
              return (
                <div key={key} className="flex-shrink-0 w-64">
                  <div className={`${bg} border ${color} border-t-2 rounded-lg p-2`}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h3 className="text-xs font-semibold text-white">{label}</h3>
                      <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full">
                        {leads.length}
                      </span>
                    </div>
                    <Droppable droppableId={key}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="min-h-[100px] space-y-2 max-h-[65vh] overflow-y-auto"
                        >
                          {leads.map((lead: any, index: number) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-surface-900 border border-surface-600 rounded p-3 cursor-grab active:cursor-grabbing hover:border-surface-500 transition-colors"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                      {lead.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white truncate">{lead.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{lead.course || 'No course'}</p>
                                    </div>
                                  </div>
                                  {lead.assignedTo && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                      <div className="w-4 h-4 rounded-full bg-surface-700 flex items-center justify-center text-[8px] font-bold text-white">
                                        {lead.assignedTo.name[0]}
                                      </div>
                                      <span className="truncate">{lead.assignedTo.name}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {leads.length === 0 && (
                            <div className="text-center py-6 text-slate-600 text-xs">No leads here</div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
