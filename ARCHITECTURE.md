# 🏗️ ORBIT LIVE - Architecture Documentation

## System Overview

ORBIT LIVE is a modern team management and collaboration platform built with a serverless architecture, real-time capabilities, and AI-powered features.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   React UI   │  │   Vite Dev   │  │  TypeScript  │              │
│  │   + Tailwind │  │    Server    │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │Framer Motion │  │  React Query │  │     Zod      │              │
│  │ (Animations) │  │   (Caching)  │  │ (Validation) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS / WSS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API & MIDDLEWARE LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Auth Middle  │  │ Rate Limiter │  │  Validation  │              │
│  │     ware     │  │              │  │  Middleware  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  AI Safety   │  │   Logging    │  │    Error     │              │
│  │   Controls   │  │   (Winston)  │  │   Tracking   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │ Row Level    │  │  Realtime    │              │
│  │   Database   │  │   Security   │  │  Websockets  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Auth (JWT) │  │    Storage   │  │   Functions  │              │
│  │              │  │   (S3-like)  │  │  (Serverless)│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Google Gemini│  │    Sentry    │  │   Vercel     │              │
│  │  AI API      │  │ Error Track  │  │   Hosting    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zod** - Runtime type validation
- **React Hot Toast** - Notifications

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (JWT)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - File storage
  - Edge functions

### Infrastructure
- **Vercel** - Frontend hosting and CDN
- **Supabase Cloud** - Database and backend services
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error tracking and monitoring

### External APIs
- **Google Gemini AI** - AI-powered features
- **OAuth Providers** - Google, GitHub authentication

---

## Data Model

### Core Entities

```sql
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ avatar      │
│ role        │
│ title       │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────────┐
│  group_members  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ group_id (FK)   │
│ role            │
│ joined_at       │
└─────────────────┘
       │
       │ N:1
       ▼
┌─────────────┐       ┌─────────────┐
│   groups    │──────>│   projects  │
├─────────────┤  1:N  ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ name        │       │ name        │
│ description │       │ group_id FK │
│ join_code   │       │ status      │
│ owner_id FK │       │ priority    │
│ created_at  │       │ version     │
└─────────────┘       └─────────────┘
       │                     │
       │ 1:N                 │ 1:N
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    tasks    │       │    tasks    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ project_id  │
│ title       │       │ assigned_to │
│ status      │       │ priority    │
│ group_id FK │       │ version     │
│ created_by  │       │ due_date    │
└─────────────┘       └─────────────┘
```

---

## Security Architecture

### Authentication Flow

```
1. User Login
   │
   ├─> Supabase Auth.signIn()
   │   │
   │   └─> Returns JWT token
   │
2. Token Storage
   │
   ├─> Stored in httpOnly cookie (preferred)
   │   OR localStorage (with XSS protection)
   │
3. API Requests
   │
   ├─> Include: Authorization: Bearer <token>
   │
4. Server Validation
   │
   ├─> Middleware: authenticate()
   │   │
   │   ├─> Verify JWT signature
   │   ├─> Check expiration
   │   └─> Fetch user profile
   │
5. Authorization
   │
   └─> RLS policies enforce data access
```

### Row Level Security (RLS)

All database tables use RLS policies to ensure users can only access data they're authorized to see:

```sql
-- Example: Tasks table
CREATE POLICY "Users can view workspace tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id 
    FROM group_members 
    WHERE user_id = auth.uid()
  )
);
```

---

## Real-Time Architecture

### Subscriptions

```
Client                    Supabase Realtime
  │                              │
  ├─ Subscribe to channel ──────>│
  │  (e.g., workspace:123)       │
  │                              │
  │<─ Confirmation ──────────────┤
  │                              │
  │                              │
  │  Database Change             │
  │  (INSERT/UPDATE/DELETE)      │
  │                              │
  │<─ Event notification ────────┤
  │   { event, record, ... }     │
  │                              │
  └─ Update UI                   │
```

### Event Types
- **INSERT** - New record created
- **UPDATE** - Record modified
- **DELETE** - Record removed
- ****** - All events

---

## Optimistic Locking

### Concurrency Control Flow

```
User A                  Database              User B
  │                        │                     │
  ├─ Read (v1) ──────────>│                     │
  │                        │<──── Read (v1) ─────┤
  │                        │                     │
  ├─ Update (v1→v2) ─────>│                     │
  │<─ Success ─────────────┤                     │
  │                        │                     │
  │                        │<──── Update (v1) ───┤
  │                        ├─ Conflict! ────────>│
  │                        │   (v2 != v1)        │
  │                        │                     │
  │                        │<──── Read (v2) ─────┤
  │                        │<──── Update (v2→v3) ┤
  │                        ├─ Success ──────────>│
```

---

## AI Integration

### AI Request Flow

```
1. User sends prompt
   │
2. Middleware checks:
   ├─ Authentication
   ├─ Quota (daily/monthly)
   ├─ Content validation
   └─ PII masking
   │
3. Check cache
   │
   ├─ Cache hit? ──> Return cached response
   │
4. Send to AI API
   │
   ├─> Google Gemini
   │   └─> Generate response
   │
5. Store response
   ├─ Cache for future use
   ├─ Log usage for quota
   └─ Audit trail
   │
6. Return to user
```

### Safety Measures
- **PII Masking** - Remove sensitive data before AI processing
- **Content Validation** - Check for malicious patterns
- **Quota Enforcement** - Daily/monthly limits per workspace
- **Response Caching** - Reduce API calls and costs
- **Audit Logging** - Track all AI interactions

---

## Deployment Architecture

### Environments

```
┌──────────────────────────────────────────────┐
│              Development                      │
│  • Local: http://localhost:5173              │
│  • Hot reload enabled                        │
│  • Source maps enabled                       │
│  • Debug logging                             │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│               Staging                         │
│  • Vercel preview deployment                 │
│  • staging.orbit-live.com                    │
│  • CI/CD automated                           │
│  • Smoke tests run                           │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│             Production                        │
│  • Vercel production deployment              │
│  • orbit-live.com                            │
│  • Manual approval required                  │
│  • Full test suite                           │
│  • Performance monitoring                    │
└──────────────────────────────────────────────┘
```

---

## Performance Optimizations

### Frontend
- **Code Splitting** - Dynamic imports for routes
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Next-gen formats, lazy loading
- **Bundle Optimization** - Tree shaking, minification
- **Caching** - React Query for server state
- **CDN** - Static assets served from edge

### Backend
- **Database Indexes** - Optimized queries
- **Connection Pooling** - Supabase handles this
- **RLS Policies** - Efficient WHERE clauses
- **Rate Limiting** - Prevent abuse
- **Response Caching** - Reduce database load

---

## Monitoring & Observability

### Metrics Tracked
- **Error Rate** - via Sentry
- **Response Time** - via Sentry Performance
- **Database Queries** - via Supabase dashboard
- **API Usage** - Custom logging
- **User Activity** - Activity logs table
- **AI Usage** - Quota and cost tracking

### Alerting
- **Error Spikes** - Sentry alerts
- **High Response Times** - Performance degradation
- **Quota Exceeded** - AI usage limits
- **Security Events** - Unusual access patterns

---

## Scalability Considerations

### Current Capacity
- **Users**: 10,000+
- **Concurrent**: 1,000+
- **Database**: Supabase scales automatically
- **Storage**: Unlimited via Supabase
- **CDN**: Vercel edge network

### Future Scaling
- **Database Sharding** - If needed for large datasets
- **Read Replicas** - For read-heavy workloads
- **Caching Layer** - Redis for hot data
- **Queue System** - For background jobs
- **Microservices** - If monolith becomes bottleneck

---

## Security Best Practices

### Applied
- ✅ HTTPS everywhere
- ✅ JWT authentication
- ✅ Row Level Security
- ✅ Input validation (Zod)
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secret management
- ✅ Dependency scanning
- ✅ Error tracking

### Future Enhancements
- [ ] OAuth 2.0 implementation
- [ ] 2FA/MFA
- [ ] API key rotation
- [ ] Penetration testing
- [ ] Security audit

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Maintained By**: ORBIT LIVE Team

