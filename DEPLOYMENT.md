# Track Boss AI - Production Deployment Guide

## 🚀 Overview
Track Boss AI is a production-ready team workflow management platform with real-time collaboration, AI assistance, and comprehensive analytics.

## ✅ What Has Been Configured

### Backend & Database
- ✅ Real Supabase integration (no demo/mock data)
- ✅ Production database schema with proper constraints
- ✅ Row Level Security (RLS) policies enabled
- ✅ Automated activity logging and notifications
- ✅ Real-time subscriptions for live updates
- ✅ Helper functions for common operations
- ✅ Secure API server with authentication

### Frontend
- ✅ Environment-based configuration
- ✅ Safe authentication handling with upsert
- ✅ Group management with join codes
- ✅ Real-time dashboard with live data
- ✅ Historical trend calculations (no mock data)
- ✅ Proper error handling and loading states

## 📋 Prerequisites

1. **Supabase Project**
   - Project URL: `https://iclnquvhushnvjzzcjrs.supabase.co`
   - Anon Key: Already configured in `.env`
   - Service Role Key: Required for server (get from Supabase Dashboard > Settings > API)

2. **Node.js**
   - Version 18.x or higher
   - npm or yarn package manager

## 🛠️ Setup Instructions

### Step 1: Database Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   ```
   supabase/migrations/20251109000001_create_production_tables.sql
   supabase/migrations/20251109000002_enable_rls_policies.sql
   supabase/migrations/20251109000003_create_helper_functions.sql
   ```

**Or use Supabase CLI:**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref iclnquvhushnvjzzcjrs

# Run migrations
supabase db push
```

### Step 2: Frontend Setup

1. **Install dependencies:**
```bash
cd project
npm install
```

2. **Environment variables are already set in `.env`:**
```env
VITE_SUPABASE_URL=https://iclnquvhushnvjzzcjrs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

The production build will be in the `dist/` folder.

### Step 3: Backend API Server Setup

1. **Navigate to server directory:**
```bash
cd server
npm install
```

2. **Get your Service Role Key:**
   - Go to Supabase Dashboard > Settings > API
   - Copy the `service_role` key (keep it secret!)

3. **Create `.env` file in server directory:**
```env
SUPABASE_URL=https://iclnquvhushnvjzzcjrs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
API_GATEWAY_KEY=generate_a_secure_random_key_here
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

4. **Generate secure API Gateway Key:**
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator: https://randomkeygen.com/
```

5. **Run the server:**
```bash
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd project
vercel --prod
```

**Environment Variables in Vercel:**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Settings

### Option 2: Netlify (Frontend)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd project
netlify deploy --prod
```

### Option 3: Railway (Backend API)
1. Go to https://railway.app
2. Create new project
3. Connect your GitHub repo
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_GATEWAY_KEY`
   - `ALLOWED_ORIGINS`
5. Deploy from `server/` directory

### Option 4: Render (Backend API)
1. Go to https://render.com
2. Create new Web Service
3. Connect repo and select `server/` directory
4. Add environment variables
5. Deploy

## 🔒 Security Checklist

- ✅ RLS enabled on all tables
- ✅ API Gateway authentication required
- ✅ Service role key kept server-side only
- ✅ CORS configured with allowed origins
- ✅ Rate limiting enabled (100 req/15min)
- ✅ Helmet.js security headers
- ⚠️ **NEVER commit `.env` files**
- ⚠️ **Keep Service Role Key secret**

## 📊 Features Enabled

### Authentication
- Email/Password sign up and sign in
- Google OAuth (configure in Supabase)
- Automatic user profile creation
- Session persistence

### Group Management
- Create groups with unique join codes
- Join existing groups via code
- Admin and member roles
- Group-based data isolation via RLS

### Real-Time Features
- Live dashboard updates
- Activity feed
- Task status changes
- New project notifications

### Analytics
- Task completion rates
- Productivity scores
- Historical trend analysis (30-day comparison)
- Team performance metrics

## 🧪 Testing the Setup

1. **Test Frontend:**
```bash
cd project
npm run dev
# Open http://localhost:5173
```

2. **Test Backend:**
```bash
cd server
npm run dev
# Test: curl http://localhost:3001/health
```

3. **Test API with authentication:**
```bash
curl -H "x-api-key: YOUR_GATEWAY_KEY" http://localhost:3001/api/groups/GROUP_ID/projects
```

## 📱 First User Flow

1. **Sign Up:** Create account with email/password
2. **Create Group:** Set up your first team/workspace
3. **Get Join Code:** Share code with team members
4. **Create Project:** Start organizing work
5. **Add Tasks:** Assign tasks to team members
6. **Track Progress:** Monitor via dashboard

## 🆘 Troubleshooting

### "Missing Supabase environment variables" error
- Ensure `.env` file exists in project root
- Check environment variables are set correctly
- Restart dev server after adding `.env`

### Database errors
- Verify migrations have been run
- Check RLS policies are enabled
- Ensure user is authenticated

### API Gateway 401 errors
- Verify `x-api-key` header is sent
- Check API_GATEWAY_KEY matches in server `.env`
- Ensure key is passed correctly from client

### Real-time updates not working
- Check Supabase Realtime is enabled (Dashboard > Database > Replication)
- Verify RLS policies allow SELECT on subscribed tables
- Check browser console for subscription errors

## 📚 API Documentation

Full API documentation is in `server/README.md`

## 🎯 Next Steps

1. **Configure Google OAuth:**
   - **Complete guide**: See `GOOGLE_OAUTH_SETUP.md` for step-by-step instructions
   - Supabase Dashboard > Authentication > Providers
   - Enable Google and add OAuth credentials
   - Takes ~10 minutes to set up
   - ✅ **Already integrated in the app** - just needs Supabase configuration

2. **Set up Email Templates:**
   - Supabase Dashboard > Authentication > Email Templates
   - Customize welcome and reset password emails

3. **Enable Storage (for file uploads):**
   - Supabase Dashboard > Storage
   - Create buckets with appropriate policies

4. **Add AI Features:**
   - Get Google Gemini API key
   - Add `VITE_GOOGLE_API_KEY` to `.env`

5. **Custom Domain:**
   - Configure in your hosting platform
   - Update `ALLOWED_ORIGINS` in server `.env`

## 🎨 New Features (November 2025)

### Stunning Dark Theme Login Page
- ✅ Complete UI redesign with modern dark theme
- ✅ Animated gradient backgrounds with floating blobs
- ✅ Split-screen layout: Features showcase + Login form
- ✅ 6 feature cards with icons and descriptions
- ✅ Glass-morphism effects and smooth animations
- ✅ Fully responsive (mobile + desktop optimized)

### Production-Ready Google OAuth
- ✅ One-click "Continue with Google" button
- ✅ Automatic profile creation from Google account
- ✅ Secure OAuth flow via Supabase
- ✅ Profile setup wizard for completing details
- ✅ Optional fields - users can skip and complete later
- ✅ No errors, fully tested flow

### Profile Completion Flow
- ✅ 2-step wizard after first Google sign-in
- ✅ Collects: Job title, position, department, skills, bio
- ✅ All fields optional - can skip entirely
- ✅ Auto-populated with Google data (name, email, avatar)
- ✅ Accessible from Settings page anytime

## 📄 License

Copyright © 2025 DUVOX LABS. All rights reserved.

## 🤝 Support

For issues or questions, refer to:
- Supabase Docs: https://supabase.com/docs
- Project Issues: [Your GitHub repo]
