# 🚨 Fix for INFLUENCER Role Error

## Problem
The 500 error started after you added the INFLUENCER role to the database. The issue was:
- ✅ Database has INFLUENCER role (via Prisma migration)
- ❌ Backend code didn't recognize INFLUENCER role
- ❌ Frontend code didn't recognize INFLUENCER role
- ❌ This caused permission checks to fail → 500 error

## Solution Applied

I've added the INFLUENCER role to all necessary files:

### 1. Backend Files Updated ✅
- `backend/prisma/schema.prisma` - Added INFLUENCER to Role enum
- `backend/src/config/rbac.config.js` - Added INFLUENCER permissions

### 2. Frontend Files Updated ✅
- `crm-frontend/src/lib/permissions.ts` - Added INFLUENCER type and permissions

## Steps to Fix the Error

### Step 1: Push Schema Changes to Database
```bash
cd backend
npx prisma db push
```

This will update your database schema to match the Prisma schema.

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

This generates the TypeScript types for the Prisma client with the new INFLUENCER role.

### Step 3: Restart Backend Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Deploy to Render
The backend on Render needs to be redeployed with these changes:

1. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "fix: Add INFLUENCER role to RBAC system"
   git push
   ```

2. **Render will auto-deploy** - Check the deployment logs

### Step 5: Rebuild Frontend
The frontend also needs to be rebuilt:

1. **Vercel will auto-deploy** when you push to Git
2. Wait for the build to complete

## Testing After Fix

### 1. Test Backend Health
```bash
curl https://crm-backend-4rq2.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Test Leads API
Open your browser console and navigate to the Leads page. The 500 errors should be gone!

### 3. Create INFLUENCER User (Optional)
You can create a user with the INFLUENCER role using Prisma Studio:

```bash
cd backend
npx prisma studio
```

Then:
1. Go to the User table
2. Create a new user
3. Select "INFLUENCER" from the role dropdown
4. Save

## What INFLUENCER Role Can Do

Based on the permissions I added:

### Navigation Access ✅
- Dashboard
- Leads
- Pipeline
- Communications
- Tasks
- Analytics

### Lead Permissions ✅
- View own leads
- Create leads
- Edit own leads
- Move leads through pipeline

### Cannot Do ❌
- View all leads (only assigned ones)
- Delete leads
- Assign leads to others
- Access Settings
- Manage users

## Why This Error Happened

When you added INFLUENCER to the database:
1. Prisma created the enum value in PostgreSQL
2. But the backend code still had the old Role enum
3. When a user with INFLUENCER role tried to access the API:
   - JWT token decoded the role as "INFLUENCER"
   - Backend tried to check permissions
   - Permission check failed because INFLUENCER wasn't in the RBAC config
   - This caused an error → 500 response

## Files Modified

### Backend
- ✅ `backend/prisma/schema.prisma`
- ✅ `backend/src/config/rbac.config.js`

### Frontend
- ✅ `crm-frontend/src/lib/permissions.ts`

## Next Steps

1. **Run the commands above** to update your local database
2. **Test locally** to make sure it works
3. **Push to Git** to deploy to Render + Vercel
4. **Test production** to confirm the error is fixed

## If You Still See Errors

### Check Backend Logs (Render Dashboard)
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for error messages

### Check Frontend Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for specific error messages

### Common Issues

**Issue: Prisma client not updated**
```bash
# Solution: Regenerate Prisma client
npx prisma generate
```

**Issue: Database not synced**
```bash
# Solution: Push schema to database
npx prisma db push
```

**Issue: Old code still running**
```bash
# Solution: Restart server
# Stop (Ctrl+C) and run npm run dev again
```

---

**Fix Applied**: April 9, 2026  
**Status**: Ready to deploy ✅
