import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function pipelineRoutes(app) {
  // Get pipeline overview — all roles can view
  app.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const where = {}

    // COUNSELLOR only sees own assigned leads in pipeline
    if (req.user.role === 'COUNSELLOR') {
      where.assignedToId = req.user.id
    }

    const leads = await db.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const stages = [
      'ENQUIRY', 'CONTACTED', 'APPLICATION_SENT', 'APPLICATION_RECEIVED',
      'UNDER_REVIEW', 'SHORTLISTED', 'ENROLLED', 'DROPPED'
    ]

    const pipeline = stages.map(stage => ({
      stage,
      leads: leads.filter(l => l.pipelineStage === stage),
      count: leads.filter(l => l.pipelineStage === stage).length,
    }))

    return { pipeline, totalLeads: leads.length }
  })

  // Move lead to different stage — ADMIN, MANAGER, COUNSELLOR (not MARKETING)
  app.put('/:id/stage', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, async (req, reply) => {
    const { stage } = req.body

    // COUNSELLOR can only move their own assigned leads
    if (req.user.role === 'COUNSELLOR') {
      const existing = await db.lead.findUnique({ where: { id: req.params.id } })
      if (!existing || existing.assignedToId !== req.user.id) {
        return reply.status(403).send({ error: 'You can only move leads assigned to you' })
      }
    }

    const lead = await db.lead.update({
      where: { id: req.params.id },
      data: { pipelineStage: stage },
    })

    await db.activity.create({
      data: {
        type: 'STAGE_CHANGE',
        content: `Moved to ${stage}`,
        leadId: lead.id,
        userId: req.user.id,
      }
    })

    return lead
  })
}
