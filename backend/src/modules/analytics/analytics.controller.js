import { db } from '../../config/db.js'

/**
 * Get user progression analytics
 * Returns leads distribution per user across pipeline stages
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export async function getUserProgression(request, reply) {
  try {
    // Get all users with their assigned leads count
    const users = await db.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        _count: {
          select: {
            leads: true
          }
        },
        leads: {
          select: {
            id: true,
            pipelineStage: true,
            status: true,
            name: true
          }
        }
      }
    })

    // Transform data to show pipeline stage distribution per user
    const userProgression = users.map(user => {
      const stageDistribution = user.leads.reduce((acc, lead) => {
        acc[lead.pipelineStage] = (acc[lead.pipelineStage] || 0) + 1
        return acc
      }, {})

      const statusDistribution = user.leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})

      const convertedCount = user.leads.filter(l => l.status === 'CONVERTED').length
      const conversionRate = user.leads.length > 0 
        ? ((convertedCount / user.leads.length) * 100).toFixed(1) 
        : 0

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        totalLeads: user._count.leads,
        convertedLeads: convertedCount,
        conversionRate: parseFloat(conversionRate),
        stageDistribution,
        statusDistribution,
        recentLeads: user.leads.slice(0, 5).map(l => ({
          id: l.id,
          name: l.name,
          pipelineStage: l.pipelineStage,
          status: l.status
        }))
      }
    })

    // Calculate overall statistics
    const totalUsers = users.length
    const totalAssignedLeads = users.reduce((sum, u) => sum + u._count.leads, 0)
    const totalConverted = users.reduce((sum, u) => {
      return sum + u.leads.filter(l => l.status === 'CONVERTED').length
    }, 0)
    const averageConversionRate = totalAssignedLeads > 0
      ? ((totalConverted / totalAssignedLeads) * 100).toFixed(1)
      : 0

    // Get pipeline stage counts across all users
    const allStages = await db.lead.groupBy({
      by: ['pipelineStage'],
      _count: true,
      where: {
        assignedToId: { not: null }
      }
    })

    return {
      summary: {
        totalUsers,
        totalAssignedLeads,
        totalConverted,
        averageConversionRate: parseFloat(averageConversionRate)
      },
      allStages: allStages.reduce((acc, stage) => {
        acc[stage.pipelineStage] = stage._count
        return acc
      }, {}),
      users: userProgression
    }
  } catch (error) {
    request.log.error('Error fetching user progression analytics:', error)
    return reply.status(500).send({
      error: 'Failed to fetch user progression analytics',
      message: error.message
    })
  }
}

/**
 * Get single user's detailed progression
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export async function getUserProgressionDetail(request, reply) {
  try {
    const { userId } = request.params

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        _count: {
          select: {
            leads: true,
            tasks: true
          }
        },
        leads: {
          select: {
            id: true,
            name: true,
            email: true,
            pipelineStage: true,
            status: true,
            priority: true,
            source: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    const stageDistribution = user.leads.reduce((acc, lead) => {
      acc[lead.pipelineStage] = (acc[lead.pipelineStage] || 0) + 1
      return acc
    }, {})

    const statusDistribution = user.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    const convertedCount = user.leads.filter(l => l.status === 'CONVERTED').length
    const conversionRate = user.leads.length > 0
      ? ((convertedCount / user.leads.length) * 100).toFixed(1)
      : 0

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        totalLeads: user._count.leads,
        totalTasks: user._count.tasks,
        convertedLeads: convertedCount,
        conversionRate: parseFloat(conversionRate),
        stageDistribution,
        statusDistribution
      },
      leads: user.leads,
      recentActivities: user.activities
    }
  } catch (error) {
    request.log.error('Error fetching user progression detail:', error)
    return reply.status(500).send({
      error: 'Failed to fetch user progression detail',
      message: error.message
    })
  }
}
