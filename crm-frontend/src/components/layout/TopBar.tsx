import { Menu, Bell, Search, Plus, Calendar, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { leadsApi, influencerLeadsApi, campaign1Api, campaign2Api } from '../../api/client'
import {
  followUpBucket, followUpPillClass, followUpPillLabel, formatDate, leadDetailsPath,
  type LeadType,
} from '../../lib/utils'

// A large page so the dropdown sees most follow-ups in one request.
// NOTE: lists are paginated server-side — if a user has more than this many
// leads, follow-ups beyond the first page won't appear in the bell. A future
// dedicated /follow-ups endpoint would remove this limit.
const FOLLOWUP_PAGE_LIMIT = 200

type FollowUpItem = {
  id: string
  name: string
  leadType: LeadType
  followUpDate: string
  bucket: 'overdue' | 'today'
}

export default function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const { canCreateLeads, can } = usePermissions()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Which lead lists this role is allowed to read — avoid firing requests that 403.
  const sources = useMemo(() => ([
    { leadType: 'lead' as LeadType, api: leadsApi, key: 'leads', nameField: 'name', enabled: can('leads:view_all') || can('leads:edit') || can('leads:create') },
    { leadType: 'influencer' as LeadType, api: influencerLeadsApi, key: 'influencer-leads', nameField: 'studentName', enabled: can('nav:influencer_leads') },
    { leadType: 'campaign1' as LeadType, api: campaign1Api, key: 'campaign-1-leads', nameField: 'studentName', enabled: can('nav:campaign_1') },
    { leadType: 'campaign2' as LeadType, api: campaign2Api, key: 'campaign-2-leads', nameField: 'studentName', enabled: can('nav:campaign_2') },
  ]), [can])

  const results = useQueries({
    queries: sources.map((s) => ({
      queryKey: ['followups', s.key],
      queryFn: () => s.api.getAll({ limit: FOLLOWUP_PAGE_LIMIT }).then((r: any) => r.data?.leads ?? []),
      enabled: s.enabled,
      refetchInterval: 60000,
      staleTime: 30000,
    })),
  })

  // Flatten all due-today / overdue follow-ups across the enabled tables.
  const items: FollowUpItem[] = useMemo(() => {
    const out: FollowUpItem[] = []
    results.forEach((res, i) => {
      const src = sources[i]
      const rows: any[] = Array.isArray(res.data) ? res.data : []
      rows.forEach((row) => {
        const bucket = followUpBucket(row.followUpDate)
        if (bucket !== 'overdue' && bucket !== 'today') return
        out.push({
          id: row.id,
          name: row[src.nameField] ?? 'Unknown',
          leadType: src.leadType,
          followUpDate: row.followUpDate,
          bucket,
        })
      })
    })
    // Overdue first, then due-today; each oldest-first.
    return out.sort((a, b) => {
      if (a.bucket !== b.bucket) return a.bucket === 'overdue' ? -1 : 1
      return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
    })
  }, [results, sources])

  const count = items.length

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const goTo = (item: FollowUpItem) => {
    setOpen(false)
    navigate(leadDetailsPath(item.leadType, item.id))
  }

  return (
    <header className="h-14 border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm
                       flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-64 h-9 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canCreateLeads && (
          <button type="button" className="btn-primary flex items-center gap-1.5 h-9">
            <Plus size={15} /> New Lead
          </button>
        )}

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            title="Follow-up reminders"
            aria-label="Follow-up reminders"
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <Bell size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                               text-[10px] font-bold text-white bg-red-500 rounded-full">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-hidden flex flex-col
                            bg-surface-800 border border-surface-700 rounded-xl shadow-card z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar size={15} className="text-brand-500" /> Follow-ups
                </h4>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {count === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500">
                    <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No follow-ups due.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <button
                      key={`${item.leadType}-${item.id}`}
                      type="button"
                      onClick={() => goTo(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-surface-700
                                 last:border-0 hover:bg-surface-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                                      flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {item.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(item.followUpDate)}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${followUpPillClass[item.bucket]}`}>
                        {followUpPillLabel[item.bucket]}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
