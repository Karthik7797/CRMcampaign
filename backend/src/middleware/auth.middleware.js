import { canAccess } from '../config/rbac.config.js'

/**
 * JWT authentication middleware.
 * Verifies the token and attaches user payload to request.
 */
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized — invalid or missing token' })
  }
}

/**
 * Role-based authorization middleware factory.
 * Pass allowed roles as arguments.
 * Must be used AFTER `authenticate`.
 *
 * Usage in routes:
 *   { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }
 */
export function authorize(...allowedRoles) {
  return async function (request, reply) {
    const userRole = request.user?.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        error: 'Forbidden — you do not have permission to perform this action',
        requiredRoles: allowedRoles,
        yourRole: userRole,
      })
    }
  }
}

/**
 * Permission-based authorization middleware factory.
 * Check against granular permission keys defined in rbac.config.js
 *
 * Usage in routes:
 *   { preHandler: [authenticate, requirePermission('leads:delete')] }
 */
export function requirePermission(permission) {
  return async function (request, reply) {
    const userRole = request.user?.role
    if (!userRole || !canAccess(userRole, permission)) {
      return reply.status(403).send({
        error: 'Forbidden — insufficient permissions',
        requiredPermission: permission,
        yourRole: userRole,
      })
    }
  }
}
