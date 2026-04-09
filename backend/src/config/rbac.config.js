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
  'leads:view_own':     ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'leads:create':       ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'leads:edit_all':     ['ADMIN', 'MANAGER'],
  'leads:edit_own':     ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'leads:delete':       ['ADMIN'],
  'leads:assign':       ['ADMIN', 'MANAGER'],

  // Pipeline
  'pipeline:view':      ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER', 'COUNSELLOR'],
  'pipeline:move':      ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],

  // Tasks
  'tasks:view_all':     ['ADMIN', 'MANAGER'],
  'tasks:view_own':     ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'tasks:create':       ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'tasks:edit':         ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],
  'tasks:delete':       ['ADMIN', 'MANAGER', 'INFLUENCER', 'COUNSELLOR'],

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
