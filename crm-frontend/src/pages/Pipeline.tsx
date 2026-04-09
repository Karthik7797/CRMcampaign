import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { leadsApi, usersApi } from '../api/client'
import { Users, X } from 'lucide-react'

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
  const [selectedUserId, setSelectedUserId] = useState<string>('all')

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => leadsApi.getAll({ limit: 200 }).then(r => r.data),
  })

  // Fetch all users for the filter dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users-for-pipeline-filter'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then(r => r.data),
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

  // Filter leads by selected user
  const filteredLeads = selectedUserId === 'all'
    ? pipelineData?.leads
    : pipelineData?.leads?.filter((lead: any) => lead.assignedTo?.id === selectedUserId)

  // Get unique users from leads for the dropdown (remove duplicates)
  const uniqueUserIds = Array.from(
    new Set(
      pipelineData?.leads
        ?.map((l: any) => l.assignedTo?.id)
        .filter(Boolean)
    )
  )
  
  const counsellors = uniqueUserIds.map((userId) => 
    pipelineData?.leads?.find((l: any) => l.assignedTo?.id === userId)?.assignedTo
  ).filter(Boolean)

  // Get selected user details
  const selectedUserDetails = usersData?.users?.find((u: any) => u.id === selectedUserId)

  return (
    <div className="space-y-4 h-screen flex flex-col">
      {/* Header with User Filter - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Pipeline</h2>
          <p className="text-slate-400 text-sm">
            {selectedUserId === 'all' 
              ? 'Drag leads through enrollment stages' 
              : `Viewing ${selectedUserDetails?.name}'s leads`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* User Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Filter by User:</label>
            <select
              className="input h-9 w-auto min-w-[200px]"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              aria-label="Filter pipeline by user"
            >
              <option value="all">All Users</option>
              {counsellors.map((counsellor: any) => (
                <option key={counsellor.id} value={counsellor.id}>
                  {counsellor.name} ({counsellor.role})
                </option>
              ))}
            </select>
            {selectedUserId !== 'all' && (
              <button
                onClick={() => setSelectedUserId('all')}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Clear filter"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Board - Scrollable container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 pb-4 h-full">
            {STAGES.map(({ key, label, color, bg }) => {
              const leads = filteredLeads?.filter((l: any) => l.pipelineStage === key) ?? []
              
              return (
                <div key={key} className="flex-shrink-0 w-64">
                  <div className={`${bg} border ${color} border-t-2 rounded-lg p-2 h-full flex flex-col`}>
                    <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
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
                          className="flex-1 space-y-2 overflow-y-auto pr-2"
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
      </div>
    </div>
  )
}
