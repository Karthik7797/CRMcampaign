import { db } from '../../config/db.js'

// PUBLIC endpoint — called from Google Forms (no auth needed)
export async function publicCreateInfluencerLead(request, reply) {
  const {
    studentName, studentEmail, studentMobile,
    collegeName, parentName, parentMobile, parentOccupation,
    intake, interestedCountry, mode, remarks,
    redirect_to
  } = request.body

  if (!studentName || !studentEmail || !studentMobile) {
    if (redirect_to) return reply.redirect(`${redirect_to}?error=missing_fields`)
    return reply.status(400).send({ error: 'studentName, studentEmail and studentMobile are required' })
  }

  const lead = await db.influencerLead.create({
    data: {
      studentName,
      studentEmail,
      studentMobile,
      collegeName: collegeName || null,
      parentName: parentName || null,
      parentMobile: parentMobile || null,
      parentOccupation: parentOccupation || null,
      intake: intake || null,
      interestedCountry: interestedCountry || null,
      mode: mode || null,
      remarks: remarks || null,
      source: 'GOOGLE_FORM',
      status: 'NEW',
      priority: 'MEDIUM',
      pipelineStage: 'ENQUIRY',
    }
  })

  if (redirect_to) {
    return reply.redirect(`${redirect_to}?success=true&leadId=${lead.id}`)
  }

  return reply.status(201).send({ success: true, leadId: lead.id })
}

export async function getInfluencerLeads(request, reply) {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 20 } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (source) where.source = source
    if (assignedTo) where.assignedToId = assignedTo
    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { studentEmail: { contains: search, mode: 'insensitive' } },
        { studentMobile: { contains: search, mode: 'insensitive' } },
        { collegeName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // COUNSELLOR and INFLUENCER can only see their own assigned leads
    if (request.user.role === 'COUNSELLOR' || request.user.role === 'INFLUENCER') {
      where.assignedToId = request.user.id
    }

    const [leads, total] = await Promise.all([
      db.influencerLead.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.influencerLead.count({ where }),
    ])

    const transformedLeads = leads.map(lead => ({
      ...lead,
      assignedTo: lead.assignedTo || null
    }))

    return {
      leads: transformedLeads,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  } catch (error) {
    console.error('=== INFLUENCER LEADS ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    console.error('User role:', request.user?.role)
    console.error('Stack:', error.stack)
    console.error('===============================')

    return reply.status(500).send({
      error: 'Failed to fetch influencer leads',
      message: error.message,
      code: error.code,
      userRole: request.user?.role
    })
  }
}

export async function getInfluencerLead(request, reply) {
  const lead = await db.influencerLead.findUnique({
    where: { id: request.params.id },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
      tasks: { orderBy: { dueDate: 'asc' } },
      communications: { orderBy: { createdAt: 'desc' }, take: 10 },
      leadNotes: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } }
      },
    }
  })

  if (!lead) return reply.status(404).send({ error: 'Influencer lead not found' })

  // COUNSELLOR can only view their own assigned leads
  if (request.user.role === 'COUNSELLOR' && lead.assignedToId !== request.user.id) {
    return reply.status(403).send({ error: 'You can only view leads assigned to you' })
  }

  // INFLUENCER can only view their own assigned leads
  if (request.user.role === 'INFLUENCER' && lead.assignedToId !== request.user.id) {
    return reply.status(403).send({ error: 'You can only view leads assigned to you' })
  }

  return lead
}

export async function createInfluencerLead(request, reply) {
  try {
    const lead = await db.influencerLead.create({
      data: { ...request.body, assignedToId: request.user.id }
    })
    return reply.status(201).send(lead)
  } catch (error) {
    request.log.error('Error creating influencer lead:', error)
    return reply.status(500).send({
      error: 'Failed to create influencer lead',
      message: error.message
    })
  }
}

export async function updateInfluencerLead(request, reply) {
  // COUNSELLOR can only edit their own assigned leads
  if (request.user.role === 'COUNSELLOR') {
    const existing = await db.influencerLead.findUnique({ where: { id: request.params.id } })
    if (!existing) return reply.status(404).send({ error: 'Influencer lead not found' })
    if (existing.assignedToId !== request.user.id) {
      return reply.status(403).send({ error: 'You can only edit leads assigned to you' })
    }
  }

  // INFLUENCER cannot edit at all
  if (request.user.role === 'INFLUENCER') {
    return reply.status(403).send({ error: 'Influencers cannot edit leads' })
  }

  const lead = await db.influencerLead.update({
    where: { id: request.params.id },
    data: request.body,
  })

  if (request.body.status) {
    await db.influencerLeadActivity.create({
      data: {
        type: 'STATUS_CHANGE',
        content: `Status changed to ${request.body.status}`,
        leadId: lead.id,
        userId: request.user.id,
      }
    })
  }

  return lead
}

export async function deleteInfluencerLead(request, reply) {
  await db.influencerLead.delete({ where: { id: request.params.id } })
  return { success: true }
}

export async function assignInfluencerLead(request, reply) {
  const { userId } = request.body
  const lead = await db.influencerLead.update({
    where: { id: request.params.id },
    data: { assignedToId: userId },
  })
  await db.influencerLeadActivity.create({
    data: {
      type: 'ASSIGNED',
      content: `Lead assigned`,
      leadId: lead.id,
      userId: request.user.id,
    }
  })
  return lead
}

export async function addInfluencerLeadNote(request, reply) {
  const { content } = request.body
  const { id } = request.params

  if (!content || content.trim() === '') {
    return reply.status(400).send({ error: 'Note content is required' })
  }

  const note = await db.influencerLeadNote.create({
    data: {
      content: content.trim(),
      leadId: id,
      userId: request.user.id,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  })

  return reply.status(201).send(note)
}

export async function getInfluencerLeadNotes(request, reply) {
  const { id } = request.params

  const notes = await db.influencerLeadNote.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  })

  return notes
}

export async function moveInfluencerLeadStage(request, reply) {
  const { stage } = request.body

  // COUNSELLOR can only move their own assigned leads
  if (request.user.role === 'COUNSELLOR') {
    const existing = await db.influencerLead.findUnique({ where: { id: request.params.id } })
    if (!existing || existing.assignedToId !== request.user.id) {
      return reply.status(403).send({ error: 'You can only move leads assigned to you' })
    }
  }

  // INFLUENCER cannot move stage
  if (request.user.role === 'INFLUENCER') {
    return reply.status(403).send({ error: 'Influencers cannot move pipeline stages' })
  }

  const lead = await db.influencerLead.update({
    where: { id: request.params.id },
    data: { pipelineStage: stage },
  })

  await db.influencerLeadActivity.create({
    data: {
      type: 'STAGE_CHANGE',
      content: `Moved to ${stage}`,
      leadId: lead.id,
      userId: request.user.id,
    }
  })

  return lead
}

// ── Tasks for Influencer Leads ───────────────────────────────────────

export async function getInfluencerLeadTasks(request, reply) {
  const { id } = request.params

  const tasks = await db.influencerLeadTask.findMany({
    where: { leadId: id },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    include: {
      assignedTo: { select: { id: true, name: true } }
    }
  })

  return tasks
}

export async function createInfluencerLeadTask(request, reply) {
  const { id } = request.params
  const { title, description, dueDate, priority } = request.body

  const task = await db.influencerLeadTask.create({
    data: {
      title,
      description: description || null,
      dueDate: new Date(dueDate),
      priority: priority || 'MEDIUM',
      leadId: id,
      userId: request.user.id,
    },
    include: {
      assignedTo: { select: { id: true, name: true } }
    }
  })

  return reply.status(201).send(task)
}

// ── Communications for Influencer Leads ──────────────────────────────

export async function getInfluencerLeadComms(request, reply) {
  const { id } = request.params

  const comms = await db.influencerLeadCommunication.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' }
  })

  return comms
}

export async function createInfluencerLeadComm(request, reply) {
  const { id } = request.params
  const { type, subject, content } = request.body

  const comm = await db.influencerLeadCommunication.create({
    data: {
      type,
      subject: subject || null,
      content,
      leadId: id,
    }
  })

  await db.influencerLeadActivity.create({
    data: {
      type: type,
      content: `${type}: ${subject || content.substring(0, 100)}`,
      leadId: id,
      userId: request.user.id,
    }
  })

  return reply.status(201).send(comm)
}
