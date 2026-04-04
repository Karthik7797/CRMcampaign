import { useStore } from '../store/useStore'
import {
  hasPermission,
  roleDisplayName,
  getRoleColor,
  getNavItemsForRole,
  type Role
} from '../lib/permissions'

/**
 * React hook exposing permission checks based on the current user's role.
 * Use this in components to conditionally render UI elements.
 *
 * Usage:
 *   const { canDeleteLeads, canManageUsers, roleName } = usePermissions()
 */
export function usePermissions() {
  const user = useStore((s) => s.user)
  const role = user?.role as Role | undefined

  const can = (permission: string) => hasPermission(role, permission)

  return {
    // The raw role
    role,
    roleName: roleDisplayName(role),
    roleColor: getRoleColor(role),
    navItems: getNavItemsForRole(role),

    // Generic permission check
    can,

    // Leads
    canCreateLeads: can('leads:create'),
    canEditLeads: can('leads:edit'),
    canDeleteLeads: can('leads:delete'),
    canAssignLeads: can('leads:assign'),
    canViewAllLeads: can('leads:view_all'),

    // Pipeline
    canMovePipeline: can('pipeline:move'),

    // Tasks
    canCreateTasks: can('tasks:create'),
    canDeleteTasks: can('tasks:delete'),

    // Communications
    canCreateComms: can('comms:create'),
    canDeleteComms: can('comms:delete'),

    // Settings & Users
    canViewSettings: can('settings:view'),
    canManageUsers: can('users:manage'),

    // Navigation-level checks
    canViewAnalytics: can('nav:analytics'),
    canViewTasks: can('nav:tasks'),
  }
}
