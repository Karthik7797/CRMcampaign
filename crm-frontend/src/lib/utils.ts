import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

// ── Follow-up date helpers ──────────────────────────────────────────
export type FollowUpBucket = 'overdue' | 'today' | 'upcoming' | 'none'

// Classify a follow-up date relative to the start of today (local time).
export function followUpBucket(date?: string | Date | null): FollowUpBucket {
  if (!date) return 'none'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'none'
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startTomorrow = new Date(startToday)
  startTomorrow.setDate(startTomorrow.getDate() + 1)
  if (d < startToday) return 'overdue'
  if (d < startTomorrow) return 'today'
  return 'upcoming'
}

// Tailwind classes for a follow-up status pill, keyed by bucket.
export const followUpPillClass: Record<Exclude<FollowUpBucket, 'none'>, string> = {
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  today: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  upcoming: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

export const followUpPillLabel: Record<Exclude<FollowUpBucket, 'none'>, string> = {
  overdue: 'Overdue',
  today: 'Due Today',
  upcoming: 'Upcoming',
}

// A lead can live in one of four tables; build its details route from the type.
export type LeadType = 'lead' | 'influencer' | 'campaign1' | 'campaign2'

export function leadDetailsPath(leadType: LeadType, id: string) {
  const base: Record<LeadType, string> = {
    lead: '/leads',
    influencer: '/influencer-leads',
    campaign1: '/campaigns/1',
    campaign2: '/campaigns/2',
  }
  return `${base[leadType]}/${id}`
}
