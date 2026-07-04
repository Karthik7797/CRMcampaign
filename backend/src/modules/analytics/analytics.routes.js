import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'
import { getUserProgression, getUserProgressionDetail } from './analytics.controller.js'

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

      // ── Follow-up buckets (due today / overdue) across all 4 lead tables ──
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfTomorrow = new Date(startOfToday)
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

      // Don't nag about leads that are already closed.
      const openStatus = { notIn: ['CONVERTED', 'LOST', 'JUNK'] }

      // Each table exposes its display name under a different field; normalize to `name`.
      const sources = [
        { model: db.lead, leadType: 'lead', nameField: 'name' },
        { model: db.influencerLead, leadType: 'influencer', nameField: 'studentName' },
        { model: db.campaign1Lead, leadType: 'campaign1', nameField: 'studentName' },
        { model: db.campaign2Lead, leadType: 'campaign2', nameField: 'studentName' },
        { model: db.campaign3Lead, leadType: 'campaign3', nameField: 'studentName' },
      ]

      // Select only the name field that actually exists on this table.
      const fetchBucket = (model, nameField, where) =>
        model.findMany({
          where: { followUpDate: where, status: openStatus },
          select: {
            id: true, [nameField]: true, status: true, followUpDate: true,
            assignedTo: { select: { name: true } },
          },
          orderBy: { followUpDate: 'asc' },
        })

      const normalize = (rows, leadType, nameField) =>
        rows.map((r) => ({
          id: r.id,
          name: r[nameField] ?? 'Unknown',
          leadType,
          status: r.status,
          followUpDate: r.followUpDate,
          assignedTo: r.assignedTo,
        }))

      const dueTodayPerTable = await Promise.all(
        sources.map((s) =>
          fetchBucket(s.model, s.nameField, { gte: startOfToday, lt: startOfTomorrow })
            .then((rows) => normalize(rows, s.leadType, s.nameField))
        )
      )
      const overduePerTable = await Promise.all(
        sources.map((s) =>
          fetchBucket(s.model, s.nameField, { lt: startOfToday })
            .then((rows) => normalize(rows, s.leadType, s.nameField))
        )
      )

      const followUpsDueToday = dueTodayPerTable.flat()
        .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
      const followUpsOverdue = overduePerTable.flat()
        .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))

      return {
        totalLeads, newLeads, converted, conversionRate, bySource, byStatus, byStage, recentLeads,
        followUpsDueToday, followUpsOverdue,
      }
    } catch (error) {
      req.log.error('Error fetching analytics:', error)
      return reply.status(500).send({ 
        error: 'Failed to fetch analytics',
        message: error.message 
      })
    }
  })

  // User Progression: ADMIN, MANAGER only
  app.get('/user-progression', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, getUserProgression)
  
  // Single User Progression Detail: ADMIN, MANAGER only
  app.get('/user-progression/:userId', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, getUserProgressionDetail)
}
