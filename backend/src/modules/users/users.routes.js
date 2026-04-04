import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import {
  getUsers, getUser, createUser,
  updateUser, resetPassword, deactivateUser
} from './users.controller.js'

export async function usersRoutes(app) {
  // All routes require ADMIN role
  const adminOnly = [authenticate, authorize('ADMIN')]

  app.get('/', { preHandler: adminOnly }, getUsers)
  app.get('/:id', { preHandler: adminOnly }, getUser)
  app.post('/', { preHandler: adminOnly }, createUser)
  app.put('/:id', { preHandler: adminOnly }, updateUser)
  app.post('/:id/reset-password', { preHandler: adminOnly }, resetPassword)
  app.delete('/:id', { preHandler: adminOnly }, deactivateUser)
}
