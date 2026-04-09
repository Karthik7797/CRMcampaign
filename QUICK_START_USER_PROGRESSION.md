# User Progression Feature - Quick Start Guide

## 🎯 What Was Built

You now have a **User Progression Tracking** system that shows:
- Which users have which leads assigned
- How those leads are progressing through pipeline stages
- Conversion rates and performance metrics per user

---

## 🚀 How to Test

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd crm-frontend
npm run dev
```

### 3. Test Lead Assignment
1. Login as **ADMIN** or **MANAGER**
2. Go to **Leads** page
3. Find an unassigned lead
4. Click **"Assign"** button
5. Select a user from dropdown
6. Click **"Assign Lead"**
7. ✅ Lead now shows assigned user

### 4. Test User Progression Dashboard
1. Click **"User Progression"** in sidebar (under Analytics)
2. See summary cards with stats
3. View bar chart showing pipeline distribution
4. See table with all users and their lead stages
5. Click on any user to see their recent leads
6. Click on a lead to view details

---

## 🔐 Access Control

| Role | Can View User Progression? | Can Assign Leads? |
|------|---------------------------|-------------------|
| **ADMIN** | ✅ Yes | ✅ Yes |
| **MANAGER** | ✅ Yes | ✅ Yes |
| **MARKETING** | ✅ Yes | ❌ No |
| **INFLUENCER** | ✅ Yes | ❌ No |
| **COUNSELLOR** | ❌ No | ❌ No |

---

## 📊 Features

### User Progression Page Shows:
- **Total Users** - Active users in system
- **Total Assigned Leads** - All leads with assignees
- **Total Converted** - Successfully converted leads
- **Average Conversion Rate** - Team-wide average

### Pipeline Stages Tracked:
1. ENQUIRY
2. CONTACTED
3. DEMO
4. UNIVERSITY_SELECTION
5. OFFER_LETTER
6. VISA
7. ACCOMMODATION
8. PART_TIME_JOB
9. FULL_TIME
10. SHORTLISTED
11. APPLICATION_SENT
12. APPLICATION_RECEIVED
13. ENROLLED

---

## 🎨 UI Elements

### Leads Page:
- **"Assign" button** - For unassigned leads (ADMIN/MANAGER only)
- **✕ button** - Next to assigned user to reassign
- **User avatar** - Shows who the lead is assigned to

### User Progression Page:
- **Summary cards** - 4 key metrics at top
- **Stacked bar chart** - Visual pipeline distribution
- **Performance table** - Detailed breakdown per user
- **Click interactions** - Click users/leads for details

---

## 📁 Files Changed

### Backend:
- ✅ `analytics.controller.js` - NEW (user progression logic)
- ✅ `analytics.routes.js` - UPDATED (new endpoints)

### Frontend:
- ✅ `UserProgression.tsx` - NEW (dashboard page)
- ✅ `Leads.tsx` - UPDATED (assignment UI)
- ✅ `App.tsx` - UPDATED (new route)
- ✅ `permissions.ts` - UPDATED (nav item)
- ✅ `Sidebar.tsx` - UPDATED (icon mapping)
- ✅ `client.ts` - UPDATED (API methods)

---

## 🧪 Quick Test Checklist

- [ ] Login as ADMIN
- [ ] Go to Leads page
- [ ] Assign a lead to a user
- [ ] Navigate to User Progression
- [ ] See the assigned lead in user's stats
- [ ] Click on user to see recent leads
- [ ] Click on lead to view details
- [ ] Reassign the lead to different user
- [ ] Verify stats update correctly

---

## 🔧 API Endpoints

### Get All User Progression
```
GET /api/analytics/user-progression
Headers: Authorization: Bearer <token>
Roles: ADMIN, MANAGER
```

### Get Single User Progression
```
GET /api/analytics/user-progression/:userId
Headers: Authorization: Bearer <token>
Roles: ADMIN, MANAGER
```

---

## 💡 Tips

1. **Assign leads before viewing** - User Progression shows assigned leads only
2. **Use filters** - Filter leads by status/source before assigning
3. **Monitor conversion rates** - High rates = effective user performance
4. **Balance workload** - Check stage distribution to avoid overload
5. **Reassign as needed** - Click ✕ to reassign underperforming leads

---

## ❓ Troubleshooting

**User Progression page is empty:**
- Make sure leads are assigned to users
- Check that you're logged in as ADMIN/MANAGER

**Can't see Assign button:**
- Only ADMIN and MANAGER can assign leads
- Check your role in user profile

**Chart not showing:**
- Ensure there are assigned leads in database
- Check browser console for errors
- Verify backend is running

**Navigation item missing:**
- Clear browser cache
- Check if logged in with proper role
- Verify `nav:analytics` permission

---

## 📞 Need Help?

Check the full documentation:
- `USER_PROGRESSION_IMPLEMENTATION.md` - Complete implementation details
- `backend/src/modules/analytics/analytics.controller.js` - Backend logic
- `crm-frontend/src/pages/UserProgression.tsx` - Frontend component

---

**Status:** ✅ Ready for Testing  
**Date:** April 9, 2026
