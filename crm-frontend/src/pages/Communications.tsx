import { useQuery } from '@tanstack/react-query'
import { commsApi } from '../api/client'
import { MessageSquare, Mail, Phone, MessageCircle, StickyNote } from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import { useState } from 'react'

const TYPE_ICONS: Record<string, any> = {
  EMAIL: Mail,
  CALL: Phone,
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
  NOTE: StickyNote,
}

const TYPE_COLORS: Record<string, string> = {
  EMAIL: 'text-blue-400 bg-blue-500/10',
  CALL: 'text-green-400 bg-green-500/10',
  WHATSAPP: 'text-emerald-400 bg-emerald-500/10',
  SMS: 'text-yellow-400 bg-yellow-500/10',
  NOTE: 'text-purple-400 bg-purple-500/10',
}

export default function Communications() {
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['communications', typeFilter],
    queryFn: () => commsApi.getAll({
      type: typeFilter || undefined,
    }).then(r => r.data),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Communications</h2>
          <p className="text-slate-400 text-sm">Email, SMS and WhatsApp history</p>
        </div>
        <div className="flex items-center gap-2">
          {['', 'EMAIL', 'CALL', 'WHATSAPP', 'SMS', 'NOTE'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-700 text-slate-400 hover:text-white'
              }`}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 divide-y divide-surface-700">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 bg-surface-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-700 rounded animate-pulse w-48" />
                <div className="h-3 bg-surface-700 rounded animate-pulse w-64" />
              </div>
            </div>
          ))
        ) : data?.communications?.length > 0 ? (
          data.communications.map((comm: any) => {
            const Icon = TYPE_ICONS[comm.type] || MessageSquare
            const colorClass = TYPE_COLORS[comm.type] || 'text-slate-400 bg-surface-700'
            return (
              <div key={comm.id} className="px-5 py-4 flex items-start gap-4 hover:bg-surface-700/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-slate-400 uppercase">{comm.type}</span>
                    {comm.subject && (
                      <span className="text-sm font-medium text-slate-200">— {comm.subject}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{comm.content}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {comm.lead && (
                      <span className="text-xs bg-surface-700 text-slate-400 px-2 py-0.5 rounded">
                        {comm.lead.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{formatRelativeTime(comm.createdAt)}</span>
                    <span className={`text-xs ${comm.status === 'SENT' ? 'text-green-400' : 'text-slate-500'}`}>
                      {comm.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16">
            <MessageSquare size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No communications yet</p>
            <p className="text-xs text-slate-600 mt-1">Communications will appear here as you interact with leads</p>
          </div>
        )}
      </div>
    </div>
  )
}
