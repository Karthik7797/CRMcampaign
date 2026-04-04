import { login, register, me } from './auth.controller.js'
import { authenticate, authorize } from '../../middleware/auth.middleware.js'

export async function authRoutes(app) {
  app.post('/login', login)

  // Registration is ADMIN-only (create users via User Management)
  app.post('/register', { preHandler: [authenticate, authorize('ADMIN')] }, register)

  app.get('/me', { preHandler: [authenticate] }, me)
}
