import { authenticate } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function pipelineRoutes(app) {
  // Get pipeline overview (leads grouped by stage)
  app.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const leads = await db.lead.findMany({
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

  // Move lead to different stage
  app.put('/:id/stage', { preHandler: [authenticate] }, async (req, reply) => {
    const { stage } = req.body
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
