# 🚀 ORBIT LIVE - Production Hardening Implementation Plan

## 📋 EXECUTIVE SUMMARY

This document tracks the production-hardening implementation for ORBIT LIVE.
Status as of: **November 14, 2025**

---

## ✅ COMPLETED TASKS

### 1. Security Audit & Documentation ✅
- [x] Created `SECURITY.md` with incident response plan
- [x] Created `.env.example` with all required variables
- [x] Created RLS policies SQL file
- [x] Documented secret rotation procedures
- [x] Created git history cleaning commands

### Files Created:
- `SECURITY.md` - Comprehensive security documentation
- `.env.example` - Environment variables template
- `supabase/RLS_POLICIES.sql` - Complete RLS policies for all tables

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED (Do These NOW!)

### 🔴 CRITICAL - Priority 1

#### 1. Rotate Supabase Keys
Your anon key is exposed in the repository. **You must rotate it immediately.**

**Steps:**
1. Go to: https://supabase.com/dashboard
2. Select project: `iclnquvhushnvjzzcjrs`
3. Settings → API → Reset anon key
4. Update `.env` file with new key
5. Update production environment variables
6. Revoke old keys

**Commands to check git history:**
```bash
# Search for exposed keys in history
git log --all --full-history -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
git log --all --full-history -- .env

# If found, clean with BFG:
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

#### 2. Apply RLS Policies
Run the SQL file in Supabase SQL Editor:
```sql
-- Open: supabase/RLS_POLICIES.sql
-- Copy entire contents
-- Paste in Supabase Dashboard → SQL Editor
-- Click "Run"
```

**Verification:**
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All tables should show rowsecurity = true
```

---

## 📝 PENDING TASKS

### Priority 2: Authentication & Middleware 🔨

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Create auth middleware for server
- [ ] Add JWT token verification
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Create middleware tests

**Files to Create:**
```
server/middleware/auth.ts
server/middleware/rateLimit.ts
server/middleware/cors.ts
server/__tests__/middleware.test.ts
```

**Example Middleware:**
```typescript
// server/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
}
```

---

### Priority 3: Input Validation 📋

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Install Zod: `npm install zod`
- [ ] Create validation schemas
- [ ] Add validation middleware
- [ ] Add validation tests

**Files to Create:**
```
src/lib/validation/schemas.ts
src/lib/validation/middleware.ts
src/lib/validation/__tests__/schemas.test.ts
```

**Example Schema:**
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  group_id: z.string().uuid(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().int().positive(),
});
```

---

### Priority 4: Concurrency & Optimistic Locking 🔄

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Add `version` column to tasks table
- [ ] Add `version` column to projects table
- [ ] Implement optimistic locking logic
- [ ] Add conflict resolution
- [ ] Create concurrency tests

**Migration SQL:**
```sql
-- Add version columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_version_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_version();

CREATE TRIGGER projects_version_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_version();
```

---

### Priority 5: Real-Time Events 📡

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Add event UUIDs to real-time messages
- [ ] Implement idempotency checking
- [ ] Add Redis for deduplication
- [ ] Create event tests

---

### Priority 6: Logging & Monitoring 📊

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Install Sentry: `npm install @sentry/node @sentry/react`
- [ ] Configure Sentry with DSN
- [ ] Replace console.log with structured logging
- [ ] Add `/health` endpoint
- [ ] Set up error tracking

**Sentry Setup:**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

### Priority 7: Testing & CI 🧪

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Install testing libraries
- [ ] Create unit tests
- [ ] Create integration tests
- [ ] Set up GitHub Actions CI
- [ ] Add branch protection

**GitHub Actions CI:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

---

### Priority 8: Deployment 🚀

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Create deployment scripts
- [ ] Set up staging environment
- [ ] Configure production environment
- [ ] Add smoke tests
- [ ] Set up CD pipeline

---

### Priority 9: AI Safety & Cost Control 🤖

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Implement PII masking
- [ ] Add AI quota enforcement
- [ ] Add response caching
- [ ] Create AI audit logs

**AI Quota Middleware:**
```typescript
// server/middleware/aiQuota.ts
export async function checkAIQuota(req, res, next) {
  const userId = req.user.id;
  const groupId = req.body.group_id;
  
  // Check daily quota
  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact' })
    .eq('group_id', groupId)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString());
  
  if (count >= 100) {
    return res.status(429).json({ 
      error: 'AI quota exceeded. Limit: 100 requests/day' 
    });
  }
  
  next();
}
```

---

### Priority 10: Documentation 📚

**Status:** ⏳ NOT STARTED

**Tasks:**
- [ ] Update README.md
- [ ] Create ARCHITECTURE.md
- [ ] Add API documentation
- [ ] Create deployment guide

---

## 📊 PROGRESS TRACKER

| Priority | Task | Status | Estimated Time |
|----------|------|--------|---------------|
| 1 | Secrets & Git Hygiene | ✅ Documented | Manual - 30 min |
| 2 | Rotate Keys | ⏳ TODO | Manual - 15 min |
| 3 | RLS Policies | ✅ Created | Manual - 10 min to apply |
| 4 | Auth Middleware | ⏳ TODO | 4 hours |
| 5 | Input Validation | ⏳ TODO | 3 hours |
| 6 | Concurrency | ⏳ TODO | 4 hours |
| 7 | Real-Time | ⏳ TODO | 3 hours |
| 8 | Data Model | ⏳ TODO | 2 hours |
| 9 | Logging | ⏳ TODO | 3 hours |
| 10 | Tests | ⏳ TODO | 8 hours |
| 11 | Deployment | ⏳ TODO | 4 hours |
| 12 | Monitoring | ⏳ TODO | 2 hours |
| 13 | Documentation | ⏳ TODO | 4 hours |
| 14 | AI Safety | ⏳ TODO | 3 hours |
| 15 | Final Checklist | ⏳ TODO | 2 hours |

**Total Estimated Time:** 40-50 hours of development work

---

## 🎯 NEXT STEPS

### For You (Right Now):

1. **Rotate Supabase Keys** (15 minutes)
   - Follow instructions in `SECURITY.md`
   - Update `.env` and production variables

2. **Apply RLS Policies** (10 minutes)
   - Run `supabase/RLS_POLICIES.sql` in Supabase console
   - Verify with test queries

3. **Clean Git History** (30 minutes - if needed)
   - Check if `.env` was ever committed
   - Use BFG commands from `SECURITY.md`

### For Development Team:

1. **Week 1: Security & Foundation**
   - Authentication middleware
   - Input validation
   - Tests for auth and validation

2. **Week 2: Advanced Features**
   - Concurrency control
   - Real-time improvements
   - Logging and monitoring

3. **Week 3: Deployment & Polish**
   - CI/CD pipeline
   - Documentation
   - Load testing
   - Final security audit

---

## 📞 QUESTIONS & SUPPORT

### Need Help?

- **Security Issues**: See `SECURITY.md`
- **RLS Questions**: See `supabase/RLS_POLICIES.sql` comments
- **Environment Setup**: See `.env.example`

### Before Asking:

1. Check if RLS policies are applied
2. Verify keys are rotated
3. Check Supabase logs for errors
4. Review environment variables

---

## ✅ VERIFICATION CHECKLIST

### Before Going to Production:

- [ ] All keys rotated and old keys revoked
- [ ] RLS policies applied and tested
- [ ] No secrets in git history
- [ ] Authentication middleware working
- [ ] Input validation on all endpoints
- [ ] Tests passing (unit + integration)
- [ ] CI/CD pipeline configured
- [ ] Monitoring and alerts set up
- [ ] Documentation complete
- [ ] Load testing completed
- [ ] Security audit passed

---

## 📝 COMMIT MESSAGES (When Ready)

```bash
# After completing each task:

git commit -m "security: remove hardcoded keys and add .env.example"
git commit -m "feat(security): add comprehensive RLS policies"
git commit -m "docs: add security documentation and rotation procedures"
git commit -m "feat(auth): add JWT verification middleware"
git commit -m "feat(validation): add Zod schemas for all inputs"
git commit -m "feat(db): add optimistic locking with version columns"
git commit -m "test: add comprehensive test suite"
git commit -m "ci: add GitHub Actions workflow"
git commit -m "docs: update README and add ARCHITECTURE.md"
```

---

**Status:** 🟡 **IN PROGRESS** - Foundation Complete, Implementation Pending

**Next Action:** Rotate keys and apply RLS policies (Manual - 25 minutes)

---

*This is a living document. Update as tasks are completed.*

