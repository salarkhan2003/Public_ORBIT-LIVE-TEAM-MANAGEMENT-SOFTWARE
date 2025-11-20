import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Backend will not be able to access the database until these are configured.');
}

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Core middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);



// API Gateway authentication middleware (Legacy/Internal)
const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (apiKey && apiKey === process.env.API_GATEWAY_KEY) {
    return next();
  }

  // Fallback to user authentication
  authenticate(req, res, next);
};

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply authentication to all API routes
app.use('/api', requireApiKey);

// ==================== PROJECTS ENDPOINTS ====================

// Get all projects for a group
app.get('/api/groups/:groupId/projects', async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_created_by_fkey(id, name, email, avatar)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch projects', success: false });
  }
});

// Get single project
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_created_by_fkey(id, name, email, avatar)
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch project', success: false });
  }
});

// Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, group_id, created_by, deadline, team_members } = req.body;

    if (!name || !group_id || !created_by) {
      return res.status(400).json({
        error: 'Missing required fields: name, group_id, created_by',
        success: false,
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          group_id,
          created_by,
          deadline,
          team_members: team_members || [],
          status: 'active',
          progress: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data, success: true });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to create project', success: false });
  }
});

// Update project
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to update project', success: false });
  }
});

// Delete project
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to delete project', success: false });
  }
});

// ==================== TASKS ENDPOINTS ====================

// Get all tasks for a project
app.get('/api/projects/:projectId/tasks', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assigned_to_fkey(id, name, email, avatar),
        creator:users!tasks_created_by_fkey(id, name, email, avatar),
        projects(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch project tasks', success: false });
  }
});

// Get all tasks for a group
app.get('/api/groups/:groupId/tasks', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status, assigned_to } = req.query;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assigned_to_fkey(id, name, email, avatar),
        creator:users!tasks_created_by_fkey(id, name, email, avatar),
        projects(name)
      `)
      .eq('group_id', groupId);

    if (status) query = query.eq('status', status);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching group tasks:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch group tasks', success: false });
  }
});

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, project_id, group_id, assigned_to, created_by, priority, deadline, status } = req.body;

    if (!title || !group_id || !created_by) {
      return res.status(400).json({
        error: 'Missing required fields: title, group_id, created_by',
        success: false,
      });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          project_id,
          group_id,
          assigned_to,
          created_by,
          priority: priority || 'medium',
          deadline,
          status: status || 'todo',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data, success: true });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to create task', success: false });
  }
});

// Update task
app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to update task', success: false });
  }
});

// Delete task
app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to delete task', success: false });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get group analytics
app.get('/api/groups/:groupId/analytics', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get task stats
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status, created_at')
      .eq('group_id', groupId);

    if (tasksError) throw tasksError;

    // Get activity logs
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_logs')
      .select('action, created_at')
      .eq('group_id', groupId);

    if (activitiesError) throw activitiesError;

    const safeTasks = tasks || [];
    const safeActivities = activities || [];

    // Calculate metrics
    const analytics = {
      tasks_completed: safeTasks.filter((t) => t.status === 'done').length,
      tasks_in_progress: safeTasks.filter((t) => t.status === 'in_progress').length,
      tasks_todo: safeTasks.filter((t) => t.status === 'todo').length,
      total_tasks: safeTasks.length,
      recent_activities: safeActivities.slice(0, 10),
      completion_rate:
        safeTasks.length > 0
          ? ((safeTasks.filter((t) => t.status === 'done').length / safeTasks.length) * 100).toFixed(1)
          : 0,
    };

    res.json({ data: analytics, success: true });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch analytics', success: false });
  }
});

// ==================== DOCUMENTS ENDPOINTS ====================

// Get documents for a group
app.get('/api/groups/:groupId/documents', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category } = req.query;

    let query = supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploaded_by_fkey(id, name, email, avatar)
      `)
      .eq('group_id', groupId);

    if (category) query = query.eq('category', category);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: (error && error.message) || 'Failed to fetch documents', success: false });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err?.message || 'Unexpected error',
    success: false,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    success: false,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Track Boss API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔒 API Gateway authentication enabled');
});

export default app;

