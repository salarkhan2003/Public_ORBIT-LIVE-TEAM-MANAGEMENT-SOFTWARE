# 🔐 SECURITY DOCUMENTATION

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. ROTATE ALL SUPABASE KEYS (DO THIS NOW!)

Your Supabase anon key has been exposed in the repository. **You must rotate it immediately.**

#### Steps to Rotate Supabase Keys:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `iclnquvhushnvjzzcjrs`

2. **Go to Settings → API**
   - Path: Project Settings → API
   - You'll see your current keys

3. **Generate New Keys**
   - Click "Reset anon key" (or "Regenerate")
   - Click "Reset service_role key" if you have one
   - **WARNING**: This will invalidate all existing keys

4. **Update Your Environment Variables**
   ```bash
   # Update .env file with new keys
   VITE_SUPABASE_URL=https://iclnquvhushnvjzzcjrs.supabase.co
   VITE_SUPABASE_ANON_KEY=<NEW_ANON_KEY_HERE>
   ```

5. **Update Production Environment**
   - If deployed, update environment variables in:
     - Vercel/Netlify Dashboard
     - GitHub Secrets
     - Any other hosting platform

6. **Revoke Old Keys**
   - In Supabase console, ensure old keys are marked as revoked
   - Monitor logs for any unauthorized access attempts

---

## 📋 SECURITY CHECKLIST

### Secrets Management ✅
- [x] `.env` in `.gitignore`
- [ ] **TODO**: Rotate Supabase keys (see above)
- [ ] **TODO**: Remove `.env` from git history (see commands below)
- [x] Code uses `process.env` / `import.meta.env`
- [ ] **TODO**: Create `.env.example` file

### Row Level Security (RLS) 🔒
- [ ] **TODO**: Enable RLS on all tables
- [ ] **TODO**: Add policies for `users` table
- [ ] **TODO**: Add policies for `groups` table
- [ ] **TODO**: Add policies for `group_members` table
- [ ] **TODO**: Add policies for `tasks` table
- [ ] **TODO**: Add policies for `projects` table
- [ ] **TODO**: Add policies for `documents` table
- [ ] **TODO**: Add policies for `meetings` table
- [ ] **TODO**: Add policies for `notifications` table
- [ ] **TODO**: Add policies for `activity_logs` table
- [ ] **TODO**: Add policies for `ai_conversations` table

### Authentication & Authorization 🔐
- [x] Supabase Auth implemented
- [ ] **TODO**: Add server-side auth middleware
- [ ] **TODO**: Verify JWT tokens on backend
- [ ] **TODO**: Implement rate limiting
- [ ] **TODO**: Add CORS configuration

### Input Validation 📝
- [ ] **TODO**: Add Zod schemas for all inputs
- [ ] **TODO**: Sanitize user inputs
- [ ] **TODO**: Validate file uploads
- [ ] **TODO**: Prevent SQL injection

### Data Protection 🛡️
- [ ] **TODO**: Implement optimistic locking
- [ ] **TODO**: Add data encryption at rest
- [ ] **TODO**: Secure file storage
- [ ] **TODO**: Implement audit logs

---

## 🗑️ REMOVING SECRETS FROM GIT HISTORY

If you've ever committed the `.env` file, follow these steps:

### Option 1: Using BFG Repo-Cleaner (Recommended)

```bash
# 1. Backup your repo first!
cd ..
cp -r "ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)" "ORBIT-BACKUP"

# 2. Download BFG
# From: https://rtyley.github.io/bfg-repo-cleaner/
# Or: brew install bfg (macOS)

# 3. Clean the repo
cd "ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)/project"
bfg --delete-files .env
bfg --delete-files '*.env'

# 4. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (WARNING: Coordinate with team!)
git push origin --force --all
git push origin --force --tags
```

### Option 2: Using git filter-repo

```bash
# 1. Install git-filter-repo
pip install git-filter-repo

# 2. Backup your repo
cd ..
cp -r "ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)" "ORBIT-BACKUP"

# 3. Remove .env from history
cd "ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)/project"
git filter-repo --path .env --invert-paths
git filter-repo --path server/.env --invert-paths

# 4. Force push
git push origin --force --all
```

### Verification:

```bash
# Search for any remaining secrets
git log --all --full-history -- .env
git log --all --full-history -S "SUPABASE_ANON_KEY"
git log --all --full-history -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

# Should return empty!
```

---

## 🔒 ROW LEVEL SECURITY (RLS) POLICIES

### Why RLS?
RLS ensures users can only access data they're authorized to see, enforced at the database level.

### Implementation Status:
See `supabase/migrations/` folder for SQL migration files implementing:
- User isolation
- Workspace-based access control
- Role-based permissions
- Secure file access

### Testing RLS:
```sql
-- Test as User A
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub":"user-a-id"}';
SELECT * FROM tasks; -- Should only see User A's tasks

-- Test as User B
SET LOCAL request.jwt.claims = '{"sub":"user-b-id"}';
SELECT * FROM tasks; -- Should only see User B's tasks
```

---

## 🚨 INCIDENT RESPONSE

### If a Security Breach Occurs:

1. **Immediate Actions**
   - Rotate all API keys and passwords
   - Review access logs
   - Lock down affected resources

2. **Investigation**
   - Check Supabase logs for unauthorized access
   - Review application logs
   - Identify scope of breach

3. **Notification**
   - Notify affected users
   - Report to authorities if required
   - Document incident

4. **Prevention**
   - Update security policies
   - Add monitoring/alerts
   - Review and test security measures

---

## 📊 MONITORING & ALERTS

### Setup Monitoring:
- [ ] **TODO**: Configure Sentry for error tracking
- [ ] **TODO**: Set up log aggregation
- [ ] **TODO**: Add uptime monitoring (UptimeRobot)
- [ ] **TODO**: Configure database alerts
- [ ] **TODO**: Monitor API usage/quotas

### Alert Triggers:
- Failed login attempts (5+ in 1 minute)
- Unusual API usage patterns
- Database errors
- File upload failures
- AI API quota exceeded

---

## 🔐 BEST PRACTICES

### For Developers:
1. ✅ Never commit secrets to git
2. ✅ Always use environment variables
3. ✅ Review code for security issues
4. ✅ Keep dependencies updated
5. ✅ Use secure communication (HTTPS)
6. ✅ Implement proper error handling
7. ✅ Validate all user inputs
8. ✅ Use parameterized queries
9. ✅ Implement rate limiting
10. ✅ Regular security audits

### For Deployment:
1. ✅ Use secrets management (GitHub Secrets, etc.)
2. ✅ Enable HTTPS/TLS
3. ✅ Configure CORS properly
4. ✅ Set security headers
5. ✅ Regular backups
6. ✅ Monitor logs
7. ✅ Update regularly
8. ✅ Test in staging first

---

## 📞 SECURITY CONTACTS

### Report Security Issues:
- Email: security@your-domain.com
- Bug Bounty: (if applicable)
- Responsible Disclosure: (your policy)

---

## 📚 REFERENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Last Updated**: November 14, 2025
**Next Review**: Monthly
**Owner**: DevOps Team

