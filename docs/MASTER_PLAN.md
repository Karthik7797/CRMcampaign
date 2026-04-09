# 🚀 EDUCATION CRM + LANDING PAGES — COMPLETE MASTER PLAN
## Industry-Standard. Copy-Paste Ready. Build with VSCode + Ollama/Claude.

---

## 📁 FULL PROJECT STRUCTURE
supabse: 62g%u7PyU!FeWT5
```
edu-crm/
├── backend/                    # Node.js + Fastify API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.service.js
│   │   │   ├── leads/
│   │   │   │   ├── leads.routes.js
│   │   │   │   ├── leads.controller.js
│   │   │   │   └── leads.service.js
│   │   │   ├── pipeline/
│   │   │   │   ├── pipeline.routes.js
│   │   │   │   └── pipeline.controller.js
│   │   │   ├── tasks/
│   │   │   │   └── tasks.routes.js
│   │   │   ├── communications/
│   │   │   │   └── comms.routes.js
│   │   │   └── analytics/
│   │   │       └── analytics.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── cors.middleware.js
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
│
├── crm-frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Table.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leads.tsx
│   │   │   ├── Pipeline.tsx
│   │   │   ├── Communications.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Login.tsx
│   │   ├── store/
│   │   │   └── useStore.ts     # Zustand global state
│   │   ├── api/
│   │   │   └── client.ts       # Axios API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
└── landing-pages/              # Next.js 14
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            # Landing Page 1 (main)
    │   ├── engineering/
    │   │   └── page.tsx        # Landing Page 2
    │   ├── mba/
    │   │   └── page.tsx        # Landing Page 3
    │   └── scholarship/
    │       └── page.tsx        # Landing Page 4
    ├── components/
    │   ├── LeadForm.tsx        # Reusable form → hits backend API
    │   ├── Navbar.tsx
    │   └── Footer.tsx
    ├── lib/
    │   └── api.ts
    ├── next.config.js
    └── package.json
```

---

## STEP 1 — BACKEND SETUP

### `backend/package.json`

```json
{
  "name": "edu-crm-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/jwt": "^8.0.1",
    "@prisma/client": "^5.14.0",
    "bcryptjs": "^2.4.3",
    "fastify": "^4.28.1",
    "nodemailer": "^6.9.14",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.3",
    "prisma": "^5.14.0"
  }
}
```

### `backend/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/edu_crm"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
FRONTEND_URL="http://localhost:5173"
LANDING_URL="http://localhost:3000"
```

---

### `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String
  role         Role     @default(COUNSELLOR)
  avatar       String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  leads        Lead[]   @relation("AssignedLeads")
  tasks        Task[]
  activities   Activity[]
}

enum Role {
  ADMIN
  MANAGER
  COUNSELLOR
  MARKETING
}

model Lead {
  id            String       @id @default(cuid())
  name          String
  email         String
  phone         String
  course        String?
  source        LeadSource   @default(WEBSITE)
  landingPage   String?      // which landing page they came from
  status        LeadStatus   @default(NEW)
  priority      Priority     @default(MEDIUM)
  notes         String?
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  city          String?
  qualification String?
  assignedTo    User?        @relation("AssignedLeads", fields: [assignedToId], references: [id])
  assignedToId  String?
  pipelineStage PipelineStage @default(ENQUIRY)
  activities    Activity[]
  tasks         Task[]
  communications Communication[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum LeadSource {
  WEBSITE
  LANDING_PAGE_MBA
  LANDING_PAGE_ENGINEERING
  LANDING_PAGE_SCHOLARSHIP
  LANDING_PAGE_ONLINE
  FACEBOOK
  GOOGLE
  INSTAGRAM
  REFERRAL
  WALK_IN
  PHONE
  EMAIL
  OTHER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  NURTURING
  CONVERTED
  LOST
  JUNK
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum PipelineStage {
  ENQUIRY
  CONTACTED
  APPLICATION_SENT
  APPLICATION_RECEIVED
  UNDER_REVIEW
  SHORTLISTED
  ENROLLED
  DROPPED
}

model Activity {
  id        String   @id @default(cuid())
  type      String   // CALL, EMAIL, NOTE, STATUS_CHANGE, etc.
  content   String
  lead      Lead     @relation(fields: [leadId], references: [id])
  leadId    String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  createdAt DateTime @default(now())
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  completed   Boolean    @default(false)
  priority    Priority   @default(MEDIUM)
  lead        Lead?      @relation(fields: [leadId], references: [id])
  leadId      String?
  assignedTo  User       @relation(fields: [userId], references: [id])
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Communication {
  id        String   @id @default(cuid())
  type      CommType
  subject   String?
  content   String
  status    String   @default("SENT")
  lead      Lead     @relation(fields: [leadId], references: [id])
  leadId    String
  createdAt DateTime @default(now())
}

enum CommType {
  EMAIL
  SMS
  WHATSAPP
  CALL
  NOTE
}
```

---

### `backend/src/server.js`

```js
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './modules/auth/auth.routes.js'
import { leadsRoutes } from './modules/leads/leads.routes.js'
import { pipelineRoutes } from './modules/pipeline/pipeline.routes.js'
import { analyticsRoutes } from './modules/analytics/analytics.routes.js'
import { tasksRoutes } from './modules/tasks/tasks.routes.js'
import { commsRoutes } from './modules/communications/comms.routes.js'

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, {
  origin: [
    process.env.FRONTEND_URL,
    process.env.LANDING_URL,
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
})

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

// Routes
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(leadsRoutes, { prefix: '/api/leads' })
await app.register(pipelineRoutes, { prefix: '/api/pipeline' })
await app.register(analyticsRoutes, { prefix: '/api/analytics' })
await app.register(tasksRoutes, { prefix: '/api/tasks' })
await app.register(commsRoutes, { prefix: '/api/communications' })

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 4000, host: '0.0.0.0' })
    console.log(`🚀 Server running on port ${process.env.PORT || 4000}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
```

---

### `backend/src/config/db.js`

```js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

### `backend/src/middleware/auth.middleware.js`

```js
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
```

---

### `backend/src/modules/auth/auth.routes.js`

```js
import { login, register, me } from './auth.controller.js'
import { authenticate } from '../../middleware/auth.middleware.js'

export async function authRoutes(app) {
  app.post('/login', login)
  app.post('/register', register)
  app.get('/me', { preHandler: [authenticate] }, me)
}
```

---

### `backend/src/modules/auth/auth.service.js`

```js
import bcrypt from 'bcryptjs'
import { db } from '../../config/db.js'

export async function createUser({ name, email, password, role }) {
  const hashed = await bcrypt.hash(password, 10)
  return db.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  })
}

export async function findUserByEmail(email) {
  return db.user.findUnique({ where: { email } })
}

export async function validatePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed)
}
```

---

### `backend/src/modules/auth/auth.controller.js`

```js
import { createUser, findUserByEmail, validatePassword } from './auth.service.js'
import { db } from '../../config/db.js'

export async function login(request, reply) {
  const { email, password } = request.body
  const user = await findUserByEmail(email)
  if (!user) return reply.status(401).send({ error: 'Invalid credentials' })

  const valid = await validatePassword(password, user.password)
  if (!valid) return reply.status(401).send({ error: 'Invalid credentials' })

  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' }
  )
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

export async function register(request, reply) {
  const { name, email, password, role } = request.body
  try {
    const user = await createUser({ name, email, password, role })
    const token = request.server.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    )
    return reply.status(201).send({ token, user })
  } catch (err) {
    if (err.code === 'P2002') return reply.status(409).send({ error: 'Email already exists' })
    throw err
  }
}

export async function me(request, reply) {
  const user = await db.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  })
  return user
}
```

---

### `backend/src/modules/leads/leads.routes.js`

```js
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
```

---

### `backend/src/modules/leads/leads.controller.js`

```js
import { db } from '../../config/db.js'

// PUBLIC endpoint — called from landing pages
export async function publicCreateLead(request, reply) {
  const { name, email, phone, course, landingPage, utmSource, utmMedium, utmCampaign, city, qualification } = request.body

  if (!name || !email || !phone) {
    return reply.status(400).send({ error: 'Name, email and phone are required' })
  }

  // Map landing page to source enum
  const sourceMap = {
    'mba': 'LANDING_PAGE_MBA',
    'engineering': 'LANDING_PAGE_ENGINEERING',
    'scholarship': 'LANDING_PAGE_SCHOLARSHIP',
    'online': 'LANDING_PAGE_ONLINE',
  }
  const source = sourceMap[landingPage] || 'LANDING_PAGE_MBA'

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

  return reply.status(201).send({ success: true, leadId: lead.id })
}

export async function getLeads(request, reply) {
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

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where, skip, take: parseInt(limit),
      include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    db.lead.count({ where }),
  ])

  return { leads, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
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
  return lead
}

export async function createLead(request, reply) {
  const lead = await db.lead.create({
    data: { ...request.body, assignedToId: request.user.id }
  })
  return reply.status(201).send(lead)
}

export async function updateLead(request, reply) {
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
```

---

### `backend/src/modules/analytics/analytics.routes.js`

```js
import { authenticate } from '../../middleware/auth.middleware.js'
import { db } from '../../config/db.js'

export async function analyticsRoutes(app) {
  app.get('/overview', { preHandler: [authenticate] }, async (req, reply) => {
    const [
      totalLeads, newLeads, converted, bySource, byStatus, byStage, recentLeads
    ] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: 'NEW' } }),
      db.lead.count({ where: { status: 'CONVERTED' } }),
      db.lead.groupBy({ by: ['source'], _count: true }),
      db.lead.groupBy({ by: ['status'], _count: true }),
      db.lead.groupBy({ by: ['pipelineStage'], _count: true }),
      db.lead.findMany({
        orderBy: { createdAt: 'desc' }, take: 10,
        include: { assignedTo: { select: { name: true } } }
      })
    ])

    const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0

    return { totalLeads, newLeads, converted, conversionRate, bySource, byStatus, byStage, recentLeads }
  })
}
```

---

## STEP 2 — CRM FRONTEND SETUP

### `crm-frontend/package.json`

```json
{
  "name": "edu-crm-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.45.1",
    "axios": "^1.7.2",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.395.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.24.0",
    "recharts": "^2.12.7",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.3.1"
  }
}
```

---

### `crm-frontend/tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#0f172a',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,.15)',
      }
    },
  },
  plugins: [],
} satisfies Config
```

---

### `crm-frontend/src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
      }} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

---

### `crm-frontend/src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --sidebar-width: 260px;
}

* { box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }

@layer components {
  .card {
    @apply bg-surface-800 border border-surface-700 rounded-xl p-6 shadow-card;
  }
  .btn-primary {
    @apply bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg
           transition-all duration-200 hover:shadow-lg active:scale-95 text-sm;
  }
  .btn-secondary {
    @apply bg-surface-700 hover:bg-surface-600 text-slate-200 font-medium px-4 py-2 rounded-lg
           transition-all duration-200 border border-surface-600 text-sm;
  }
  .input {
    @apply bg-surface-800 border border-surface-600 text-slate-100 rounded-lg px-3 py-2 w-full
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
           placeholder:text-slate-500 text-sm transition-all;
  }
  .badge-new { @apply bg-blue-500/15 text-blue-400 border border-blue-500/25; }
  .badge-contacted { @apply bg-yellow-500/15 text-yellow-400 border border-yellow-500/25; }
  .badge-qualified { @apply bg-purple-500/15 text-purple-400 border border-purple-500/25; }
  .badge-converted { @apply bg-green-500/15 text-green-400 border border-green-500/25; }
  .badge-lost { @apply bg-red-500/15 text-red-400 border border-red-500/25; }
  .badge-nurturing { @apply bg-orange-500/15 text-orange-400 border border-orange-500/25; }
}
```

---

### `crm-frontend/src/api/client.ts`

```ts
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// API functions
export const leadsApi = {
  getAll: (params?: Record<string, any>) => api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  assign: (id: string, userId: string) => api.post(`/leads/${id}/assign`, { userId }),
}

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
}

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}
```

---

### `crm-frontend/src/store/useStore.ts`

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AppState {
  user: User | null
  token: string | null
  sidebarOpen: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  toggleSidebar: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarOpen: true,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('crm_token', token)
        set({ token })
      },
      logout: () => {
        localStorage.removeItem('crm_token')
        set({ user: null, token: null })
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'crm-store', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
```

---

### `crm-frontend/src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import Communications from './pages/Communications'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="communications" element={<Communications />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

---

### `crm-frontend/src/components/layout/Sidebar.tsx`

```tsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, GitBranch, MessageSquare,
  CheckSquare, BarChart3, Settings, LogOut, Zap, X
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { to: '/communications', icon: MessageSquare, label: 'Communications' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout, sidebarOpen, toggleSidebar } = useStore()

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full z-30 flex flex-col',
        'bg-surface-900 border-r border-surface-700',
        'transition-transform duration-300',
        'w-[260px]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-display">EduCRM</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Enrollment Suite</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
              )}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-surface-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
```

---

### `crm-frontend/src/components/layout/TopBar.tsx`

```tsx
import { Menu, Bell, Search, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useState } from 'react'

export default function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm
                       flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-64 h-9 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-primary flex items-center gap-1.5 h-9">
          <Plus size={15} /> New Lead
        </button>
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
```

---

### `crm-frontend/src/components/layout/Layout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

export default function Layout() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-surface-900 flex">
      <Sidebar />
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        'lg:ml-[260px]'
      )}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}
```

> **Note:** Run `npm install clsx tailwind-merge` in crm-frontend

---

### `crm-frontend/src/pages/Login.tsx`

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/client'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard')
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        bg-brand-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">EduCRM</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-700">
            <p className="text-xs text-slate-500 text-center">
              Demo: <span className="text-slate-400">admin@demo.com / demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Dashboard.tsx`

```tsx
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/client'
import { Users, TrendingUp, UserCheck, AlertCircle, ArrowUp, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatRelativeTime } from '../lib/utils'

const statCards = (data: any) => [
  { label: 'Total Leads', value: data?.totalLeads ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
  { label: 'New Leads', value: data?.newLeads ?? 0, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '+8%' },
  { label: 'Converted', value: data?.converted ?? 0, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10', trend: '+23%' },
  { label: 'Conversion Rate', value: `${data?.conversionRate ?? 0}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+2.4%' },
]

const mockChartData = [
  { month: 'Jan', leads: 45, converted: 12 },
  { month: 'Feb', leads: 62, converted: 18 },
  { month: 'Mar', leads: 78, converted: 24 },
  { month: 'Apr', leads: 55, converted: 16 },
  { month: 'May', leads: 91, converted: 31 },
  { month: 'Jun', leads: 104, converted: 38 },
]

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.overview().then(r => r.data),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-display">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-0.5">Track your enrollment performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map((stat) => (
          <div key={stat.label} className="card hover:border-surface-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUp size={12} /> {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-display">
              {isLoading ? '—' : stat.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Trend */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Lead Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#colorLeads)" strokeWidth={2} name="Leads" />
              <Area type="monotone" dataKey="converted" stroke="#10b981" fill="url(#colorConverted)" strokeWidth={2} name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">By Source</h3>
          {data?.bySource?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bySource.slice(0, 6)} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis type="category" dataKey="source" stroke="#475569" fontSize={9} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="_count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Leads</h3>
          <a href="/leads" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
        </div>
        <div className="space-y-2">
          {data?.recentLeads?.slice(0, 6).map((lead: any) => (
            <div key={lead.id} className="flex items-center justify-between py-2.5 border-b border-surface-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {lead.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full border badge-${lead.status.toLowerCase()}`}>
                  {lead.status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} /> {formatRelativeTime(lead.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {!data?.recentLeads?.length && (
            <p className="text-sm text-slate-500 text-center py-8">No leads yet. Forms on landing pages will populate here.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Leads.tsx`

```tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'
import { Search, Filter, Plus, Phone, Mail, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatRelativeTime } from '../lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST']
const SOURCE_OPTIONS = ['ALL', 'LANDING_PAGE_MBA', 'LANDING_PAGE_ENGINEERING', 'LANDING_PAGE_SCHOLARSHIP', 'WEBSITE', 'FACEBOOK', 'GOOGLE']

export default function Leads() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [source, setSource] = useState('ALL')
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { search, status, source, page }],
    queryFn: () => leadsApi.getAll({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      source: source === 'ALL' ? undefined : source,
      page,
      limit: 20,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => leadsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead updated')
    },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Leads</h2>
          <p className="text-slate-400 text-sm">{data?.total ?? 0} total leads</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className="input pl-9 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input h-9 w-auto min-w-[140px]"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          className="input h-9 w-auto min-w-[180px]"
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(1) }}
        >
          {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                {['Lead', 'Contact', 'Course', 'Source', 'Status', 'Assigned', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface-700 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.leads?.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1.5"><Mail size={11} /> {lead.email}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} /> {lead.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{lead.course || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-surface-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {lead.source?.replace('LANDING_PAGE_', '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`text-xs px-2 py-1 rounded-full border cursor-pointer bg-transparent badge-${lead.status.toLowerCase()}`}
                      value={lead.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateMutation.mutate({ id: lead.id, data: { status: e.target.value } })}
                    >
                      {['NEW','CONTACTED','QUALIFIED','NURTURING','CONVERTED','LOST','JUNK'].map(s => (
                        <option key={s} value={s} className="bg-surface-800 text-slate-200">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {lead.assignedTo.name[0]}
                        </div>
                        <span className="text-xs text-slate-300">{lead.assignedTo.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !data?.leads?.length && (
            <div className="text-center py-16 text-slate-500 text-sm">No leads found</div>
          )}
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700">
            <p className="text-xs text-slate-400">
              Page {data.page} of {data.totalPages} · {data.total} leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary h-8 px-3 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-secondary h-8 px-3 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Pipeline.tsx`

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/client'

const STAGES = [
  { key: 'ENQUIRY', label: 'Enquiry', color: 'border-blue-500' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-yellow-500' },
  { key: 'APPLICATION_SENT', label: 'App Sent', color: 'border-orange-500' },
  { key: 'APPLICATION_RECEIVED', label: 'App Received', color: 'border-purple-500' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-cyan-500' },
  { key: 'ENROLLED', label: 'Enrolled', color: 'border-green-500' },
]

export default function Pipeline() {
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['leads', { limit: 200 }],
    queryFn: () => leadsApi.getAll({ limit: 200 }).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, stage }: any) => leadsApi.update(id, { pipelineStage: stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })

  const leadsByStage = (stage: string) =>
    data?.leads?.filter((l: any) => l.pipelineStage === stage) ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Pipeline</h2>
        <p className="text-slate-400 text-sm">Drag leads through enrollment stages</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const leads = leadsByStage(key)
          return (
            <div key={key} className="flex-shrink-0 w-64">
              <div className={`card border-t-2 ${color} p-0`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</h3>
                  <span className="text-xs bg-surface-700 text-slate-400 px-2 py-0.5 rounded-full">{leads.length}</span>
                </div>
                <div className="p-2 space-y-2 max-h-[65vh] overflow-y-auto">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="bg-surface-900 border border-surface-600 rounded-lg p-3
                                                   hover:border-surface-500 transition-all cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {lead.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-200">{lead.name}</p>
                          <p className="text-[10px] text-slate-500">{lead.course || 'No course'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {STAGES.filter(s => s.key !== key).slice(0, 3).map(s => (
                          <button
                            key={s.key}
                            onClick={() => updateMutation.mutate({ id: lead.id, stage: s.key })}
                            className="text-[10px] text-slate-400 hover:text-brand-400 bg-surface-700 hover:bg-surface-600 px-1.5 py-0.5 rounded transition-colors"
                          >
                            → {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs">No leads here</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## STEP 3 — LANDING PAGES (Next.js)

### `landing-pages/package.json`

```json
{
  "name": "edu-landing-pages",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.4",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

### `landing-pages/lib/api.ts`

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function submitLead(formData: {
  name: string
  email: string
  phone: string
  course?: string
  city?: string
  qualification?: string
  landingPage: string
}) {
  const res = await fetch(`${API_URL}/leads/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (!res.ok) throw new Error('Failed to submit')
  return res.json()
}
```

---

### `landing-pages/components/LeadForm.tsx`

```tsx
'use client'
import { useState } from 'react'
import { submitLead } from '../lib/api'

interface LeadFormProps {
  landingPage: string
  courses: string[]
  buttonText?: string
  formTitle?: string
}

export default function LeadForm({ landingPage, courses, buttonText = 'Apply Now', formTitle = 'Get Free Counselling' }: LeadFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', city: '', qualification: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await submitLead({ ...form, landingPage })
      setStatus('success')
      setForm({ name: '', email: '', phone: '', course: '', city: '', qualification: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">Application Received!</h3>
        <p className="text-white/70 text-sm">Our counsellor will contact you within 24 hours.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-white/60 hover:text-white underline">
          Submit another
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-5">{formTitle}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input name="name" type="text" placeholder="Your Full Name *" value={form.name} onChange={handleChange} required
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all" />
        </div>
        <div>
          <input name="email" type="email" placeholder="Email Address *" value={form.email} onChange={handleChange} required
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all" />
        </div>
        <div>
          <input name="phone" type="tel" placeholder="Phone Number *" value={form.phone} onChange={handleChange} required
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all" />
        </div>
        <div>
          <select name="course" value={form.course} onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 transition-all">
            <option value="" className="bg-slate-800">Select Course</option>
            {courses.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 transition-all" />
          <select name="qualification" value={form.qualification} onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 transition-all">
            <option value="" className="bg-slate-800">Qualification</option>
            <option value="10th" className="bg-slate-800">10th</option>
            <option value="12th" className="bg-slate-800">12th</option>
            <option value="Graduate" className="bg-slate-800">Graduate</option>
            <option value="Post Graduate" className="bg-slate-800">Post Graduate</option>
          </select>
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl text-sm
                     hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60
                     shadow-lg shadow-white/20">
          {status === 'loading' ? 'Submitting...' : buttonText}
        </button>

        {status === 'error' && (
          <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
        )}

        <p className="text-white/40 text-[11px] text-center">
          By submitting, you agree to be contacted by our counsellors.
        </p>
      </form>
    </div>
  )
}
```

---

### `landing-pages/app/page.tsx` — Landing Page 1: MBA Programs

```tsx
import LeadForm from '../components/LeadForm'

export const metadata = { title: 'MBA Programs 2025 | Top Business School', description: 'Apply for MBA programs...' }

export default function MBAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <span className="text-white font-bold">EduInstitute</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#" className="hover:text-white">Programs</a>
          <a href="#" className="hover:text-white">Campus</a>
          <a href="#" className="hover:text-white">Placements</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
        <a href="/engineering" className="text-sm text-blue-300 hover:text-white border border-blue-500/40 px-4 py-1.5 rounded-full transition-colors">
          Engineering →
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" /> Admissions Open 2025–26
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Transform Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Career with MBA
            </span>
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
            Join 5,000+ alumni in top Fortune 500 companies. AICTE approved, NAAC A+ accredited with 100% placement record.
          </p>
          <div className="flex flex-wrap gap-6 mb-8">
            {[['98%', 'Placement Rate'], ['₹18L', 'Avg Package'], ['200+', 'Recruiters'], ['2 Yr', 'Program']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-black text-white">{val}</div>
                <div className="text-xs text-white/50">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {['Finance', 'Marketing', 'Operations', 'HR', 'Business Analytics', 'International Business'].map(sp => (
              <span key={sp} className="text-xs bg-white/10 border border-white/15 text-white/70 px-3 py-1.5 rounded-full">{sp}</span>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="mba"
            courses={['MBA Finance', 'MBA Marketing', 'MBA Operations', 'MBA HR', 'MBA Business Analytics', 'MBA International Business']}
            buttonText="Apply for MBA 2025"
            formTitle="Get Free Career Counselling"
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-white/40 text-sm mb-6">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/50 text-sm font-medium">
            {['IIT Delhi', 'Delhi University', 'Pune University', 'Bangalore University', 'Mumbai University', 'Osmania University'].map(u => (
              <span key={u}>{u}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="py-8 px-6 text-center">
        <p className="text-white/30 text-xs">© 2025 EduInstitute. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-white/30">
          <a href="/mba" className="hover:text-white/60">MBA</a>
          <a href="/engineering" className="hover:text-white/60">Engineering</a>
          <a href="/scholarship" className="hover:text-white/60">Scholarship</a>
          <a href="/online" className="hover:text-white/60">Online</a>
        </div>
      </footer>
    </main>
  )
}
```

---

### `landing-pages/app/engineering/page.tsx` — Landing Page 2

```tsx
import LeadForm from '../../components/LeadForm'

export const metadata = { title: 'B.Tech / M.Tech 2025 | Engineering Programs' }

export default function EngineeringPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a1628 100%)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-white font-bold">EduInstitute</span>
        <a href="/" className="text-sm text-cyan-400 hover:text-white">← Back to MBA</a>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" /> Limited Seats Available
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Build the<br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Future with<br />Engineering
            </span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-lg">
            NIRF ranked Top 50 engineering institution. State-of-the-art labs, industry tie-ups with Google, Microsoft, and ISRO.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              ['B.Tech', '4-year undergraduate program'],
              ['M.Tech', '2-year postgraduate program'],
              ['8 Branches', 'From CS to Mechanical'],
              ['₹12L+', 'Average CTC package'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-base font-bold text-cyan-400">{title}</div>
                <div className="text-xs text-white/50 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="engineering"
            courses={['B.Tech Computer Science', 'B.Tech AI & ML', 'B.Tech ECE', 'B.Tech Mechanical', 'B.Tech Civil', 'M.Tech CSE', 'M.Tech VLSI']}
            buttonText="Apply for Engineering 2025"
            formTitle="Enquire About Admissions"
          />
        </div>
      </section>
    </main>
  )
}
```

---

### `landing-pages/app/scholarship/page.tsx` — Landing Page 3

```tsx
import LeadForm from '../../components/LeadForm'

export const metadata = { title: 'Scholarship Programs 2025 | Up to 100% Fee Waiver' }

export default function ScholarshipPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #0d0b1e 0%, #1a0a2e 50%, #0d1b2a 100%)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-white font-bold">EduInstitute</span>
        <a href="/" className="text-sm text-purple-400 hover:text-white">← Home</a>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full mb-6">
            🎓 Scholarship Applications Open
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Unlock Your<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Full Scholarship
            </span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-lg">
            Merit-based scholarships up to 100% fee waiver. Apply before 31st August 2025.
          </p>
          <div className="space-y-3 mb-8">
            {[
              ['Merit Scholarship', 'Up to 100% waiver for top rankers', 'bg-purple-500'],
              ['Need-based Aid', 'Up to 75% for economically weaker sections', 'bg-pink-500'],
              ['Sports Quota', 'Up to 50% for national/state players', 'bg-blue-500'],
            ].map(([name, desc, color]) => (
              <div key={name} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className={`w-2 h-2 rounded-full ${color} mt-2 shrink-0`} />
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="scholarship"
            courses={['MBA', 'B.Tech', 'BBA', 'BCA', 'MCA', 'M.Tech']}
            buttonText="Apply for Scholarship"
            formTitle="Check Your Eligibility"
          />
        </div>
      </section>
    </main>
  )
}
```

---

### `landing-pages/app/online/page.tsx` — Landing Page 4

```tsx
import LeadForm from '../../components/LeadForm'

export const metadata = { title: 'Online Degree Programs 2025 | Learn from Anywhere' }

export default function OnlinePage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #001a0d 0%, #002a1a 50%, #001020 100%)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-white font-bold">EduInstitute</span>
        <a href="/" className="text-sm text-green-400 hover:text-white">← Home</a>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-300 text-xs px-3 py-1.5 rounded-full mb-6">
            🌐 UGC-DEB Approved Online Programs
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Study Online,<br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Earn Real Degree
            </span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-lg">
            UGC approved online degrees from top-tier institution. EMI options available. Industry mentors included.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {['Live Classes', 'Recorded Lectures', 'Industry Projects', 'Career Support', 'EMI Available', 'Certificate on Completion'].map(f => (
              <span key={f} className="text-xs bg-white/5 border border-green-500/20 text-green-300/70 px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="online"
            courses={['Online MBA', 'Online BBA', 'Online MCA', 'Online BCA', 'Online M.Com', 'Online B.Com']}
            buttonText="Enroll Online Today"
            formTitle="Start Your Online Journey"
          />
        </div>
      </section>
    </main>
  )
}
```

---

## STEP 4 — SETUP & RUN COMMANDS

### 1. Install & Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup .env (copy the .env template above)
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Init Prisma
npx prisma init
# Replace prisma/schema.prisma with the schema above

# Push schema to database
npx prisma db push

# Create initial admin user (run once)
node -e "
import('./src/config/db.js').then(({db}) =>
  import('bcryptjs').then(bcrypt =>
    db.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: bcrypt.hashSync('demo123', 10),
        role: 'ADMIN'
      }
    }).then(u => { console.log('Created:', u.email); process.exit() })
  )
)
"

# Start dev server
npm run dev
# Backend runs on http://localhost:4000
```

---

### 2. Install & Setup CRM Frontend

```bash
cd crm-frontend

# Install deps
npm install

# Install extra utilities
npm install clsx tailwind-merge

# Create .env
echo "VITE_API_URL=http://localhost:4000/api" > .env

# Init Tailwind
npx tailwindcss init -p
# Replace tailwind.config.ts with the one above

# Start dev
npm run dev
# CRM runs on http://localhost:5173
```

---

### 3. Install & Setup Landing Pages

```bash
cd landing-pages

# Install
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

# Start
npm run dev
# Landing pages run on http://localhost:3000
```

---

## STEP 5 — REMAINING PAGES (stubs to complete)

### `crm-frontend/src/pages/Tasks.tsx` — Quick Stub

```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { CheckSquare, Plus, Clock } from 'lucide-react'
import { formatDate } from '../lib/utils'

export default function Tasks() {
  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Tasks</h2>
          <p className="text-slate-400 text-sm">Manage follow-ups and reminders</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5"><Plus size={15} /> New Task</button>
      </div>
      <div className="card">
        <p className="text-slate-500 text-sm text-center py-12">Tasks module — connect to /api/tasks endpoint</p>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Analytics.tsx` — Quick Stub

```tsx
import { BarChart3 } from 'lucide-react'

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Analytics</h2>
        <p className="text-slate-400 text-sm">Deep dive into enrollment metrics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card h-64 flex items-center justify-center text-slate-500 text-sm">
          <div className="text-center">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
            Campaign ROI Chart
          </div>
        </div>
        <div className="card h-64 flex items-center justify-center text-slate-500 text-sm">
          <div className="text-center">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
            Counsellor Performance
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Communications.tsx` — Quick Stub

```tsx
import { MessageSquare } from 'lucide-react'

export default function Communications() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Communications</h2>
        <p className="text-slate-400 text-sm">Email, SMS and WhatsApp history</p>
      </div>
      <div className="card flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="text-center">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
          Communications log — connect to /api/communications endpoint
        </div>
      </div>
    </div>
  )
}
```

---

### `crm-frontend/src/pages/Settings.tsx` — Quick Stub

```tsx
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white font-display">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['User Management', 'Roles & Permissions', 'Email Templates', 'Lead Sources', 'Pipeline Stages', 'Integrations'].map(s => (
          <div key={s} className="card hover:border-surface-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-surface-700 rounded-lg flex items-center justify-center">
                <SettingsIcon size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{s}</p>
                <p className="text-xs text-slate-500">Configure {s.toLowerCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## STEP 6 — ENVIRONMENT & DEPLOYMENT

### `.env` Files Summary

**backend/.env**
```
DATABASE_URL="postgresql://user:pass@localhost:5432/edu_crm"
JWT_SECRET="change-this-to-a-random-64-char-string"
PORT=4000
FRONTEND_URL="http://localhost:5173"
LANDING_URL="http://localhost:3000"
```

**crm-frontend/.env**
```
VITE_API_URL=http://localhost:4000/api
```

**landing-pages/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## STEP 7 — QUICK ARCHITECTURE SUMMARY

```
LEAD FLOW:
Landing Page Form  →  POST /api/leads/public  →  PostgreSQL  →  CRM Dashboard

CRM FLOW:
Login  →  JWT Token  →  Protected Routes  →  Full CRUD on Leads/Tasks/Pipeline

3 TERMINALS TO RUN:
1. cd backend && npm run dev          → :4000
2. cd crm-frontend && npm run dev     → :5173
3. cd landing-pages && npm run dev    → :3000
```

---

## NOTES FOR OLLAMA/AI ASSISTANCE

When prompting your local AI (Ollama) to expand any section, use this pattern:

```
You are a senior full-stack engineer (15 years experience).
Complete this [module name] for an Education CRM built with:
- Backend: Node.js + Fastify + Prisma + PostgreSQL
- Frontend: React + Vite + TypeScript + TailwindCSS
- Design: Dark theme (#0f172a bg, #1e293b surface, #2563eb brand)
- API base: http://localhost:4000/api

Current code context:
[paste existing file]

Task: [what you want added/fixed]

Return ONLY complete, working TypeScript/JavaScript code.
```

---

*Total estimated build time with AI assistance: 2–3 days for full featured MVP*
