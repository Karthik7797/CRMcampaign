# How to Tell Copilot NOT to Create Markdown Files

## Quick Answer

**Just say one of these:**
- "Don't create documentation files"
- "No need for markdown files"
- "Skip the docs, just implement"
- "Keep it in code only"
- "No documentation needed"

---

## Examples

### ❌ What NOT to Say (Triggers Documentation)
```
"Implement user progression tracking"
"Fix the pipeline filter issue"
"Add lead assignment feature"
```
→ I'll create implementation docs, quick start guides, fix summaries, etc.

### ✅ What TO Say (No Documentation)
```
"Implement user progression tracking, no docs needed"
"Fix the pipeline filter - don't create markdown files"
"Add lead assignment feature, skip documentation"
"Just code it, no markdown"
```
→ I'll only modify code files, no .md files created

---

## Why I Create Markdown Files

I create documentation when:
1. **Implementing new features** - To explain what was built
2. **Making complex changes** - To track what changed
3. **Fixing bugs** - To document the fix
4. **You might need reference later** - For future you!

But if you don't want them, just tell me!

---

## Common Phrases to Stop Documentation

### Direct Commands
- "Don't create any markdown files"
- "No documentation please"
- "Skip the .md files"
- "Code only, no docs"

### Casual Requests
- "Just implement it"
- "Keep it simple, no docs"
- "I don't need the reference files"
- "Save the docs for later"

### Specific Instructions
- "Don't create summary files"
- "No need for implementation docs"
- "Skip quick start guides"
- "No changelog needed"

---

## When Documentation IS Useful

Consider keeping docs when:
1. **Complex features** - Multiple files changed
2. **Team collaboration** - Others need to understand
3. **Future reference** - You'll forget details
4. **API changes** - Need endpoint documentation
5. **Business logic** - Need to explain decisions

### Example: Keep Docs For
```
"Implement user progression tracking with analytics"
→ This is complex, docs help understand the feature
```

### Example: Skip Docs For
```
"Fix the typo in the login button"
→ Simple fix, no docs needed
```

---

## Best Practices

### 1. Be Explicit
```
✅ "Add user filter to pipeline, no markdown files"
❌ "Add user filter to pipeline"
```

### 2. Specify Scope
```
✅ "Just fix the API call in Leads.tsx, skip docs"
❌ "Fix the leads page"
```

### 3. Combine Instructions
```
✅ "Implement this feature but don't create documentation files"
❌ "Implement this feature"
```

---

## What I'll Do Without Docs

When you say "no markdown":

### ✅ I Will:
- Modify code files
- Fix bugs
- Implement features
- Update existing code
- Test functionality

### ❌ I Won't:
- Create .md files
- Write implementation summaries
- Create quick start guides
- Document changes
- Create reference files

---

## Example Conversation

### Without Instruction (Creates Docs)
```
You: "Add user progression tracking"
Me: *Creates 3 markdown files with implementation details, quick start, and fixes*
```

### With Instruction (No Docs)
```
You: "Add user progression tracking, no docs"
Me: *Only modifies code files, no markdown created*
```

---

## Memory Tip

**Remember this pattern:**
```
[Task] + [No Docs Instruction]
```

**Examples:**
- "Fix the dropdown, skip markdown"
- "Add new feature, no documentation"
- "Update the API, code only please"
- "Refactor this module, don't create docs"

---

## If I Forget

If I accidentally create a doc when you said not to:

**Call it out:**
```
"You created markdown files even though I said no docs"
```

**I'll:**
1. Apologize
2. Delete the files (if you want)
3. Remember for next time

---

## Alternative: Minimal Docs

If you want SOME documentation but not extensive:

```
"Just create one summary file, not multiple"
"Keep documentation minimal"
"Only document the API endpoints"
```

---

## Quick Reference Card

| What You Want | What to Say |
|---------------|-------------|
| No docs at all | "No markdown files" |
| Minimal docs | "Keep docs minimal" |
| Full docs | (Say nothing, I'll create them) |
| Code only | "Code only, skip docs" |
| One file | "Create one summary file" |

---

## Summary

**The Magic Words:**
> "Don't create markdown files"

**That's it!** Simple and effective.

---

**Created:** April 9, 2026  
**Purpose:** Help users control documentation creation  
**Location:** `docs/HOW_TO_SKIP_MARKDOWN.md`
