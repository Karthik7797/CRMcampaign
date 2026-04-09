import { authenticate, authorize, requirePermission } from '../../middleware/auth.middleware.js'
import {
  createLead, getLeads, getLead,
  updateLead, deleteLead, assignLead, publicCreateLead,
  addLeadNote, getLeadNotes
} from './leads.controller.js'

export async function leadsRoutes(app) {
  // PUBLIC — landing pages hit this (no auth needed)
  app.post('/public', publicCreateLead)

  // PROTECTED — CRM only (all authenticated users can view)
  app.get('/', { preHandler: [authenticate] }, getLeads)
  app.get('/:id', { preHandler: [authenticate] }, getLead)

  // Create: ADMIN, MANAGER, COUNSELLOR (not MARKETING)
  app.post('/', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, createLead)

  // Edit: ADMIN, MANAGER, COUNSELLOR (counsellor restricted to own leads in controller)
  app.put('/:id', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER', 'COUNSELLOR')] }, updateLead)

  // Delete: ADMIN only
  app.delete('/:id', { preHandler: [authenticate, authorize('ADMIN')] }, deleteLead)

  // Assign: ADMIN and MANAGER only
  app.post('/:id/assign', { preHandler: [authenticate, authorize('ADMIN', 'MANAGER')] }, assignLead)

  // Lead Notes: All authenticated users can add/view notes
  app.get('/:id/notes', { preHandler: [authenticate] }, getLeadNotes)
  app.post('/:id/notes', { preHandler: [authenticate] }, addLeadNote)
}
