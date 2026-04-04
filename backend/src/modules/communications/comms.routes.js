import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function commsRoutes(app) {
  // Get communications for a specific lead
  app.get('/lead/:leadId', { preHandler: [authenticate] }, async (req, reply) => {
    // COUNSELLOR: verify they own this lead
    if (req.user.role === 'COUNSELLOR') {
      const lead = await db.lead.findUnique({ where: { id: req.params.leadId } })
      if (!lead || lead.assignedToId !== req.user.id) {
        return reply.status(403).send({ error: 'You can only view communications for your assigned leads' })
      }
    }

    const comms = await db.communication.findMany({
      where: { leadId: req.params.leadId },
      orderBy: { createdAt: 'desc' },
    })
    return comms
  })

  // Get all communications
  app.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { type, page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (type) where.type = type

    // COUNSELLOR: only their assigned leads' communications
    if (req.user.role === 'COUNSELLOR') {
      const ownLeadIds = await db.lead.findMany({
        where: { assignedToId: req.user.id },
        select: { id: true },
      })
      where.leadId = { in: ownLeadIds.map(l => l.id) }
    }

    const [comms, total] = await Promise.all([
      db.communication.findMany({
        where, skip, take: parseInt(limit),
        include: {
          lead: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.communication.count({ where }),
    ])

    return { communications: comms, total }
  })

  // Create communication — all roles
  app.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { type, subject, content, leadId } = req.body

    // COUNSELLOR: can only communicate with their assigned leads
    if (req.user.role === 'COUNSELLOR') {
      const lead = await db.lead.findUnique({ where: { id: leadId } })
      if (!lead || lead.assignedToId !== req.user.id) {
        return reply.status(403).send({ error: 'You can only communicate with your assigned leads' })
      }
    }

    const comm = await db.communication.create({
      data: {
        type,
        subject: subject || null,
        content,
        leadId,
      },
      include: {
        lead: { select: { id: true, name: true } },
      }
    })

    // Also log as activity
    await db.activity.create({
      data: {
        type: type,
        content: `${type}: ${subject || content.substring(0, 100)}`,
        leadId,
        userId: req.user.id,
      }
    })

    return reply.status(201).send(comm)
  })

  // Delete communication — ADMIN and MANAGER only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, async (req, reply) => {
    await db.communication.delete({ where: { id: req.params.id } })
    return { success: true }
  })
}
