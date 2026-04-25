import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import {
  publicCreateInfluencerLead,
  getInfluencerLeads,
  getInfluencerLead,
  createInfluencerLead,
  updateInfluencerLead,
  deleteInfluencerLead,
  assignInfluencerLead,
  addInfluencerLeadNote,
  getInfluencerLeadNotes,
  moveInfluencerLeadStage,
  getInfluencerLeadTasks,
  createInfluencerLeadTask,
  getInfluencerLeadComms,
  createInfluencerLeadComm,
} from './influencer-leads.controller.js'

export async function influencerLeadsRoutes(app) {
  // PUBLIC — Google Forms hit this (no auth needed)
  app.post('/public', publicCreateInfluencerLead)

  // PROTECTED — CRM only
  app.get('/', { preHandler: [authenticate] }, getInfluencerLeads)
  app.get('/:id', { preHandler: [authenticate] }, getInfluencerLead)

  // Create: ADMIN, MANAGER
  app.post('/', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, createInfluencerLead)

  // Edit: ADMIN, MANAGER, COUNSELLOR (counsellor restricted to own leads in controller)
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, updateInfluencerLead)

  // Delete: ADMIN only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deleteInfluencerLead)

  // Assign: ADMIN and MANAGER only
  app.post('/:id/assign', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, assignInfluencerLead)

  // Lead Notes: All authenticated users can add/view notes
  app.get('/:id/notes', { preHandler: [authenticate] }, getInfluencerLeadNotes)
  app.post('/:id/notes', { preHandler: [authenticate] }, addInfluencerLeadNote)

  // Pipeline Stage: ADMIN, MANAGER, COUNSELLOR (counsellor restricted in controller)
  app.put('/:id/stage', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, moveInfluencerLeadStage)

  // Tasks: All authenticated users can view/create
  app.get('/:id/tasks', { preHandler: [authenticate] }, getInfluencerLeadTasks)
  app.post('/:id/tasks', { preHandler: [authenticate] }, createInfluencerLeadTask)

  // Communications: All authenticated users can view/create
  app.get('/:id/comms', { preHandler: [authenticate] }, getInfluencerLeadComms)
  app.post('/:id/comms', { preHandler: [authenticate] }, createInfluencerLeadComm)
}
