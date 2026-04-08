import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import formbody from '@fastify/formbody'
import { authRoutes } from './modules/auth/auth.routes.js'
import { leadsRoutes } from './modules/leads/leads.routes.js'
import { pipelineRoutes } from './modules/pipeline/pipeline.routes.js'
import { analyticsRoutes } from './modules/analytics/analytics.routes.js'
import { tasksRoutes } from './modules/tasks/tasks.routes.js'
import { commsRoutes } from './modules/communications/comms.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, {
  origin: [
    'https://cr-mcampaign-3irx.vercel.app',
    'http://localhost:5173',
    'http://localhost:4000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await app.register(formbody) // Allows standard <form method="POST"> parsing

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret',
})

// Health check
app.get('/health', async (req, reply) => {
  try {
    await db.$queryRaw`SELECT 1`
    req.log.info('Database connection successful')
    return { status: 'ok', timestamp: new Date(), database: 'connected' }
  } catch (error) {
    req.log.error('Database connection failed:', error)
    return reply.status(500).send({ 
      status: 'error', 
      timestamp: new Date(), 
      database: 'disconnected', 
      error: error.message 
    })
  }
})

// Routes
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(leadsRoutes, { prefix: '/api/leads' })
await app.register(pipelineRoutes, { prefix: '/api/pipeline' })
await app.register(analyticsRoutes, { prefix: '/api/analytics' })
await app.register(tasksRoutes, { prefix: '/api/tasks' })
await app.register(commsRoutes, { prefix: '/api/communications' })
await app.register(usersRoutes, { prefix: '/api/users' })

const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 4000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on port ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
