# 🚨 Render Database Connection Fix

## Problem
```
Can't reach database server at `aws-1-ap-southeast-2.pooler.supabase.com:6543`
Timed out fetching a new connection from the connection pool
```

## ✅ Solution Steps

### Step 1: Get Correct DATABASE_URL from Supabase

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard

2. **Navigate to Connection Settings**
   - Select your project
   - Go to **Project Settings** (⚙️)
   - Click **Database**
   - Scroll to **Connection Pooling** section

3. **Copy Transaction Mode URI**
   - Click **Copy** next to "Transaction mode"
   - It should look like:
   ```
   postgresql://postgres.xxx:password@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Add Connection Pool Parameters

**IMPORTANT:** Add these parameters to the end of your DATABASE_URL:

```
&connection_limit=20&pool_timeout=30&recycle=300
```

**Final DATABASE_URL should look like:**
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=30&recycle=300"
```

### Step 3: Update Render Environment Variables

1. **Go to Render Dashboard**
   - https://render.com/dashboard

2. **Select Your Web Service**
   - Click on `crm-backend-4rq2` (or your backend service name)

3. **Go to Environment Tab**
   - Click **Environment** in the left menu

4. **Update DATABASE_URL**
   - Find `DATABASE_URL` environment variable
   - Click **Edit**
   - Replace with the new URL from Step 2
   - Click **Save Changes**

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **Manual Deploy** → **Deploy latest commit**
   - Or push a new commit to trigger auto-deploy

### Step 4: Verify Deployment

1. **Check Logs**
   - Go to **Logs** tab in Render
   - Look for: `✅ Database connection verified`
   - Should NOT see connection errors

2. **Test API**
   - Visit: `https://crm-backend-4rq2.onrender.com/api/analytics/overview`
   - Should return JSON data, not error

---

## 🔧 Alternative: Use Direct Connection

If pooler doesn't work, try **direct connection**:

### Get Direct Connection URL

1. **In Supabase Dashboard**
   - Project Settings → Database
   - Scroll to **Connection info** (NOT pooling)
   - Copy the **Direct connection** URI

2. **Format**
   ```
   postgresql://postgres.xxx:password@aws-1-ap-southeast-2.supabase.co:5432/postgres?sslmode=require
   ```
   
   **Note:** 
   - Port is `5432` (not `6543`)
   - No `.pooler` in hostname
   - No `pgbouncer=true`

3. **Add Pool Parameters**
   ```
   DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-2.supabase.co:5432/postgres?sslmode=require&connection_limit=20&pool_timeout=30&recycle=300"
   ```

---

## 📝 What Changed in Code

### `backend/src/config/db.js`
Added automatic connection pool parameter injection:
- Detects Supabase pooler URLs
- Adds `connection_limit=20`, `pool_timeout=30`, `recycle=300`
- Prevents connection timeouts on Render

### `backend/.env.example`
Updated with detailed instructions for:
- Supabase pooler connection
- Supabase direct connection
- Other providers

---

## 🎯 Connection Pool Parameters Explained

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `pgbouncer=true` | Required | Tells Prisma you're using PgBouncer (Supabase pooler) |
| `connection_limit=20` | 20 | Max connections to database (Render free tier: 20) |
| `pool_timeout=30` | 30 | Seconds to wait for connection (default: 10) |
| `recycle=300` | 300 | Recycle connections after 5 minutes (prevents stale connections) |

---

## ❗ Common Mistakes

### ❌ Wrong:
```env
# Missing pgbouncer=true
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres"

# Missing pool parameters
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"

# Using pooler port with direct hostname
DATABASE_URL="postgresql://...@supabase.co:6543/postgres"
```

### ✅ Correct:
```env
# With pooler (recommended)
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=30&recycle=300"

# Direct connection (alternative)
DATABASE_URL="postgresql://...@supabase.co:5432/postgres?sslmode=require&connection_limit=20&pool_timeout=30&recycle=300"
```

---

## 🧪 Testing Locally

Before deploying to Render, test locally:

1. **Create `.env` file in backend folder**
   ```env
   DATABASE_URL="your-full-database-url-here"
   JWT_SECRET="test-secret"
   PORT=4000
   ```

2. **Run backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check logs**
   - Should see: `✅ Database connection verified`
   - Test: `http://localhost:4000/api/analytics/overview`

---

##  Still Not Working?

### Check These:

1. **Database is Active**
   - Supabase project is not paused
   - Database is running

2. **Correct Password**
   - Password in URL matches Supabase dashboard
   - No special characters needing URL encoding

3. **Network Restrictions**
   - Supabase allows connections from Render IPs
   - No IP whitelist blocking Render

4. **SSL Mode**
   - Always include `?sslmode=require` for direct connections
   - Pooler connections need `?pgbouncer=true`

### Get Help:

1. **Check Render Logs**
   - Full error messages
   - Connection details

2. **Check Supabase Logs**
   - Database → Query Performance
   - See if connection attempts are reaching database

3. **Test Connection String**
   - Use a tool like DBeaver or pgAdmin
   - Test the exact DATABASE_URL locally

---

## 📞 Quick Checklist

- [ ] Copied correct URL from Supabase (Transaction mode)
- [ ] Added `?pgbouncer=true` parameter
- [ ] Added `&connection_limit=20&pool_timeout=30&recycle=300`
- [ ] Updated DATABASE_URL in Render Environment
- [ ] Redeployed service in Render
- [ ] Verified in logs: "Database connection verified"
- [ ] Tested API endpoint successfully

---

**Last Updated:** April 9, 2026  
**Issue:** Render + Supabase connection pool timeout  
**Status:** Fixed with proper DATABASE_URL parameters
