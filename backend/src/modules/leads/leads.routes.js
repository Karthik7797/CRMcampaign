import { authenticate } from '../../middleware/auth.middleware.js'
import {
  createLead, getLeads, getLead,
  updateLead, deleteLead, assignLead, publicCreateLead
} from './leads.controller.js'

export async function leadsRoutes(app) {
  // PUBLIC — landing pages hit this (no auth needed)
  app.post('/public', publicCreateLead)

  // PROTECTED — CRM only
  app.get('/', { preHandler: [authenticate] }, getLeads)
  app.get('/:id', { preHandler: [authenticate] }, getLead)
  app.post('/', { preHandler: [authenticate] }, createLead)
  app.put('/:id', { preHandler: [authenticate] }, updateLead)
  app.delete('/:id', { preHandler: [authenticate] }, deleteLead)
  app.post('/:id/assign', { preHandler: [authenticate] }, assignLead)
}
