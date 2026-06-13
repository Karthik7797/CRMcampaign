import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const LIMIT = 10

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

/** A sensible default context for direct links / refreshes (unfiltered, page 1). */
function defaultContext(cfg: LeadNavigatorConfig): LeadListContext {
  return { search: '', status: 'ALL', source: cfg.hasSource ? 'ALL' : undefined, page: 1 }
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
 * The current page's list is fetched via useQuery (reusing the list page's warm
 * cache when present), so neighbors resolve even on a cold cache or direct link.
 * `hasContext` is true whenever we have an id, so the controls always render.
 */
export function useLeadNavigator(
  id: string | undefined,
  listContext: LeadListContext | undefined,
  cfg: LeadNavigatorConfig,
) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Fall back to a default (unfiltered, page 1) context when none was passed,
  // so the controls work on direct links / refreshes too.
  const ctx = listContext ?? defaultContext(cfg)

  // Fetch (or reuse cached) the current page's leads. Subscribing via useQuery
  // means a cold cache fills in and the controls light up once data arrives.
  const { data: pageData } = useQuery({
    queryKey: listQueryKey(cfg, ctx, ctx.page),
    queryFn: () => cfg.api.getAll(listQueryParams(cfg, ctx, ctx.page)).then((r) => r.data),
    enabled: !!id,
  })

  // Subscribe to adjacent pages so page-edge neighbors resolve. enabled only
  // when the current lead actually sits at an edge.
  const idx = pageData?.leads?.findIndex((l: any) => l.id === id) ?? -1
  const lastIdx = (pageData?.leads?.length ?? 0) - 1
  const totalPages: number = pageData?.totalPages ?? 1
  const needPrevPage = idx === 0 && ctx.page > 1
  const needNextPage = idx >= 0 && idx === lastIdx && ctx.page < totalPages

  const { data: prevPageData } = useQuery({
    queryKey: listQueryKey(cfg, ctx, ctx.page - 1),
    queryFn: () => cfg.api.getAll(listQueryParams(cfg, ctx, ctx.page - 1)).then((r) => r.data),
    enabled: !!id && needPrevPage,
  })
  const { data: nextPageData } = useQuery({
    queryKey: listQueryKey(cfg, ctx, ctx.page + 1),
    queryFn: () => cfg.api.getAll(listQueryParams(cfg, ctx, ctx.page + 1)).then((r) => r.data),
    enabled: !!id && needNextPage,
  })

  const resolved = useMemo(() => {
    if (!pageData?.leads) {
      return { prevId: undefined, nextId: undefined, position: undefined, total: undefined }
    }
    const leads: any[] = pageData.leads
    const total: number = pageData.total ?? leads.length
    const index = leads.findIndex((l) => l.id === id)
    if (index === -1) {
      return { prevId: undefined, nextId: undefined, position: undefined, total }
    }

    let prevId: string | undefined = index > 0 ? leads[index - 1].id : undefined
    let nextId: string | undefined = index < leads.length - 1 ? leads[index + 1].id : undefined

    // Page-edge crossing.
    if (prevId === undefined && prevPageData?.leads?.length) {
      prevId = prevPageData.leads[prevPageData.leads.length - 1].id
    }
    if (nextId === undefined && nextPageData?.leads?.length) {
      nextId = nextPageData.leads[0].id
    }

    const position = (ctx.page - 1) * LIMIT + index + 1
    return { prevId, nextId, position, total }
  }, [pageData, prevPageData, nextPageData, id, ctx.page])

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
    navigate(`${cfg.routeBase}/${targetId}`, { state: { listContext: ctx }, replace: true })
  }

  return {
    prevId: resolved.prevId,
    nextId: resolved.nextId,
    goPrev: () => goTo(resolved.prevId),
    goNext: () => goTo(resolved.nextId),
    position: resolved.position,
    total: resolved.total,
    // Controls always render when we have a lead id; they simply disable at edges.
    hasContext: !!id,
  }
}
