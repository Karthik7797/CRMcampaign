import { authenticate } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function tasksRoutes(app) {
  // Get all tasks for current user
  app.get('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { completed, priority, page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { userId: req.user.id }
    if (completed !== undefined) where.completed = completed === 'true'
    if (priority) where.priority = priority

    // Admins/Managers see all tasks
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
      delete where.userId
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where, skip, take: parseInt(limit),
        include: {
          lead: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
      }),
      db.task.count({ where }),
    ])

    return { tasks, total }
  })

  // Create task
  app.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { title, description, dueDate, priority, leadId } = req.body
    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        leadId: leadId || null,
        userId: req.user.id,
      },
      include: {
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      }
    })
    return reply.status(201).send(task)
  })

  // Update task
  app.put('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const data = { ...req.body }
    if (data.dueDate) data.dueDate = new Date(data.dueDate)

    const task = await db.task.update({
      where: { id: req.params.id },
      data,
      include: {
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      }
    })
    return task
  })

  // Toggle task complete
  app.patch('/:id/toggle', { preHandler: [authenticate] }, async (req, reply) => {
    const existing = await db.task.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.status(404).send({ error: 'Task not found' })

    const task = await db.task.update({
      where: { id: req.params.id },
      data: { completed: !existing.completed },
    })
    return task
  })

  // Delete task
  app.delete('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    await db.task.delete({ where: { id: req.params.id } })
    return { success: true }
  })
}
