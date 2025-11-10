# Track Boss AI - Server Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase project set up with service role key

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
SUPABASE_URL=https://iclnquvhushnvjzzcjrs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
API_GATEWAY_KEY=your_secure_random_key_here
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## API Endpoints

All API endpoints require the `x-api-key` header with your API_GATEWAY_KEY.

### Projects
- `GET /api/groups/:groupId/projects` - Get all projects for a group
- `GET /api/projects/:projectId` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project

### Tasks
- `GET /api/projects/:projectId/tasks` - Get tasks for a project
- `GET /api/groups/:groupId/tasks` - Get all tasks for a group
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task

### Analytics
- `GET /api/groups/:groupId/analytics` - Get group analytics

### Documents
- `GET /api/groups/:groupId/documents` - Get group documents

### Health Check
- `GET /health` - Server health check (no auth required)

## Example API Call

```javascript
const response = await fetch('http://localhost:3001/api/groups/GROUP_ID/projects', {
  headers: {
    'x-api-key': 'your_api_gateway_key',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

## Security Features
- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes per IP)
- API key authentication on all `/api/*` routes
- Service role key for bypassing RLS when needed

## Deployment
Deploy to any Node.js hosting platform:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS/Azure/GCP

Remember to set all environment variables in your hosting platform.

