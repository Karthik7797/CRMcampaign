import { db } from '../../config/db.js'

// PUBLIC endpoint — called from landing pages (AJAX or Traditional HTML Form)
export async function publicCreateLead(request, reply) {
  const { name, email, phone, course, landingPage, utmSource, utmMedium, utmCampaign, city, qualification, redirect_to } = request.body

  if (!name || !email || !phone) {
    if (redirect_to) return reply.redirect(`${redirect_to}?error=missing_fields`)
    return reply.status(400).send({ error: 'Name, email and phone are required' })
  }

  // Map landing page to source enum
  const sourceMap = {
    'mba': 'LANDING_PAGE_MBA',
    'engineering': 'LANDING_PAGE_ENGINEERING',
    'education': 'LANDING_PAGE_EDUCATION',
    'scholarship': 'LANDING_PAGE_SCHOLARSHIP',
    'online': 'LANDING_PAGE_ONLINE',
  }
  const source = sourceMap[landingPage] || 'WEBSITE'

  const lead = await db.lead.create({
    data: {
      name, email, phone,
      course: course || null,
      landingPage: landingPage || null,
      source,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      city: city || null,
      qualification: qualification || null,
      status: 'NEW',
      pipelineStage: 'ENQUIRY',
    }
  })

  // If the form specifies a redirect URL (traditional HTML forms), bounce them there
  if (redirect_to) {
    return reply.redirect(`${redirect_to}?success=true&leadId=${lead.id}`)
  }

  // Otherwise return JSON (AJAX/Fetch forms like React)
  return reply.status(201).send({ success: true, leadId: lead.id })
}

export async function getLeads(request, reply) {
  try {
    // Log user info for debugging
    request.log.info('getLeads called', {
      userId: request.user?.id,
      userRole: request.user?.role,
      userEmail: request.user?.email
    })
    
    // Validate database connection first
    await db.$connect()
    
    const { status, source, assignedTo, search, page = 1, limit = 20 } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (source) where.source = source
    if (assignedTo) where.assignedToId = assignedTo
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // COUNSELLOR and INFLUENCER can only see their own assigned leads
    if (request.user.role === 'COUNSELLOR' || request.user.role === 'INFLUENCER') {
      where.assignedToId = request.user.id
    }

    request.log.info('Executing query with filters', { where, skip, limit: parseInt(limit) })

    const [leads, total] = await Promise.all([
      db.lead.findMany({
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
      db.lead.count({ where }),
    ])

    // Transform leads to handle null assignedTo
    const transformedLeads = leads.map(lead => ({
      ...lead,
      assignedTo: lead.assignedTo || null
    }))

    return { leads: transformedLeads, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  } catch (error) {
    // Detailed error logging
    console.error('=== LEADS ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    console.error('User role:', request.user?.role)
    console.error('Stack:', error.stack)
    console.error('===================')
    
    request.log.error('Error fetching leads:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      userRole: request.user?.role
    })
    
    return reply.status(500).send({ 
      error: 'Failed to fetch leads',
      message: error.message,
      code: error.code,
      userRole: request.user?.role
    })
  }
}

export async function getLead(request, reply) {
  const lead = await db.lead.findUnique({
    where: { id: request.params.id },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
      tasks: { orderBy: { dueDate: 'asc' } },
      communications: { orderBy: { createdAt: 'desc' }, take: 10 },
    }
  })
  if (!lead) return reply.status(404).send({ error: 'Lead not found' })

  // COUNSELLOR can only view their own assigned leads
  if (request.user.role === 'COUNSELLOR' && lead.assignedToId !== request.user.id) {
    return reply.status(403).send({ error: 'You can only view leads assigned to you' })
  }

  return lead
}

export async function createLead(request, reply) {
  try {
    const lead = await db.lead.create({
      data: { ...request.body, assignedToId: request.user.id }
    })
    return reply.status(201).send(lead)
  } catch (error) {
    request.log.error('Error creating lead:', error)
    return reply.status(500).send({ 
      error: 'Failed to create lead',
      message: error.message 
    })
  }
}

export async function updateLead(request, reply) {
  // COUNSELLOR can only edit their own assigned leads
  if (request.user.role === 'COUNSELLOR') {
    const existing = await db.lead.findUnique({ where: { id: request.params.id } })
    if (!existing) return reply.status(404).send({ error: 'Lead not found' })
    if (existing.assignedToId !== request.user.id) {
      return reply.status(403).send({ error: 'You can only edit leads assigned to you' })
    }
  }

  const lead = await db.lead.update({
    where: { id: request.params.id },
    data: request.body,
  })

  // Log activity
  if (request.body.status) {
    await db.activity.create({
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

export async function deleteLead(request, reply) {
  await db.lead.delete({ where: { id: request.params.id } })
  return { success: true }
}

export async function assignLead(request, reply) {
  const { userId } = request.body
  const lead = await db.lead.update({
    where: { id: request.params.id },
    data: { assignedToId: userId },
  })
  await db.activity.create({
    data: {
      type: 'ASSIGNED',
      content: `Lead assigned`,
      leadId: lead.id,
      userId: request.user.id,
    }
  })
  return lead
}
