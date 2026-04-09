# 📋 Quick Reference Card - EduCRM

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
npm install              # First time setup
npm run dev              # Start development server
npm start                # Start production server
npx prisma studio        # Open database GUI
npx prisma db push       # Sync schema to database
```

### Frontend
```bash
cd crm-frontend
npm install              # First time setup
npm run dev              # Start development server (port 5173)
npm run build            # Build for production
```

---

## 🔗 Important URLs

### Production
- **Frontend**: https://cr-mcampaign-3irx.vercel.app
- **Backend**: https://crm-backend-4rq2.onrender.com
- **Backend Health**: https://crm-backend-4rq2.onrender.com/health
- **DB Health**: https://crm-backend-4rq2.onrender.com/health/db

### Local Development
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555

---

## 📊 API Endpoints Reference

### Authentication
```
POST   /api/auth/login          # Login
GET    /api/auth/me             # Get current user
```

### Leads
```
GET    /api/leads               # Get all leads
GET    /api/leads/:id           # Get single lead
POST   /api/leads               # Create lead
PUT    /api/leads/:id           # Update lead
DELETE /api/leads/:id           # Delete lead
POST   /api/leads/:id/assign    # Assign to user
POST   /api/leads/public        # Public form (no auth)
```

### Other Modules
```
GET    /api/pipeline/stages     # Get pipeline stages
PUT    /api/pipeline/:id/stage  # Move lead stage
GET    /api/analytics/overview  # Dashboard stats
GET    /api/tasks               # Get tasks
POST   /api/tasks               # Create task
GET    /api/communications      # Get communications
GET    /api/users               # Get users (Admin)
```

---

## 🔐 Default Credentials (After Seeding)

```
Email: admin@educrm.com
Password: admin123
Role: ADMIN
```

⚠️ **Change these in production!**

---

## 📁 Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://your-frontend.vercel.app"
```

### Frontend (.env)
```bash
VITE_API_URL="https://your-backend.onrender.com/api"
```

---

## 🎯 Role Permissions Quick Reference

| Feature | ADMIN | MANAGER | MARKETING | COUNSELLOR |
|---------|-------|---------|-----------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Leads (All) | ✅ | ✅ | ✅ | ❌ |
| Leads (Own) | ✅ | ✅ | ✅ | ✅ |
| Create Lead | ✅ | ✅ | ❌ | ✅ |
| Edit Lead | ✅ | ✅ | ❌ | ✅ |
| Delete Lead | ✅ | ❌ | ❌ | ❌ |
| Pipeline | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |

---

## 🐛 Common Issues & Quick Fixes

### 500 Internal Server Error
```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check Render logs
# Dashboard → Logs tab

# Verify DATABASE_URL is correct
```

### 401 Unauthorized
```bash
# Token expired - login again
# Check localStorage: crm_token
# Verify JWT_SECRET matches
```

### 403 Forbidden
```bash
# Check user role in database
# Use Prisma Studio to verify
# Contact admin for role upgrade
```

### CORS Errors
```bash
# Add frontend URL to backend CORS config
# Check server.js → cors origin array
# Restart backend server
```

### No Data Showing
```bash
# Check database has records
npx prisma studio

# Remove all filters
# Check assignedTo filter (Counsellors)
```

---

## 🔍 Debugging Commands

### Check Database
```bash
cd backend
npx prisma studio          # GUI for database
npx prisma db push         # Sync schema
npm run db:seed            # Seed sample data
```

### Check Backend Logs
```bash
# Local
npm run dev                # Shows logs in terminal

# Production (Render)
# Dashboard → Logs tab
```

### Check Frontend
```bash
# Open DevTools (F12)
# Console tab - check for errors
# Network tab - check API calls
# Application → Local Storage - check token
```

---

## 📈 Database Schema Quick View

### Main Tables
- **Lead** - Customer leads with status, source, pipeline stage
- **User** - System users (Admin, Manager, Counsellor, Marketing)
- **Activity** - Interactions with leads
- **Task** - Tasks assigned to users
- **Communication** - Email/SMS/WhatsApp logs

### Key Enums
- **LeadSource**: WEBSITE, LANDING_PAGE_*, FACEBOOK, GOOGLE, etc.
- **LeadStatus**: NEW, CONTACTED, QUALIFIED, NURTURING, CONVERTED, LOST, JUNK
- **PipelineStage**: ENQUIRY, CONTACTED, DEMO, UNIVERSITY_SELECTION, etc.
- **Role**: ADMIN, MANAGER, MARKETING, COUNSELLOR

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Zustand (state)
- React Query (data fetching)
- Axios (HTTP client)
- Tailwind CSS (styling)
- Lucide Icons
- React Router

### Backend
- Node.js
- Fastify (framework)
- Prisma (ORM)
- PostgreSQL (database)
- JWT (authentication)
- bcrypt (password hashing)

### Deployment
- Vercel (frontend)
- Render (backend + database)

---

## 📞 Quick Health Checks

```bash
# Backend health
curl https://crm-backend-4rq2.onrender.com/health

# Database health
curl https://crm-backend-4rq2.onrender.com/health/db

# Expected response:
# {"status":"ok","database":"connected"}
```

---

## 📝 File Locations

### Backend
```
backend/
├── prisma/schema.prisma      # Database schema
├── src/server.js             # Main server file
├── src/config/db.js          # Database config
├── src/config/rbac.config.js # Permissions
├── src/middleware/auth.js    # Auth middleware
└── src/modules/              # Feature modules
```

### Frontend
```
crm-frontend/
├── src/App.tsx               # Main app
├── src/api/client.ts         # API client
├── src/store/useStore.ts     # State management
├── src/lib/permissions.ts    # RBAC logic
├── src/pages/                # All pages
└── src/components/           # Reusable components
```

---

## ⚡ Performance Tips

### Frontend
- React Query caches data automatically
- Pagination: 20 items per page
- Debounce search inputs
- Lazy load routes

### Backend
- Database indexes on frequent queries
- Connection pooling (Prisma default)
- Select only needed fields
- Use Prisma Studio to optimize queries

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity
- [ ] Regular database backups
- [ ] Rate limiting (future)

---

## 📚 Documentation Files

1. **FULL_STACK_VERIFICATION.md** - Complete technical docs (150+ lines)
2. **VERIFICATION_SUMMARY.md** - Executive summary
3. **BACKEND_ERROR_FIX.md** - 500 error fix details
4. **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment
5. **QUICK_REFERENCE.md** - This file!

---

## 🎯 Testing Quick Checklist

- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create leads
- [ ] Can view leads
- [ ] Can edit leads
- [ ] Can delete leads
- [ ] Filters work
- [ ] Search works
- [ ] Pipeline works
- [ ] No console errors
- [ ] Mobile responsive

---

## 🆘 Emergency Contacts

### Critical Issues
1. Check Render logs first
2. Check Vercel deployment status
3. Verify database connection
4. Rollback recent changes if needed

### Rollback Commands
```bash
# Backend (Render)
# Dashboard → Deployments → Rollback

# Frontend (Vercel)
# Dashboard → Deployments → Rollback
```

---

**Quick Reference v1.0** | April 9, 2026  
**Status**: Production Ready ✅  
**Support**: Check documentation files for details
