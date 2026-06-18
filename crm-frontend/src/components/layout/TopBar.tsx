import { Menu, Bell, Search, Plus, Calendar, X, UserPlus, Sun, Moon, Monitor } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTheme } from '../../hooks/useTheme'
import { usePermissions } from '../../hooks/usePermissions'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { leadsApi, influencerLeadsApi, campaign1Api, campaign2Api } from '../../api/client'
import {
  followUpBucket, followUpPillClass, followUpPillLabel, formatDate, formatRelativeTime,
  leadDetailsPath, type LeadType,
} from '../../lib/utils'

// A large page so the dropdown sees most follow-ups in one request.
// NOTE: lists are paginated server-side — if a user has more than this many
// leads, follow-ups beyond the first page won't appear in the bell. A future
// dedicated /follow-ups endpoint would remove this limit.
const FOLLOWUP_PAGE_LIMIT = 200

// New-lead detection is purely client-side: we remember the newest lead
// createdAt we've shown per table in localStorage, and treat anything newer
// as "new". This covers both Google-Form leads and ones added manually in the
// CRM, since both land in the same tables this bell already polls.
const SEEN_STORAGE_KEY = 'crm_new_leads_seen'

type FollowUpItem = {
  id: string
  name: string
  leadType: LeadType
  followUpDate: string
  bucket: 'overdue' | 'today'
}

type NewLeadItem = {
  id: string
  name: string
  leadType: LeadType
  createdAt: string
}

// Human label for each lead table, shown on new-lead rows.
const leadTypeLabel: Record<LeadType, string> = {
  lead: 'Lead',
  influencer: 'Influencer',
  campaign1: 'Campaign 1',
  campaign2: 'Campaign 2',
}

// localStorage helpers: map of leadType -> ISO timestamp of newest seen lead.
function readSeen(): Partial<Record<LeadType, string>> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
function writeSeen(seen: Partial<Record<LeadType, string>>) {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(seen))
  } catch {
    /* ignore quota / disabled storage */
  }
}

export default function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const { theme, setTheme } = useTheme()
  const { canCreateLeads, can } = usePermissions()

  // Cycle Light -> Dark -> System on click.
  const cycleTheme = () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const themeLabel = theme === 'light' ? 'Light theme' : theme === 'dark' ? 'Dark theme' : 'System theme'
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'newleads' | 'followups'>('newleads')
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Per-table "newest createdAt already seen by this user". Initialised from
  // localStorage so a page reload doesn't re-flag leads as new.
  const [seen, setSeen] = useState<Partial<Record<LeadType, string>>>(() => readSeen())
  // Tracks whether we've completed the first fetch, so leads that already
  // existed before the user opened the app aren't announced as "new".
  const baselined = useRef<Partial<Record<LeadType, boolean>>>({})
  // Per-table "newest createdAt already announced via toast". Separate from
  // `seen` (which the bell badge uses) so a toast fires exactly ONCE per new
  // lead, even though the unread lead keeps showing in the bell until read.
  const toasted = useRef<Partial<Record<LeadType, string>>>({})

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

  // New leads: any row whose createdAt is after the per-table "seen" mark.
  const newLeads: NewLeadItem[] = useMemo(() => {
    const out: NewLeadItem[] = []
    results.forEach((res, i) => {
      const src = sources[i]
      const rows: any[] = Array.isArray(res.data) ? res.data : []
      const mark = seen[src.leadType]
      rows.forEach((row) => {
        if (!row.createdAt) return
        if (mark && new Date(row.createdAt).getTime() <= new Date(mark).getTime()) return
        out.push({
          id: row.id,
          name: row[src.nameField] ?? 'Unknown',
          leadType: src.leadType,
          createdAt: row.createdAt,
        })
      })
    })
    // Newest first.
    return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [results, sources, seen])

  // On the first successful fetch of each table, set the "seen" mark to its
  // newest lead so pre-existing leads aren't announced. After that, newly
  // arrived leads (Google Form or manual) surface as new and pop a toast.
  useEffect(() => {
    results.forEach((res, i) => {
      const src = sources[i]
      if (!res.isSuccess) return
      const rows: any[] = Array.isArray(res.data) ? res.data : []
      const newest = rows.reduce<string | null>((max, r) => {
        if (!r.createdAt) return max
        return !max || new Date(r.createdAt).getTime() > new Date(max).getTime() ? r.createdAt : max
      }, null)

      if (!baselined.current[src.leadType]) {
        // First load for this table: baseline silently. Seed BOTH marks to the
        // newest existing lead so nothing already in the table gets announced.
        baselined.current[src.leadType] = true
        toasted.current[src.leadType] = newest ?? undefined
        if (newest && !readSeen()[src.leadType]) {
          setSeen((prev) => {
            const next = { ...prev, [src.leadType]: newest }
            writeSeen(next)
            return next
          })
        }
        return
      }

      // Subsequent polls: toast leads newer than the last ANNOUNCED mark, then
      // advance the mark so each lead is announced exactly once (the bell badge
      // still shows it as unread, driven by `seen`, until the user reads it).
      const announcedMark = toasted.current[src.leadType]
      const fresh = rows.filter(
        (r) => r.createdAt && (!announcedMark || new Date(r.createdAt).getTime() > new Date(announcedMark).getTime())
      )
      if (fresh.length > 0) {
        toasted.current[src.leadType] = newest ?? announcedMark
        const label = fresh.length === 1
          ? `New lead: ${fresh[0][src.nameField] ?? 'Unknown'}`
          : `${fresh.length} new ${leadTypeLabel[src.leadType]} leads`
        toast.success(label, { icon: '🎉' })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map((r) => r.dataUpdatedAt).join(',')])

  const followUpCount = items.length
  const newLeadCount = newLeads.length
  const totalCount = followUpCount + newLeadCount

  // Default the open dropdown to whichever tab actually has items.
  useEffect(() => {
    if (!open) return
    if (newLeadCount === 0 && followUpCount > 0) setTab('followups')
    else if (newLeadCount > 0) setTab('newleads')
  }, [open, newLeadCount, followUpCount])

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const goToFollowUp = (item: FollowUpItem) => {
    setOpen(false)
    navigate(leadDetailsPath(item.leadType, item.id))
  }

  const goToNewLead = (item: NewLeadItem) => {
    setOpen(false)
    navigate(leadDetailsPath(item.leadType, item.id))
  }

  // Mark every currently-shown new lead as seen (per table = its newest createdAt).
  const markNewLeadsSeen = () => {
    if (newLeads.length === 0) return
    setSeen((prev) => {
      const next = { ...prev }
      newLeads.forEach((l) => {
        const cur = next[l.leadType]
        if (!cur || new Date(l.createdAt).getTime() > new Date(cur).getTime()) {
          next[l.leadType] = l.createdAt
        }
      })
      writeSeen(next)
      return next
    })
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
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors"
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
        <button
          type="button"
          onClick={cycleTheme}
          title={`${themeLabel} — click to switch`}
          aria-label={`${themeLabel}, click to switch theme`}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors"
        >
          <ThemeIcon size={18} />
        </button>

        {canCreateLeads && (
          <button type="button" className="btn-primary flex items-center gap-1.5 h-9">
            <Plus size={15} /> New Lead
          </button>
        )}

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            title="Notifications"
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors"
          >
            <Bell size={18} />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                               text-[10px] font-bold text-white bg-red-500 rounded-full">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-hidden flex flex-col
                            bg-surface-800 border border-surface-700 rounded-xl shadow-card z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
                <h4 className="text-sm font-semibold text-slate-100">Notifications</h4>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-surface-700">
                <button
                  type="button"
                  onClick={() => setTab('newleads')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors
                    ${tab === 'newleads'
                      ? 'text-brand-400 border-b-2 border-brand-500'
                      : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <UserPlus size={14} /> New Leads
                  {newLeadCount > 0 && (
                    <span className="ml-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                                     text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {newLeadCount > 9 ? '9+' : newLeadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('followups')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors
                    ${tab === 'followups'
                      ? 'text-brand-400 border-b-2 border-brand-500'
                      : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Calendar size={14} /> Follow-ups
                  {followUpCount > 0 && (
                    <span className="ml-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                                     text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {followUpCount > 9 ? '9+' : followUpCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {tab === 'newleads' ? (
                  newLeadCount === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <UserPlus size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No new leads.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700">
                        <span className="text-xs text-slate-500">
                          {newLeadCount} new lead{newLeadCount > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={markNewLeadsSeen}
                          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      </div>
                      {newLeads.map((item) => (
                        <button
                          key={`${item.leadType}-${item.id}`}
                          type="button"
                          onClick={() => goToNewLead(item)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-surface-700
                                     last:border-0 hover:bg-surface-700/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-brand-600
                                          flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {item.name[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">{formatRelativeTime(item.createdAt)}</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border flex-shrink-0
                                           bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {leadTypeLabel[item.leadType]}
                          </span>
                        </button>
                      ))}
                    </>
                  )
                ) : (
                  followUpCount === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No follow-ups due.</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <button
                        key={`${item.leadType}-${item.id}`}
                        type="button"
                        onClick={() => goToFollowUp(item)}
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
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
