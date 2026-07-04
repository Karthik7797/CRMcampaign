import { db } from '../../config/db.js'

// PUBLIC endpoint — called from Campaign 3 Google Form (no auth needed).
// The Apps Script posts JSON; the respondent's Google email arrives as the
// top-level `email` field, so we accept `studentEmail || email`.
export async function publicCreateCampaign3Lead(request, reply) {
  const {
    studentName, studentEmail, studentMobile,
    parentName, parentMobile, parentOccupation,
    preferredCountry, preferredIntake,
    currentQualification, course, degreeField,
    completionYear, percentage, mode, remarks,
    email, redirect_to
  } = request.body

  // The Sai Story form collects email — require name + email + mobile.
  const resolvedEmail = studentEmail || email
  if (!studentName || !resolvedEmail || !studentMobile) {
    if (redirect_to) return reply.redirect(`${redirect_to}?error=missing_fields`)
    return reply.status(400).send({ error: 'studentName, studentEmail and studentMobile are required' })
  }

  const lead = await db.campaign3Lead.create({
    data: {
      studentName,
      studentEmail: resolvedEmail,
      studentMobile,
      parentName: parentName || null,
      parentMobile: parentMobile || null,
      parentOccupation: parentOccupation || null,
      preferredCountry: preferredCountry || null,
      preferredIntake: preferredIntake || null,
      currentQualification: currentQualification || null,
      course: course || null,
      degreeField: degreeField || null,
      completionYear: completionYear || null,
      percentage: percentage || null,
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

export async function getCampaign3Leads(request, reply) {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 10 } = request.query
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
        { course: { contains: search, mode: 'insensitive' } },
      ]
    }

    // COUNSELLOR and INFLUENCER can only see their own assigned leads
    if (request.user.role === 'COUNSELLOR' || request.user.role === 'INFLUENCER') {
      where.assignedToId = request.user.id
    }

    const [leads, total] = await Promise.all([
      db.campaign3Lead.findMany({
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
      db.campaign3Lead.count({ where }),
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
    console.error('=== CAMPAIGN 3 LEADS ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    console.error('User role:', request.user?.role)
    console.error('Stack:', error.stack)
    console.error('===============================')

    return reply.status(500).send({
      error: 'Failed to fetch campaign 3 leads',
      message: error.message,
      code: error.code,
      userRole: request.user?.role
    })
  }
}

export async function getCampaign3Lead(request, reply) {
  const lead = await db.campaign3Lead.findUnique({
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

  if (!lead) return reply.status(404).send({ error: 'Campaign 3 lead not found' })

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

export async function createCampaign3Lead(request, reply) {
  try {
    const lead = await db.campaign3Lead.create({
      data: { ...request.body, assignedToId: request.user.id }
    })
    return reply.status(201).send(lead)
  } catch (error) {
    request.log.error('Error creating campaign 3 lead:', error)
    return reply.status(500).send({
      error: 'Failed to create campaign 3 lead',
      message: error.message
    })
  }
}

export async function updateCampaign3Lead(request, reply) {
  // COUNSELLOR can only edit their own assigned leads
  if (request.user.role === 'COUNSELLOR') {
    const existing = await db.campaign3Lead.findUnique({ where: { id: request.params.id } })
    if (!existing) return reply.status(404).send({ error: 'Campaign 3 lead not found' })
    if (existing.assignedToId !== request.user.id) {
      return reply.status(403).send({ error: 'You can only edit leads assigned to you' })
    }
  }

  // INFLUENCER cannot edit at all
  if (request.user.role === 'INFLUENCER') {
    return reply.status(403).send({ error: 'Influencers cannot edit leads' })
  }

  const lead = await db.campaign3Lead.update({
    where: { id: request.params.id },
    data: request.body,
  })

  if (request.body.status) {
    await db.campaign3LeadActivity.create({
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

export async function deleteCampaign3Lead(request, reply) {
  await db.campaign3Lead.delete({ where: { id: request.params.id } })
  return { success: true }
}

export async function assignCampaign3Lead(request, reply) {
  const { userId } = request.body
  const lead = await db.campaign3Lead.update({
    where: { id: request.params.id },
    data: { assignedToId: userId },
  })
  await db.campaign3LeadActivity.create({
    data: {
      type: 'ASSIGNED',
      content: `Lead assigned`,
      leadId: lead.id,
      userId: request.user.id,
    }
  })
  return lead
}

export async function addCampaign3LeadNote(request, reply) {
  const { content } = request.body
  const { id } = request.params

  if (!content || content.trim() === '') {
    return reply.status(400).send({ error: 'Note content is required' })
  }

  const note = await db.campaign3LeadNote.create({
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

export async function getCampaign3LeadNotes(request, reply) {
  const { id } = request.params

  const notes = await db.campaign3LeadNote.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  })

  return notes
}

export async function moveCampaign3LeadStage(request, reply) {
  const { stage } = request.body

  // COUNSELLOR can only move their own assigned leads
  if (request.user.role === 'COUNSELLOR') {
    const existing = await db.campaign3Lead.findUnique({ where: { id: request.params.id } })
    if (!existing || existing.assignedToId !== request.user.id) {
      return reply.status(403).send({ error: 'You can only move leads assigned to you' })
    }
  }

  // INFLUENCER cannot move stage
  if (request.user.role === 'INFLUENCER') {
    return reply.status(403).send({ error: 'Influencers cannot move pipeline stages' })
  }

  const lead = await db.campaign3Lead.update({
    where: { id: request.params.id },
    data: { pipelineStage: stage },
  })

  await db.campaign3LeadActivity.create({
    data: {
      type: 'STAGE_CHANGE',
      content: `Moved to ${stage}`,
      leadId: lead.id,
      userId: request.user.id,
    }
  })

  return lead
}

// ── Tasks for Campaign 3 Leads ───────────────────────────────────────

export async function getCampaign3LeadTasks(request, reply) {
  const { id } = request.params

  const tasks = await db.campaign3LeadTask.findMany({
    where: { leadId: id },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    include: {
      assignedTo: { select: { id: true, name: true } }
    }
  })

  return tasks
}

export async function createCampaign3LeadTask(request, reply) {
  const { id } = request.params
  const { title, description, dueDate, priority } = request.body

  const task = await db.campaign3LeadTask.create({
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

// ── Communications for Campaign 3 Leads ──────────────────────────────

export async function getCampaign3LeadComms(request, reply) {
  const { id } = request.params

  const comms = await db.campaign3LeadCommunication.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' }
  })

  return comms
}

export async function createCampaign3LeadComm(request, reply) {
  const { id } = request.params
  const { type, subject, content } = request.body

  const comm = await db.campaign3LeadCommunication.create({
    data: {
      type,
      subject: subject || null,
      content,
      leadId: id,
    }
  })

  await db.campaign3LeadActivity.create({
    data: {
      type: type,
      content: `${type}: ${subject || content.substring(0, 100)}`,
      leadId: id,
      userId: request.user.id,
    }
  })

  return reply.status(201).send(comm)
}
