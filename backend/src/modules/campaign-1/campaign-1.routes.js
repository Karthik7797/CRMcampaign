import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import {
  publicCreateCampaign1Lead,
  getCampaign1Leads,
  getCampaign1Lead,
  createCampaign1Lead,
  updateCampaign1Lead,
  deleteCampaign1Lead,
  assignCampaign1Lead,
  addCampaign1LeadNote,
  getCampaign1LeadNotes,
  moveCampaign1LeadStage,
  getCampaign1LeadTasks,
  createCampaign1LeadTask,
  getCampaign1LeadComms,
  createCampaign1LeadComm,
} from './campaign-1.controller.js'

export async function campaign1Routes(app) {
  // PUBLIC — Campaign 1 Google Form hits this (no auth needed)
  app.post('/public', publicCreateCampaign1Lead)

  // PROTECTED — CRM only
  app.get('/', { preHandler: [authenticate] }, getCampaign1Leads)
  app.get('/:id', { preHandler: [authenticate] }, getCampaign1Lead)

  // Create: ADMIN, MANAGER
  app.post('/', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, createCampaign1Lead)

  // Edit: ADMIN, MANAGER, COUNSELLOR (counsellor restricted to own leads in controller)
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, updateCampaign1Lead)

  // Delete: ADMIN only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deleteCampaign1Lead)

  // Assign: ADMIN and MANAGER only
  app.post('/:id/assign', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, assignCampaign1Lead)

  // Lead Notes: All authenticated users can add/view notes
  app.get('/:id/notes', { preHandler: [authenticate] }, getCampaign1LeadNotes)
  app.post('/:id/notes', { preHandler: [authenticate] }, addCampaign1LeadNote)

  // Pipeline Stage: ADMIN, MANAGER, COUNSELLOR (counsellor restricted in controller)
  app.put('/:id/stage', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, moveCampaign1LeadStage)

  // Tasks: All authenticated users can view/create
  app.get('/:id/tasks', { preHandler: [authenticate] }, getCampaign1LeadTasks)
  app.post('/:id/tasks', { preHandler: [authenticate] }, createCampaign1LeadTask)

  // Communications: All authenticated users can view/create
  app.get('/:id/comms', { preHandler: [authenticate] }, getCampaign1LeadComms)
  app.post('/:id/comms', { preHandler: [authenticate] }, createCampaign1LeadComm)
}
