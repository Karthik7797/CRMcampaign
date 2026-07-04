import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import {
  publicCreateCampaign3Lead,
  getCampaign3Leads,
  getCampaign3Lead,
  createCampaign3Lead,
  updateCampaign3Lead,
  deleteCampaign3Lead,
  assignCampaign3Lead,
  addCampaign3LeadNote,
  getCampaign3LeadNotes,
  moveCampaign3LeadStage,
  getCampaign3LeadTasks,
  createCampaign3LeadTask,
  getCampaign3LeadComms,
  createCampaign3LeadComm,
} from './campaign-3.controller.js'

export async function campaign3Routes(app) {
  // PUBLIC — Campaign 3 Google Form hits this (no auth needed)
  app.post('/public', publicCreateCampaign3Lead)

  // PROTECTED — CRM only
  app.get('/', { preHandler: [authenticate] }, getCampaign3Leads)
  app.get('/:id', { preHandler: [authenticate] }, getCampaign3Lead)

  // Create: ADMIN, MANAGER
  app.post('/', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, createCampaign3Lead)

  // Edit: ADMIN, MANAGER, COUNSELLOR (counsellor restricted to own leads in controller)
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, updateCampaign3Lead)

  // Delete: ADMIN only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deleteCampaign3Lead)

  // Assign: ADMIN and MANAGER only
  app.post('/:id/assign', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, assignCampaign3Lead)

  // Lead Notes: All authenticated users can add/view notes
  app.get('/:id/notes', { preHandler: [authenticate] }, getCampaign3LeadNotes)
  app.post('/:id/notes', { preHandler: [authenticate] }, addCampaign3LeadNote)

  // Pipeline Stage: ADMIN, MANAGER, COUNSELLOR (counsellor restricted in controller)
  app.put('/:id/stage', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, moveCampaign3LeadStage)

  // Tasks: All authenticated users can view/create
  app.get('/:id/tasks', { preHandler: [authenticate] }, getCampaign3LeadTasks)
  app.post('/:id/tasks', { preHandler: [authenticate] }, createCampaign3LeadTask)

  // Communications: All authenticated users can view/create
  app.get('/:id/comms', { preHandler: [authenticate] }, getCampaign3LeadComms)
  app.post('/:id/comms', { preHandler: [authenticate] }, createCampaign3LeadComm)
}
