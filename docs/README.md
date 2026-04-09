# 📚 CRM Campaign Documentation

This folder contains all documentation for the CRM Campaign project.

---

## 📖 Available Documentation

### Feature Documentation

#### 1. **User Progression Tracking** (April 9, 2026)
Complete reference for the user progression and lead assignment feature.

**Files:**
- `USER_PROGRESSION_COMPLETE.md` - **START HERE** - Complete consolidated reference
- `USER_PROGRESSION_IMPLEMENTATION.md` - Original implementation details
- `QUICK_START_USER_PROGRESSION.md` - Quick start guide
- `FIXES_USER_PROGRESSION.md` - Fixes and improvements applied

**What it covers:**
- Lead assignment to users
- User progression tracking
- Pipeline filtering by user
- Performance analytics
- Permission-based access

---

### Process Documentation

#### 2. **How to Skip Markdown Files**
Guide for telling Copilot not to create documentation files.

**File:**
- `HOW_TO_SKIP_MARKDOWN.md` - Instructions for controlling documentation

**When to use:**
- When you want code only
- When you don't need reference docs
- For simple fixes and changes

---

## 🗂️ File Organization

```
docs/
├── README.md                          # This file - documentation index
├── USER_PROGRESSION_COMPLETE.md       # Main reference (START HERE)
├── USER_PROGRESSION_IMPLEMENTATION.md # Detailed implementation
├── QUICK_START_USER_PROGRESSION.md    # Quick start guide
├── FIXES_USER_PROGRESSION.md          # Fixes and improvements
└── HOW_TO_SKIP_MARKDOWN.md            # How to skip docs in future
```

---

## 🎯 Quick Navigation

### For New Users
1. Start with `USER_PROGRESSION_COMPLETE.md` - Has everything you need
2. Use `QUICK_START_USER_PROGRESSION.md` for testing
3. Reference `FIXES_USER_PROGRESSION.md` for known issues

### For Developers
1. `USER_PROGRESSION_IMPLEMENTATION.md` - Technical details
2. `FIXES_USER_PROGRESSION.md` - Bug fixes and solutions
3. Source code in `backend/src/modules/analytics/` and `crm-frontend/src/pages/`

### For Users Who Don't Want Docs
- Read `HOW_TO_SKIP_MARKDOWN.md` to learn how to tell Copilot
- Or just say: **"Don't create markdown files"**

---

## 📝 Documentation Standards

### What Gets Documented
- ✅ New features (like User Progression)
- ✅ Major changes to existing features
- ✅ Complex bug fixes
- ✅ API changes and endpoints

### What Doesn't Need Docs
- ❌ Simple bug fixes
- ❌ Minor UI tweaks
- ❌ Typo corrections
- ❌ Refactoring without behavior changes

### How to Request No Documentation
```
"Implement [feature], no docs needed"
"Fix [issue], skip markdown files"
"Just code it, don't create documentation"
```

---

## 🔍 Search Tips

### Find Information About...

**User Progression Feature:**
- Search for "user progression" in all docs
- Or open `USER_PROGRESSION_COMPLETE.md`

**Lead Assignment:**
- See "Assign Leads" section in `USER_PROGRESSION_COMPLETE.md`
- Check `FIXES_USER_PROGRESSION.md` for dropdown fix

**Pipeline Filtering:**
- See "Pipeline User Filter" in `FIXES_USER_PROGRESSION.md`
- Technical details in `USER_PROGRESSION_IMPLEMENTATION.md`

**How to Skip Docs:**
- Read `HOW_TO_SKIP_MARKDOWN.md`

---

## 📅 Documentation History

| Date | Document | Purpose |
|------|----------|---------|
| Apr 9, 2026 | USER_PROGRESSION_IMPLEMENTATION.md | Initial implementation |
| Apr 9, 2026 | QUICK_START_USER_PROGRESSION.md | Quick start guide |
| Apr 9, 2026 | FIXES_USER_PROGRESSION.md | Bug fixes |
| Apr 9, 2026 | USER_PROGRESSION_COMPLETE.md | Consolidated reference |
| Apr 9, 2026 | HOW_TO_SKIP_MARKDOWN.md | Process documentation |
| Apr 9, 2026 | README.md | Documentation index |

---

## 💡 Tips

### Using This Documentation

1. **Start with the Complete Reference**
   - `USER_PROGRESSION_COMPLETE.md` has everything
   - Other files are for specific details

2. **Keep Docs Organized**
   - New feature docs go in this folder
   - Use clear, descriptive filenames

3. **Reference in Conversations**
   - "Check docs/USER_PROGRESSION_COMPLETE.md"
   - "See the Quick Start section"

### Maintaining Docs

1. **Update When Features Change**
   - Keep API docs current
   - Update screenshots if UI changes

2. **Archive Old Docs**
   - Move outdated docs to `docs/archive/`
   - Keep a changelog

3. **Consolidate When Possible**
   - Merge related docs
   - Remove duplicates

---

## 🚀 Getting Started

### First Time Setup
1. Read `USER_PROGRESSION_COMPLETE.md`
2. Follow Quick Start section
3. Test the features

### Daily Development
1. Check docs for API endpoints
2. Reference permission matrix
3. Use troubleshooting section

### Adding New Features
1. Decide if docs are needed
2. If yes, create in this folder
3. Update this README
4. If no, say "Don't create markdown files"

---

## 📞 Need Help?

### Finding Information
- Check the table of contents in each doc
- Use your editor's search (Ctrl+Shift+F)
- Look for relevant sections

### Understanding Features
- Start with high-level overview
- Read technical implementation
- Check troubleshooting section

### Contributing
- Update docs when you change code
- Keep examples current
- Add troubleshooting tips

---

## 🎯 Summary

**This folder contains:**
- Feature documentation
- Implementation guides
- Quick start references
- Bug fix records
- Process documentation

**How to use:**
1. Find the doc you need
2. Read the relevant section
3. Apply to your work

**How to skip:**
- Say "Don't create markdown files"
- Or "Code only, no docs"

---

**Last Updated:** April 9, 2026  
**Maintained By:** Development Team  
**Location:** `g:\CRMcampaign\docs\`
