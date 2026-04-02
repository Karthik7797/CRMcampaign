import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'

const STAGES = [
  { key: 'ENQUIRY', label: 'Enquiry', color: 'border-blue-500' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-yellow-500' },
  { key: 'APPLICATION_SENT', label: 'App Sent', color: 'border-orange-500' },
  { key: 'APPLICATION_RECEIVED', label: 'App Received', color: 'border-purple-500' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-cyan-500' },
  { key: 'ENROLLED', label: 'Enrolled', color: 'border-green-500' },
]

export default function Pipeline() {
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['leads', { limit: 200 }],
    queryFn: () => leadsApi.getAll({ limit: 200 }).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, stage }: any) => leadsApi.update(id, { pipelineStage: stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })

  const leadsByStage = (stage: string) =>
    data?.leads?.filter((l: any) => l.pipelineStage === stage) ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Pipeline</h2>
        <p className="text-slate-400 text-sm">Drag leads through enrollment stages</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const leads = leadsByStage(key)
          return (
            <div key={key} className="flex-shrink-0 w-64">
              <div className={`card border-t-2 ${color} p-0`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</h3>
                  <span className="text-xs bg-surface-700 text-slate-400 px-2 py-0.5 rounded-full">{leads.length}</span>
                </div>
                <div className="p-2 space-y-2 max-h-[65vh] overflow-y-auto">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="bg-surface-900 border border-surface-600 rounded-lg p-3
                                                   hover:border-surface-500 transition-all cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {lead.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-200">{lead.name}</p>
                          <p className="text-[10px] text-slate-500">{lead.course || 'No course'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {STAGES.filter(s => s.key !== key).slice(0, 3).map(s => (
                          <button
                            key={s.key}
                            onClick={() => updateMutation.mutate({ id: lead.id, stage: s.key })}
                            className="text-[10px] text-slate-400 hover:text-brand-400 bg-surface-700 hover:bg-surface-600 px-1.5 py-0.5 rounded transition-colors"
                          >
                            → {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs">No leads here</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
