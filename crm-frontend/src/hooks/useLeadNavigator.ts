import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const LIMIT = 20

/**
 * Browsing context passed from a list page via router state. Holds the active
 * filters + page so the detail page can locate the current lead's neighbors.
 * `source` is optional — only the regular Leads list filters by it.
 */
export interface LeadListContext {
  search: string
  status: string
  source?: string
  page: number
}

/**
 * Per-feature configuration. Each list/detail pair (regular leads, influencer
 * leads, campaign 1/2) shares the same API shape but differs in the query-key
 * prefixes, the route base, and whether it has a `source` filter.
 */
export interface LeadNavigatorConfig {
  /** API object exposing getAll(params) and getOne(id), both axios-returning. */
  api: {
    getAll: (params?: Record<string, any>) => Promise<{ data: any }>
    getOne: (id: string) => Promise<{ data: any }>
  }
  /** React Query key prefix for the paginated list (e.g. 'influencer-leads'). */
  listKey: string
  /** React Query key prefix for a single lead (e.g. 'influencer-lead'). */
  detailKey: string
  /** Route base for the detail page (e.g. '/influencer-leads', '/campaigns/1'). */
  routeBase: string
  /** Whether this list filters by `source` (only regular leads does). */
  hasSource?: boolean
}

/** Build the exact query key the list page used, so the cache is shared. */
function listQueryKey(cfg: LeadNavigatorConfig, ctx: LeadListContext, page: number) {
  const filters: Record<string, any> = { search: ctx.search, status: ctx.status, page }
  if (cfg.hasSource) filters.source = ctx.source
  return [cfg.listKey, filters] as const
}

/** Build the getAll params the list page used (mirror of each list's queryFn). */
function listQueryParams(cfg: LeadNavigatorConfig, ctx: LeadListContext, page: number) {
  const params: Record<string, any> = {
    search: ctx.search || undefined,
    status: ctx.status === 'ALL' ? undefined : ctx.status,
    page,
    limit: LIMIT,
  }
  if (cfg.hasSource) params.source = ctx.source === 'ALL' ? undefined : ctx.source
  return params
}

/**
 * Lead-to-lead navigation for a detail page. Given the current lead id, the
 * browsing context passed from the list (filters + page), and a per-feature
 * config, it resolves the previous/next lead — crossing page boundaries
 * seamlessly — and exposes navigation handlers that carry the context forward.
 *
 * Returns hasContext=false when no list context is available (direct link /
 * refresh), in which case the caller should hide the controls.
 */
export function useLeadNavigator(
  id: string | undefined,
  listContext: LeadListContext | undefined,
  cfg: LeadNavigatorConfig,
) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const hasContext = !!listContext && !!id

  // Current page's leads from cache (populated by the list page). We read rather
  // than subscribe — the data is effectively static for the duration of browsing.
  const pageData = hasContext
    ? qc.getQueryData<any>(listQueryKey(cfg, listContext!, listContext!.page))
    : undefined

  const resolved = useMemo(() => {
    if (!hasContext || !pageData?.leads) {
      return { prevId: undefined, nextId: undefined, position: undefined, total: undefined }
    }
    const { page } = listContext!
    const totalPages: number = pageData.totalPages ?? 1
    const total: number = pageData.total ?? pageData.leads.length
    const leads: any[] = pageData.leads
    const index = leads.findIndex((l) => l.id === id)

    if (index === -1) {
      return { prevId: undefined, nextId: undefined, position: undefined, total }
    }

    // Within-page neighbors.
    let prevId: string | undefined = index > 0 ? leads[index - 1].id : undefined
    let nextId: string | undefined = index < leads.length - 1 ? leads[index + 1].id : undefined

    // Page-edge crossing: look into the adjacent page's cached data if present.
    if (prevId === undefined && page > 1) {
      const prevPage = qc.getQueryData<any>(listQueryKey(cfg, listContext!, page - 1))
      const prevLeads: any[] | undefined = prevPage?.leads
      if (prevLeads?.length) prevId = prevLeads[prevLeads.length - 1].id
    }
    if (nextId === undefined && page < totalPages) {
      const nextPage = qc.getQueryData<any>(listQueryKey(cfg, listContext!, page + 1))
      const nextLeads: any[] | undefined = nextPage?.leads
      if (nextLeads?.length) nextId = nextLeads[0].id
    }

    const position = (page - 1) * LIMIT + index + 1
    return { prevId, nextId, position, total }
  }, [hasContext, pageData, id, listContext, qc, cfg])

  // Best-effort prefetch of adjacent pages so that crossing a page boundary resolves
  // an id instantly and the next detail view loads without a spinner.
  useEffect(() => {
    if (!hasContext || !pageData?.leads) return
    const { page } = listContext!
    const totalPages: number = pageData.totalPages ?? 1
    const index = pageData.leads.findIndex((l: any) => l.id === id)
    if (index <= 0 && page > 1) {
      qc.prefetchQuery({
        queryKey: listQueryKey(cfg, listContext!, page - 1),
        queryFn: () => cfg.api.getAll(listQueryParams(cfg, listContext!, page - 1)).then((r) => r.data),
      })
    }
    if (index >= pageData.leads.length - 1 && page < totalPages) {
      qc.prefetchQuery({
        queryKey: listQueryKey(cfg, listContext!, page + 1),
        queryFn: () => cfg.api.getAll(listQueryParams(cfg, listContext!, page + 1)).then((r) => r.data),
      })
    }
  }, [hasContext, pageData, id, listContext, qc, cfg])

  // Prefetch the resolved neighbors' detail data so navigation is instant.
  useEffect(() => {
    const prefetchLead = (leadId?: string) => {
      if (!leadId) return
      qc.prefetchQuery({
        queryKey: [cfg.detailKey, leadId],
        queryFn: () => cfg.api.getOne(leadId).then((r) => r.data),
      })
    }
    prefetchLead(resolved.prevId)
    prefetchLead(resolved.nextId)
  }, [resolved.prevId, resolved.nextId, qc, cfg])

  const goTo = (targetId?: string) => {
    if (!targetId) return
    navigate(`${cfg.routeBase}/${targetId}`, { state: { listContext }, replace: true })
  }

  return {
    prevId: resolved.prevId,
    nextId: resolved.nextId,
    goPrev: () => goTo(resolved.prevId),
    goNext: () => goTo(resolved.nextId),
    position: resolved.position,
    total: resolved.total,
    hasContext,
  }
}
