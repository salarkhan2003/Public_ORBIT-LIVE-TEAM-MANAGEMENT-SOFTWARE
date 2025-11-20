# 🚀 ORBIT LIVE - 30-Minute Launch Checklist

## ⚡ QUICK REFERENCE CARD

Copy this checklist and check off each item as you complete it!

---

## ✅ PRE-LAUNCH CHECKLIST

### **STEP 1: Environment Setup (5 min)**
- [ ] Copy `.env.example` to `.env`
- [ ] Add Supabase URL
- [ ] Add Supabase Anon Key
- [ ] (Optional) Add Firebase credentials
- [ ] (Optional) Add Google AI key
- [ ] (Optional) Add Sentry DSN

**Get keys from:**
- Supabase: https://supabase.com/dashboard → Settings → API
- Firebase: https://console.firebase.google.com → Project Settings
- Google AI: https://makersuite.google.com/app/apikey
- Sentry: https://sentry.io → Create Project

---

### **STEP 2: Database Setup (10 min)**
- [ ] Create Supabase project
- [ ] Save database password
- [ ] Run `PRODUCTION_SCHEMA.sql` in SQL Editor
- [ ] Run `RLS_POLICIES.sql` in SQL Editor
- [ ] Run `SETUP_AVATARS_STORAGE.sql` in SQL Editor
- [ ] Run `SETUP_DOCUMENTS_STORAGE.sql` in SQL Editor
- [ ] (Optional) Run `SETUP_CALENDAR_EVENTS.sql`
- [ ] (Optional) Run `SETUP_NOTIFICATIONS.sql`
- [ ] Enable Email/Password auth
- [ ] (Optional) Enable Google OAuth

---

### **STEP 3: Deploy (10 min)**

#### **Option A: Vercel**
- [ ] Install: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel --prod`
- [ ] Add environment variables in dashboard
- [ ] Redeploy to apply variables

#### **Option B: Netlify**
- [ ] Install: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Add environment variables in dashboard
- [ ] Trigger new deploy

---

### **STEP 4: Domain Setup (5 min)**
- [ ] Add custom domain in Vercel/Netlify
- [ ] Configure DNS records at registrar
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify HTTPS is working
- [ ] Update Supabase redirect URLs

---

### **STEP 5: Monitoring (2 min)**
- [ ] Create Sentry account
- [ ] Create new React project
- [ ] Copy DSN
- [ ] Add to environment variables
- [ ] Redeploy

---

### **STEP 6: Testing (5 min)**
- [ ] Homepage loads
- [ ] Sign up works
- [ ] Login works
- [ ] Create workspace works
- [ ] Create project works
- [ ] Create task works
- [ ] Upload document works
- [ ] Calendar works
- [ ] Notifications work
- [ ] Mobile responsive
- [ ] Logout works

---

### **STEP 7: Launch! 🎉**
- [ ] Announce on social media
- [ ] Send to beta users
- [ ] Monitor error logs
- [ ] Celebrate! 🎊

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

### **Required (Minimum to run):**
```env
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
```

### **Recommended (Full features):**
```env
⭐ VITE_FIREBASE_API_KEY
⭐ VITE_FIREBASE_AUTH_DOMAIN
⭐ VITE_FIREBASE_PROJECT_ID
⭐ VITE_FIREBASE_STORAGE_BUCKET
⭐ VITE_FIREBASE_MESSAGING_SENDER_ID
⭐ VITE_FIREBASE_APP_ID
⭐ VITE_GOOGLE_API_KEY
⭐ VITE_SENTRY_DSN
```

---

## 🎯 QUICK COMMANDS

### **Development:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

### **Deployment:**
```bash
vercel --prod        # Deploy to Vercel
netlify deploy --prod # Deploy to Netlify
```

### **Verification:**
```bash
npx tsc --noEmit     # Check TypeScript
npm run lint         # Check code quality
```

---

## 🆘 EMERGENCY TROUBLESHOOTING

| Problem | Quick Fix |
|---------|-----------|
| Build fails | `rm -rf node_modules && npm install && npm run build` |
| Env vars not working | Add in platform dashboard, then redeploy |
| Auth not working | Add production URL to Supabase redirect URLs |
| Database errors | Verify all SQL scripts ran successfully |
| Site not loading | Check deployment logs in dashboard |

---

## 📞 IMPORTANT LINKS

- **Supabase:** https://supabase.com/dashboard
- **Vercel:** https://vercel.com/dashboard
- **Netlify:** https://app.netlify.com
- **Sentry:** https://sentry.io
- **Firebase:** https://console.firebase.google.com
- **Google AI:** https://makersuite.google.com

---

## ⏱️ TIME ESTIMATE

| Step | Time |
|------|------|
| Environment Setup | 5 min |
| Database Setup | 10 min |
| Deploy to Platform | 10 min |
| Domain Configuration | 5 min |
| Enable Monitoring | 2 min |
| Testing | 5 min |
| **TOTAL** | **~30 min** |

---

## 🎉 POST-LAUNCH CHECKLIST

### **Immediate (Day 1):**
- [ ] Monitor Sentry for errors
- [ ] Check analytics dashboard
- [ ] Respond to user feedback
- [ ] Fix any critical bugs

### **Week 1:**
- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Plan first update
- [ ] Set up automated backups

### **Month 1:**
- [ ] Review analytics
- [ ] Plan new features
- [ ] Optimize performance
- [ ] Scale infrastructure if needed

---

## 📊 SUCCESS METRICS

Track these after launch:
- ✅ Uptime: Target 99.9%
- ✅ Page load time: Target < 3s
- ✅ Error rate: Target < 1%
- ✅ User signups
- ✅ Active workspaces
- ✅ Tasks created

---

## 🚀 YOU'RE READY!

**Everything is prepared. Just follow the checklist step by step.**

**Estimated time to launch: 30 minutes**

**Good luck! 🎉**

---

**For detailed instructions, see:** `DEPLOYMENT_STEPS.md`
