# 🚀 Deployment & Testing Checklist

## Pre-Deployment Setup

### 1. Backend Environment Variables
- [ ] Navigate to `backend/` folder
- [ ] Copy `.env.example` to `.env`
  ```bash
  cd backend
  copy .env.example .env
  ```
- [ ] Edit `.env` and fill in:
  - [ ] `DATABASE_URL` - Your PostgreSQL connection string
  - [ ] `JWT_SECRET` - Generate a random secure string
  - [ ] `PORT` - Keep as 4000 for local, Render will override
  - [ ] `NODE_ENV` - Set to `production` for deployment
  - [ ] `FRONTEND_URL` - Your Vercel URL

### 2. Frontend Environment Variables
- [ ] Navigate to `crm-frontend/` folder
- [ ] Copy `.env.example` to `.env`
  ```bash
  cd crm-frontend
  copy .env.example .env
  ```
- [ ] Edit `.env` and fill in:
  - [ ] `VITE_API_URL` - Your Render backend URL

### 3. Git Repository Setup
- [ ] Initialize git in root folder (if not already done)
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Create `.gitignore` in root (if not exists)
- [ ] Push to GitHub/GitLab

---

## Backend Deployment (Render)

### Step 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up/Login

### Step 2: Create PostgreSQL Database
- [ ] Click "New +" → "PostgreSQL"
- [ ] Choose free tier
- [ ] Note the connection string
- [ ] Copy the internal database URL

### Step 3: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git repository
- [ ] Configure:
  - [ ] **Name**: crm-backend
  - [ ] **Region**: Choose closest to your users
  - [ ] **Branch**: main/master
  - [ ] **Root Directory**: `backend`
  - [ ] **Runtime**: Node
  - [ ] **Build Command**: `npm install`
  - [ ] **Start Command**: `npm start`
  - [ ] **Instance Type**: Free

### Step 4: Set Environment Variables in Render
- [ ] Go to "Environment" tab
- [ ] Add variables:
  ```
  DATABASE_URL=<your postgres connection string>
  JWT_SECRET=<generate secure random string>
  PORT=4000
  NODE_ENV=production
  FRONTEND_URL=https://cr-mcampaign-3irx.vercel.app
  ```

### Step 5: Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Check logs for errors
- [ ] Note the backend URL (e.g., `https://crm-backend-xxxx.onrender.com`)

### Step 6: Test Backend Health
- [ ] Open browser and go to: `https://crm-backend-xxxx.onrender.com/health`
- [ ] Verify response shows `"status": "ok"`
- [ ] Test database health: `https://crm-backend-xxxx.onrender.com/health/db`
- [ ] If errors, check Render logs

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub

### Step 2: Import Project
- [ ] Click "Add New Project"
- [ ] Import your Git repository
- [ ] Configure:
  - [ ] **Framework Preset**: Vite
  - [ ] **Root Directory**: `crm-frontend`
  - [ ] **Build Command**: `npm run build`
  - [ ] **Output Directory**: `dist`

### Step 3: Set Environment Variables in Vercel
- [ ] Go to Project Settings → Environment Variables
- [ ] Add:
  ```
  VITE_API_URL=https://crm-backend-xxxx.onrender.com/api
  ```

### Step 4: Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note the frontend URL (e.g., `https://cr-mcampaign-3irx.vercel.app`)

---

## Post-Deployment Testing

### 1. Backend API Testing
```bash
# Test health endpoint
curl https://crm-backend-xxxx.onrender.com/health

# Expected response:
# {"status":"ok","database":"connected","uptime":123}
```

- [ ] Health check returns 200 OK
- [ ] Database shows as connected
- [ ] No errors in response

### 2. Frontend Access Testing
- [ ] Open `https://cr-mcampaign-3irx.vercel.app` in browser
- [ ] Should redirect to `/login`
- [ ] No console errors in DevTools (F12)

### 3. Login Testing
- [ ] Enter admin credentials (from seed data)
- [ ] Click "Login"
- [ ] Should redirect to `/dashboard`
- [ ] Check localStorage has `crm_token`
- [ ] Check Zustand store has user object

### 4. Leads Page Testing
- [ ] Navigate to "Leads" in sidebar
- [ ] Check browser console (F12)
- [ ] **Verify NO 500 errors** ✅
- [ ] Check Network tab for API calls
- [ ] Verify `/api/leads` returns data
- [ ] Table should display leads (if any exist)

### 5. Create Lead Testing
- [ ] Click "+ Add Lead" button
- [ ] Fill in form:
  - Name: Test Lead
  - Email: test@example.com
  - Phone: 1234567890
  - City: Test City
  - Course: MBA
- [ ] Click "Create Lead"
- [ ] Should see success toast
- [ ] Modal should close
- [ ] Table should refresh with new lead
- [ ] Check database with Prisma Studio

### 6. Filter & Search Testing
- [ ] Test status filter dropdown
- [ ] Test source filter dropdown
- [ ] Test search box (type name/email)
- [ ] Verify filters work correctly
- [ ] Check pagination (if >20 leads)

### 7. Lead Details Testing
- [ ] Click on a lead row
- [ ] Should navigate to `/leads/:id`
- [ ] Verify all lead details show
- [ ] Check activities, tasks, communications sections

### 8. Pipeline Testing
- [ ] Navigate to "Pipeline"
- [ ] Should see Kanban board
- [ ] Drag and drop leads between stages
- [ ] Verify stages update in database

### 9. RBAC Testing
- [ ] Login as different roles (if multiple users exist)
- [ ] Test ADMIN: Full access ✅
- [ ] Test MANAGER: Most access ✅
- [ ] Test MARKETING: Read-only leads ✅
- [ ] Test COUNSELLOR: Own leads only ✅

### 10. Logout Testing
- [ ] Click "Sign Out"
- [ ] Should redirect to `/login`
- [ ] localStorage should be cleared
- [ ] Cannot access protected routes

---

## Database Verification

### Using Prisma Studio
```bash
cd backend
npx prisma studio
```
- [ ] Opens browser at `http://localhost:5555`
- [ ] Can see all tables: Lead, User, Activity, Task, Communication
- [ ] Can browse data
- [ ] Can manually edit if needed

### Check Data Integrity
- [ ] Leads have valid source enums
- [ ] Leads have valid status enums
- [ ] Assigned leads link to valid users
- [ ] Timestamps are correct
- [ ] No orphaned records

---

## Monitoring Setup

### Render Dashboard
- [ ] Bookmark your service dashboard
- [ ] Check "Logs" tab regularly
- [ ] Monitor for errors
- [ ] Check response times
- [ ] Watch for database connection issues

### Vercel Dashboard
- [ ] Bookmark your project dashboard
- [ ] Check "Deployments" tab
- [ ] Monitor build success rate
- [ ] Check analytics if enabled

### Browser DevTools
- [ ] Open DevTools (F12) before testing
- [ ] Monitor Console tab for errors
- [ ] Check Network tab for failed requests
- [ ] Watch Application → Local Storage for token

---

## Troubleshooting

### Issue: Backend won't start
**Check:**
- [ ] DATABASE_URL is correct
- [ ] PostgreSQL database is running
- [ ] All environment variables are set
- [ ] Render logs show specific error

### Issue: 500 Errors in Console
**Check:**
- [ ] Backend health endpoint: `/health`
- [ ] Database health endpoint: `/health/db`
- [ ] Render logs for stack traces
- [ ] DATABASE_URL format is correct

### Issue: 401 Unauthorized
**Check:**
- [ ] Token exists in localStorage
- [ ] JWT_SECRET matches in backend
- [ ] Token hasn't expired
- [ ] Login again to get fresh token

### Issue: 403 Forbidden
**Check:**
- [ ] User role in database
- [ ] RBAC permissions in `rbac.config.js`
- [ ] Frontend permissions in `permissions.ts`
- [ ] Contact admin to upgrade role

### Issue: CORS Errors
**Check:**
- [ ] Frontend URL is in backend CORS whitelist
- [ ] CORS configuration in `server.js`
- [ ] Backend is accepting the origin
- [ ] Restart backend after config change

### Issue: No Data Showing
**Check:**
- [ ] Database has records (use Prisma Studio)
- [ ] All filters are cleared
- [ ] Search box is empty
- [ ] Counsellor role can only see assigned leads

---

## Performance Checklist

### Frontend
- [ ] Page loads in < 2 seconds
- [ ] API calls complete in < 500ms
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No console warnings

### Backend
- [ ] API response time < 200ms
- [ ] Database queries < 100ms
- [ ] No memory leaks
- [ ] Connection pool healthy

### Database
- [ ] Indexes on frequently queried columns
- [ ] No N+1 query problems
- [ ] Connection pooling configured
- [ ] Regular backups enabled

---

## Security Checklist

### Authentication
- [ ] JWT_SECRET is strong and random
- [ ] Tokens expire (default: 24h)
- [ ] Passwords are hashed with bcrypt
- [ ] Login rate limiting (future enhancement)

### Authorization
- [ ] RBAC enforced on all routes
- [ ] Frontend route protection working
- [ ] Backend middleware validation working
- [ ] No privilege escalation possible

### Data Protection
- [ ] HTTPS enforced in production
- [ ] CORS whitelist configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma)

### Best Practices
- [ ] No secrets in code
- [ ] Environment variables for all config
- [ ] `.env` files in `.gitignore`
- [ ] Regular dependency updates

---

## Final Verification

### Complete Flow Test
1. [ ] User lands on homepage → redirects to login
2. [ ] User logs in successfully
3. [ ] Dashboard loads with statistics
4. [ ] Navigate to Leads page
5. [ ] Create a new lead
6. [ ] Lead appears in table
7. [ ] Click lead to view details
8. [ ] Add activity to lead
9. [ ] Create task for lead
10. [ ] Move lead through pipeline stages
11. [ ] Logout successfully

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browser (Chrome/Safari)

### Mobile Responsiveness
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally
- [ ] Forms are usable on mobile
- [ ] Buttons are tap-friendly

---

## Success Criteria ✅

### All Must Pass:
- [ ] ✅ No 500 errors in console
- [ ] ✅ Login works
- [ ] ✅ Can create leads
- [ ] ✅ Can view leads
- [ ] ✅ Can edit leads
- [ ] ✅ Can delete leads
- [ ] ✅ Filters work
- [ ] ✅ Search works
- [ ] ✅ Pipeline works
- [ ] ✅ RBAC works
- [ ] ✅ Logout works
- [ ] ✅ Database has data
- [ ] ✅ Health checks pass
- [ ] ✅ No console errors
- [ ] ✅ Mobile responsive

---

## Documentation Checklist

- [ ] `FULL_STACK_VERIFICATION.md` - Complete technical docs
- [ ] `VERIFICATION_SUMMARY.md` - Executive summary
- [ ] `BACKEND_ERROR_FIX.md` - 500 error fix details
- [ ] `DEPLOYMENT_CHECKLIST.md` - This file
- [ ] `backend/.env.example` - Backend env template
- [ ] `crm-frontend/.env.example` - Frontend env template

---

## Next Steps After Deployment

### Week 1
- [ ] Monitor logs daily
- [ ] Fix any critical bugs
- [ ] Gather user feedback
- [ ] Document any issues

### Week 2
- [ ] Optimize slow queries
- [ ] Add missing features
- [ ] Improve error messages
- [ ] Update documentation

### Month 1
- [ ] Review analytics
- [ ] Plan feature roadmap
- [ ] Consider paid upgrades
- [ ] Implement CI/CD

---

## Support & Resources

### Documentation
- Prisma Docs: https://www.prisma.io/docs
- Fastify Docs: https://www.fastify.io/docs
- React Query: https://tanstack.com/query
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs

### Community
- Stack Overflow (tag: educrm)
- GitHub Issues
- Discord/Slack communities

---

**Checklist Version**: 1.0  
**Last Updated**: April 9, 2026  
**Status**: Ready for deployment ✅
