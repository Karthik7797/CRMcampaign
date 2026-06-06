import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import {
  publicCreateCampaign2Lead,
  getCampaign2Leads,
  getCampaign2Lead,
  createCampaign2Lead,
  updateCampaign2Lead,
  deleteCampaign2Lead,
  assignCampaign2Lead,
  addCampaign2LeadNote,
  getCampaign2LeadNotes,
  moveCampaign2LeadStage,
  getCampaign2LeadTasks,
  createCampaign2LeadTask,
  getCampaign2LeadComms,
  createCampaign2LeadComm,
} from './campaign-2.controller.js'

export async function campaign2Routes(app) {
  // PUBLIC — Campaign 2 Google Form hits this (no auth needed)
  app.post('/public', publicCreateCampaign2Lead)

  // PROTECTED — CRM only
  app.get('/', { preHandler: [authenticate] }, getCampaign2Leads)
  app.get('/:id', { preHandler: [authenticate] }, getCampaign2Lead)

  // Create: ADMIN, MANAGER
  app.post('/', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, createCampaign2Lead)

  // Edit: ADMIN, MANAGER, COUNSELLOR (counsellor restricted to own leads in controller)
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, updateCampaign2Lead)

  // Delete: ADMIN only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deleteCampaign2Lead)

  // Assign: ADMIN and MANAGER only
  app.post('/:id/assign', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, assignCampaign2Lead)

  // Lead Notes: All authenticated users can add/view notes
  app.get('/:id/notes', { preHandler: [authenticate] }, getCampaign2LeadNotes)
  app.post('/:id/notes', { preHandler: [authenticate] }, addCampaign2LeadNote)

  // Pipeline Stage: ADMIN, MANAGER, COUNSELLOR (counsellor restricted in controller)
  app.put('/:id/stage', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, moveCampaign2LeadStage)

  // Tasks: All authenticated users can view/create
  app.get('/:id/tasks', { preHandler: [authenticate] }, getCampaign2LeadTasks)
  app.post('/:id/tasks', { preHandler: [authenticate] }, createCampaign2LeadTask)

  // Communications: All authenticated users can view/create
  app.get('/:id/comms', { preHandler: [authenticate] }, getCampaign2LeadComms)
  app.post('/:id/comms', { preHandler: [authenticate] }, createCampaign2LeadComm)
}
