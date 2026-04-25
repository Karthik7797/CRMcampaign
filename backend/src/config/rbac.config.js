/**
 * Role-Based Access Control (RBAC) Configuration
 * 
 * Role Hierarchy (highest → lowest):
 *   ADMIN (Super Admin) → MANAGER (Admin) → MARKETING → COUNSELLOR
 */

// Role hierarchy level (higher number = more privileges)
export const ROLE_LEVEL = {
  ADMIN: 100,      // Super Admin — full access
  MANAGER: 75,     // Admin — team management
  MARKETING: 50,   // Marketing — campaign analytics, read-only leads
  INFLUENCER: 40,  // Influencer — view own leads and campaign data
  COUNSELLOR: 25,  // Counsellor — own leads and tasks only
}

// Display-friendly names for each role
export const ROLE_DISPLAY = {
  ADMIN: 'Super Admin',
  MANAGER: 'Admin',
  MARKETING: 'Marketing',
  INFLUENCER: 'Influencer',
  COUNSELLOR: 'Counsellor',
}

// Granular permission definitions
export const PERMISSIONS = {
  // Leads
  'leads:view_all':     ['ADMIN', 'MANAGER', 'MARKETING'],
  'leads:view_own':     ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'],
  'leads:view_influencer': ['INFLUENCER'],  // Special view-only for influencers
  'leads:create':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'leads:edit_all':     ['ADMIN', 'MANAGER'],
  'leads:edit_own':     ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'leads:delete':       ['ADMIN'],
  'leads:assign':       ['ADMIN', 'MANAGER'],

  // Influencer Leads
  'influencer_leads:view':     ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'influencer_leads:create':   ['ADMIN', 'MANAGER'],
  'influencer_leads:edit':     ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'influencer_leads:delete':   ['ADMIN'],
  'influencer_leads:assign':  ['ADMIN', 'MANAGER'],
  'influencer_leads:move_stage': ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Pipeline
  'pipeline:view':      ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'],
  'pipeline:move':      ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Tasks
  'tasks:view_all':     ['ADMIN', 'MANAGER'],
  'tasks:view_own':     ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'tasks:create':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'tasks:edit':         ['ADMIN', 'MANAGER', 'COUNSELLOR'],
  'tasks:delete':       ['ADMIN', 'MANAGER', 'COUNSELLOR'],

  // Communications
  'comms:view_all':     ['ADMIN', 'MANAGER', 'MARKETING'],
  'comms:view_own':     ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'comms:create':       ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'comms:delete':       ['ADMIN', 'MANAGER'],

  // Analytics
  'analytics:view':     ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER'],

  // Settings
  'settings:view':      ['ADMIN'],
  'settings:edit':      ['ADMIN'],

  // User Management
  'users:view':         ['ADMIN'],
  'users:create':       ['ADMIN'],
  'users:edit':         ['ADMIN'],
  'users:delete':       ['ADMIN'],
  'users:change_role':  ['ADMIN'],
}

/**
 * Check if a role has a specific permission
 */
export function canAccess(role, permission) {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

/**
 * Check if a role meets the minimum hierarchy level
 */
export function meetsMinLevel(role, minRole) {
  return (ROLE_LEVEL[role] || 0) >= (ROLE_LEVEL[minRole] || 0)
}
