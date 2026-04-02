// Seed script: creates admin user and sample data
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from './config/db.js'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('demo123', 10)
  const admin = await db.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create counsellor
  const counsellorPassword = await bcrypt.hash('demo123', 10)
  const counsellor = await db.user.upsert({
    where: { email: 'counsellor@demo.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'counsellor@demo.com',
      password: counsellorPassword,
      role: 'COUNSELLOR',
    },
  })
  console.log('✅ Counsellor created:', counsellor.email)

  // Create sample leads
  const sampleLeads = [
    { name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91-9876543210', course: 'MBA Finance', source: 'LANDING_PAGE_MBA', city: 'Mumbai', qualification: 'Graduate', landingPage: 'mba', status: 'NEW', pipelineStage: 'ENQUIRY' },
    { name: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91-9876543211', course: 'B.Tech CSE', source: 'LANDING_PAGE_ENGINEERING', city: 'Delhi', qualification: '12th', landingPage: 'engineering', status: 'CONTACTED', pipelineStage: 'CONTACTED', assignedToId: counsellor.id },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91-9876543212', course: 'MBA Marketing', source: 'LANDING_PAGE_MBA', city: 'Bangalore', qualification: 'Graduate', landingPage: 'mba', status: 'QUALIFIED', pipelineStage: 'APPLICATION_SENT', assignedToId: admin.id },
    { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91-9876543213', course: 'Online MBA', source: 'LANDING_PAGE_ONLINE', city: 'Hyderabad', qualification: 'Graduate', landingPage: 'online', status: 'NEW', pipelineStage: 'ENQUIRY' },
    { name: 'Amit Patel', email: 'amit@example.com', phone: '+91-9876543214', course: 'B.Tech AI & ML', source: 'LANDING_PAGE_ENGINEERING', city: 'Ahmedabad', qualification: '12th', landingPage: 'engineering', status: 'NURTURING', pipelineStage: 'APPLICATION_RECEIVED', assignedToId: counsellor.id },
    { name: 'Kavya Nair', email: 'kavya@example.com', phone: '+91-9876543215', course: 'MBA HR', source: 'GOOGLE', city: 'Chennai', qualification: 'Graduate', status: 'CONTACTED', pipelineStage: 'CONTACTED', assignedToId: admin.id },
    { name: 'Rohan Das', email: 'rohan@example.com', phone: '+91-9876543216', course: 'B.Tech ECE', source: 'FACEBOOK', city: 'Kolkata', qualification: '12th', status: 'CONVERTED', pipelineStage: 'ENROLLED', assignedToId: counsellor.id },
    { name: 'Meera Joshi', email: 'meera@example.com', phone: '+91-9876543217', course: 'MBA Operations', source: 'REFERRAL', city: 'Pune', qualification: 'Graduate', status: 'QUALIFIED', pipelineStage: 'SHORTLISTED', assignedToId: admin.id },
    { name: 'Arjun Kumar', email: 'arjun@example.com', phone: '+91-9876543218', course: 'Online BBA', source: 'LANDING_PAGE_ONLINE', city: 'Jaipur', qualification: '12th', landingPage: 'online', status: 'NEW', pipelineStage: 'ENQUIRY' },
    { name: 'Divya Menon', email: 'divya@example.com', phone: '+91-9876543219', course: 'MBA Business Analytics', source: 'LANDING_PAGE_SCHOLARSHIP', city: 'Kochi', qualification: 'Graduate', landingPage: 'scholarship', status: 'CONTACTED', pipelineStage: 'CONTACTED', assignedToId: counsellor.id },
  ]

  for (const leadData of sampleLeads) {
    const existing = await db.lead.findFirst({ where: { email: leadData.email } })
    if (!existing) {
      await db.lead.create({ data: leadData })
    }
  }
  console.log('✅ Sample leads created')

  // Create sample tasks
  const leads = await db.lead.findMany({ take: 3 })
  if (leads.length > 0) {
    const existingTasks = await db.task.count()
    if (existingTasks === 0) {
      const tasks = [
        { title: 'Follow up call with Rahul', description: 'Discuss MBA Finance program details', dueDate: new Date(Date.now() + 86400000), priority: 'HIGH', leadId: leads[0]?.id, userId: admin.id },
        { title: 'Send application form to Anjali', dueDate: new Date(Date.now() + 172800000), priority: 'MEDIUM', leadId: leads[1]?.id, userId: counsellor.id },
        { title: 'Schedule campus tour for Vikram', dueDate: new Date(Date.now() + 259200000), priority: 'LOW', leadId: leads[2]?.id, userId: admin.id },
      ]

      for (const task of tasks) {
        await db.task.create({ data: task })
      }
      console.log('✅ Sample tasks created')
    } else {
      console.log('⏭️  Tasks already exist, skipping')
    }
  }

  console.log('🎉 Seeding complete!')
  await db.$disconnect()
  process.exit(0)
}

seed().catch(async e => {
  console.error('❌ Seed failed:', e)
  await db.$disconnect()
  process.exit(1)
})
