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
export const PERMISSIONS: Record<string, Role[]> = {
  // Navigation visibility
  'nav:dashboard':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:leads':           ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:pipeline':        ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:communications':  ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'nav:tasks':           ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'nav:analytics':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER'],
  'nav:settings':        ['ADMIN'],
  'nav:users':           ['ADMIN'],

  // Lead actions
  'leads:create':        ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'leads:edit':          ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'leads:delete':        ['ADMIN'],
  'leads:assign':        ['ADMIN', 'MANAGER'],
  'leads:view_all':      ['ADMIN', 'MANAGER', 'MARKETING'],

  // Pipeline actions
  'pipeline:move':       ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],

  // Task actions
  'tasks:create':        ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'tasks:delete':        ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],

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
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',      label: 'Dashboard',       permission: 'nav:dashboard' },
  { to: '/leads',           label: 'Leads',           permission: 'nav:leads' },
  { to: '/pipeline',        label: 'Pipeline',        permission: 'nav:pipeline' },
  { to: '/communications',  label: 'Communications',  permission: 'nav:communications' },
  { to: '/tasks',           label: 'Tasks',           permission: 'nav:tasks' },
  { to: '/analytics',       label: 'Analytics',       permission: 'nav:analytics' },
  { to: '/users',           label: 'Users',           permission: 'nav:users' },
  { to: '/settings',        label: 'Settings',        permission: 'nav:settings' },
]

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  return ALL_NAV_ITEMS.filter(item => hasPermission(role, item.permission))
}
