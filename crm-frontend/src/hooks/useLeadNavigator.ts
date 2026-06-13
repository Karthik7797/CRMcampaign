import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'

const LIMIT = 20

export interface LeadListContext {
  search: string
  status: string
  source: string
  page: number
}

/**
 * Builds the same React Query inputs the Leads list uses, so neighbor lookups
 * hit the warm cache instead of issuing redundant fetches.
 * Mirror of Leads.tsx getAll() param/key mapping.
 */
function buildListQuery(ctx: LeadListContext, page: number) {
  const key = ['leads', { search: ctx.search, status: ctx.status, source: ctx.source, page }] as const
  const params = {
    search: ctx.search || undefined,
    status: ctx.status === 'ALL' ? undefined : ctx.status,
    source: ctx.source === 'ALL' ? undefined : ctx.source,
    page,
    limit: LIMIT,
  }
  return {
    queryKey: key,
    queryFn: () => leadsApi.getAll(params).then((r) => r.data),
  }
}

/**
 * Lead-to-lead navigation for the detail page. Given the current lead id and the
 * browsing context passed from the list (filters + page), it resolves the previous
 * and next lead — crossing page boundaries seamlessly — and exposes navigation
 * handlers that carry the context forward.
 *
 * Returns hasContext=false when no list context is available (direct link / refresh),
 * in which case the caller should hide the controls.
 */
export function useLeadNavigator(id: string | undefined, listContext?: LeadListContext) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const hasContext = !!listContext && !!id

  // Current page's leads from cache (populated by the list page). We read rather
  // than subscribe — the data is effectively static for the duration of browsing.
  const pageData = hasContext
    ? qc.getQueryData<any>(['leads', {
        search: listContext!.search,
        status: listContext!.status,
        source: listContext!.source,
        page: listContext!.page,
      }])
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
      const prevPage = qc.getQueryData<any>(['leads', {
        search: listContext!.search, status: listContext!.status, source: listContext!.source, page: page - 1,
      }])
      const prevLeads: any[] | undefined = prevPage?.leads
      if (prevLeads?.length) prevId = prevLeads[prevLeads.length - 1].id
    }
    if (nextId === undefined && page < totalPages) {
      const nextPage = qc.getQueryData<any>(['leads', {
        search: listContext!.search, status: listContext!.status, source: listContext!.source, page: page + 1,
      }])
      const nextLeads: any[] | undefined = nextPage?.leads
      if (nextLeads?.length) nextId = nextLeads[0].id
    }

    const position = (page - 1) * LIMIT + index + 1
    return { prevId, nextId, position, total }
  }, [hasContext, pageData, id, listContext, qc])

  // Best-effort prefetch of adjacent pages so that crossing a page boundary resolves
  // an id instantly and the next detail view loads without a spinner.
  useEffect(() => {
    if (!hasContext || !pageData?.leads) return
    const { page } = listContext!
    const totalPages: number = pageData.totalPages ?? 1
    const index = pageData.leads.findIndex((l: any) => l.id === id)
    if (index <= 0 && page > 1) {
      qc.prefetchQuery(buildListQuery(listContext!, page - 1))
    }
    if (index >= pageData.leads.length - 1 && page < totalPages) {
      qc.prefetchQuery(buildListQuery(listContext!, page + 1))
    }
  }, [hasContext, pageData, id, listContext, qc])

  // Prefetch the resolved neighbors' detail data so navigation is instant.
  useEffect(() => {
    const prefetchLead = (leadId?: string) => {
      if (!leadId) return
      qc.prefetchQuery({
        queryKey: ['lead', leadId],
        queryFn: () => leadsApi.getOne(leadId).then((r) => r.data),
      })
    }
    prefetchLead(resolved.prevId)
    prefetchLead(resolved.nextId)
  }, [resolved.prevId, resolved.nextId, qc])

  const goTo = (targetId?: string) => {
    if (!targetId) return
    navigate(`/leads/${targetId}`, { state: { listContext }, replace: true })
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
