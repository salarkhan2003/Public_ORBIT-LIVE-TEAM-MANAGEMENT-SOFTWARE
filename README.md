
### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Manual
```bash
npm run build
# Upload 'dist' folder to your hosting
```

## 📞 Support

- **Email**: orbitlive.info@gmail.com
- **Phone**: +91 7993547438
- **Location**: Guntur 522001, Andhra Pradesh, India

## 📄 License

Copyright © 2025 ORBIT LIVE TEAM - All rights reserved.

## 🎯 Version

**Current Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: November 14, 2025

---

**Built with ❤️ for modern teams**
# 🚀 ORBIT LIVE TEAM - AI-Powered Team Management

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)]()
[![Mobile Responsive](https://img.shields.io/badge/mobile-responsive-blue)]()
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()

> Modern, AI-powered team collaboration platform with real-time updates, task management, and analytics.

## ✨ Features

- 👥 **Team Collaboration** - Real-time workspace with unlimited team members
- 📊 **Project Management** - Organize projects and track progress
- ✅ **Task Management** - Create, assign, and manage tasks with deadlines
- 🤖 **AI Assistant** - Smart AI-powered help and automation
- 📅 **Calendar** - Schedule and track team events
- 📈 **Analytics** - Insights and productivity metrics
- 📁 **Document Management** - Share and organize files
- 🌓 **Dark Mode** - Beautiful dark and light themes
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database
Run these SQL files in Supabase SQL Editor (in order):
1. `supabase/FIX_INFINITE_RECURSION.sql`
2. `supabase/FIX_CREATED_AT_COLUMN.sql`
3. `supabase/CREATE_TABLES_BULLETPROOF.sql`

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📖 Documentation

- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Server Setup**: See `server/README.md`
- **Database**: SQL scripts in `supabase/` folder

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Framer Motion, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: Google Gemini API
- **Forms**: Formspree

## 📱 Mobile Support

Fully responsive design that works on:
- ✅ Mobile phones (< 640px)
- ✅ Tablets (640px - 1024px)
- ✅ Desktops (> 1024px)

## 🔐 Authentication

- Email/Password authentication
- Google OAuth integration
- Secure session management
- Row Level Security (RLS)

## 📊 Key Pages

- **Dashboard** - Overview of projects, tasks, and team activity
- **Projects** - Manage all your projects
- **Tasks** - Track and assign tasks
- **Team** - View and manage team members
- **Documents** - File sharing and organization
- **Calendar** - Schedule and events
- **Analytics** - Performance insights
- **AI Assistant** - Smart help and automation
- **Settings** - Customize your workspace

## 🚀 Deployment

