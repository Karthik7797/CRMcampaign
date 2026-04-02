import { login, register, me } from './auth.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'

export async function authRoutes(app) {
  app.post('/login', login)
  app.post('/register', register)
  app.get('/me', { preHandler: [authenticate] }, me)
}
