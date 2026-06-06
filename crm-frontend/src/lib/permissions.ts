/**
 * Frontend RBAC — Permission definitions and utilities
 * Mirrors backend rbac.config.js for consistent access control
 */

export type Role = 'ADMIN' | 'MANAGER' | 'MARKETING' | 'INFLUENCER' | 'COUNSELLOR'

// ── Role display names ──────────────────────────────────────────────

export const ROLE_DISPLAY: Record<Role, string> = {
  ADMIN: 'Super Admin',
  MANAGER: 'Admin',
  MARKETING: 'Marketing',
  INFLUENCER: 'Influencer',
  COUNSELLOR: 'Counsellor',
}

export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  ADMIN: {
    bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  MANAGER: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  MARKETING: {
    bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  INFLUENCER: {
    bg: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  COUNSELLOR: {
    bg: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
}

export const PERMISSIONS: Record<string, Role[]> = {
  // Navigation visibility
  'nav:dashboard':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:leads':           ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'],
  'nav:pipeline':        ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'],
  'nav:communications':  ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'],
  'nav:tasks':           ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'nav:analytics':       ['ADMIN', 'MANAGER', 'MARKETING'],
  'nav:settings':        ['ADMIN'],
  'nav:users':           ['ADMIN'],
  'nav:influencer_leads': ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  // Influencer Marketing parent + campaign sub-pages (1–12)
  'nav:influencer_marketing': ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_1':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_2':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_3':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_4':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_5':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_6':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_7':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_8':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_9':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_10': ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_11': ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:campaign_12': ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],

  // Lead actions
  'leads:create':        ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'leads:edit':          ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'leads:delete':        ['ADMIN'],
  'leads:assign':        ['ADMIN', 'MANAGER'],
  'leads:view_all':      ['ADMIN', 'MANAGER', 'MARKETING'],
  'leads:view_influencer': ['INFLUENCER'],  // Special view-only for influencers

  // Influencer Lead actions
  'influencer_leads:view':     ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'influencer_leads:create':   ['ADMIN', 'MANAGER'],
  'influencer_leads:edit':   ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'influencer_leads:delete':  ['ADMIN'],
  'influencer_leads:assign': ['ADMIN', 'MANAGER'],
  'influencer_leads:move_stage': ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Campaign 1 actions (mirror influencer_leads)
  'campaign_1:view':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'campaign_1:create':     ['ADMIN', 'MANAGER'],
  'campaign_1:edit':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'campaign_1:delete':     ['ADMIN'],
  'campaign_1:assign':     ['ADMIN', 'MANAGER'],
  'campaign_1:move_stage': ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Campaign 2 actions (mirror influencer_leads)
  'campaign_2:view':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'campaign_2:create':     ['ADMIN', 'MANAGER'],
  'campaign_2:edit':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'campaign_2:delete':     ['ADMIN'],
  'campaign_2:assign':     ['ADMIN', 'MANAGER'],
  'campaign_2:move_stage': ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Pipeline actions
  'pipeline:move':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Task actions
  'tasks:create':        ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'tasks:delete':        ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Communication actions
  'comms:create':        ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'comms:delete':        ['ADMIN', 'MANAGER'],

  // Settings & user management
  'settings:view':       ['ADMIN'],
  'users:manage':        ['ADMIN'],
}

// ── Utility functions ───────────────────────────────────────────────

export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) return false
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role as Role)
}

export function roleDisplayName(role: string | undefined): string {
  if (!role) return 'Unknown'
  return ROLE_DISPLAY[role as Role] || role
}

export function getRoleColor(role: string | undefined) {
  if (!role) return ROLE_COLORS.COUNSELLOR
  return ROLE_COLORS[role as Role] || ROLE_COLORS.COUNSELLOR
}

// ── Navigation items filtered by role ───────────────────────────────

export interface NavItem {
  to: string
  label: string
  permission: string
  /** Optional nested items — renders as a collapsible submenu */
  children?: NavItem[]
  /** Marks a not-yet-built campaign page (renders a "Coming soon" page) */
  comingSoon?: boolean
}

// Influencer Marketing → Campaign 1–12 submenu.
// Campaigns 1 & 2 are live; 3–12 route to a shared "Coming soon" page.
const CAMPAIGN_CHILDREN: NavItem[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  return {
    to: `/campaigns/${n}`,
    label: `Campaign ${n}`,
    permission: `nav:campaign_${n}`,
    comingSoon: n > 2,
  }
})

export const ALL_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',      label: 'Dashboard',       permission: 'nav:dashboard' },
  { to: '/leads',           label: 'Leads',           permission: 'nav:leads' },
  { to: '/influencer-leads', label: 'Influencer Leads', permission: 'nav:influencer_leads' },
  {
    to: '/influencer-marketing',
    label: 'Influencer Marketing',
    permission: 'nav:influencer_marketing',
    children: CAMPAIGN_CHILDREN,
  },
  { to: '/pipeline',        label: 'Pipeline',        permission: 'nav:pipeline' },
  { to: '/communications',  label: 'Communications',  permission: 'nav:communications' },
  { to: '/tasks',           label: 'Tasks',           permission: 'nav:tasks' },
  { to: '/analytics',       label: 'Analytics',       permission: 'nav:analytics' },
  { to: '/user-progression', label: 'User Progression', permission: 'nav:analytics' },
  { to: '/users',           label: 'Users',           permission: 'nav:users' },
  { to: '/settings',        label: 'Settings',        permission: 'nav:settings' },
]

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  return ALL_NAV_ITEMS
    .filter(item => hasPermission(role, item.permission))
    .map(item => item.children
      ? { ...item, children: item.children.filter(c => hasPermission(role, c.permission)) }
      : item
    )
}
