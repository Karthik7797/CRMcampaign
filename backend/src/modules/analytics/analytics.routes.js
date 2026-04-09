import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function analyticsRoutes(app) {
  // Analytics: ADMIN, MANAGER, MARKETING, INFLUENCER only (COUNSELLOR has no access)
  app.get('/overview', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER')] }, async (req, reply) => {
    try {
      const [
        totalLeads, newLeads, converted, bySource, byStatus, byStage, recentLeads
      ] = await Promise.all([
        db.lead.count(),
        db.lead.count({ where: { status: 'NEW' } }),
        db.lead.count({ where: { status: 'CONVERTED' } }),
        db.lead.groupBy({ by: ['source'], _count: true }),
        db.lead.groupBy({ by: ['status'], _count: true }),
        db.lead.groupBy({ by: ['pipelineStage'], _count: true }),
        db.lead.findMany({
          orderBy: { createdAt: 'desc' }, take: 10,
          include: { assignedTo: { select: { name: true } } }
        })
      ])

      const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0

      return { totalLeads, newLeads, converted, conversionRate, bySource, byStatus, byStage, recentLeads }
    } catch (error) {
      req.log.error('Error fetching analytics:', error)
      return reply.status(500).send({ 
        error: 'Failed to fetch analytics',
        message: error.message 
      })
    }
  })
}
