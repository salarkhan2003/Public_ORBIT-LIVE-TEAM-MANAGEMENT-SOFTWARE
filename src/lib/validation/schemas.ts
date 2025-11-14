// Input Validation Schemas using Zod
import { z } from 'zod';

// =====================================================
// USER SCHEMAS
// =====================================================

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  avatar: z.string().url().optional().nullable(),
  role: z.enum(['admin', 'developer', 'designer', 'manager', 'viewer']).default('developer'),
  title: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export const UpdateUserProfileSchema = UserProfileSchema.partial();

// =====================================================
// WORKSPACE/GROUP SCHEMAS
// =====================================================

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
});

export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial();

export const JoinWorkspaceSchema = z.object({
  join_code: z.string().length(6).toUpperCase(),
});

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'owner', 'member']),
});

// =====================================================
// PROJECT SCHEMAS
// =====================================================

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  group_id: z.string().uuid(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).default('planning'),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().int().positive().optional(),
});

// =====================================================
// TASK SCHEMAS
// =====================================================

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  group_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
  estimated_hours: z.number().positive().max(1000).optional().nullable(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().int().positive().optional(),
});

export const BulkUpdateTasksSchema = z.object({
  task_ids: z.array(z.string().uuid()).min(1).max(100),
  updates: z.object({
    status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigned_to: z.string().uuid().optional().nullable(),
    project_id: z.string().uuid().optional().nullable(),
  }),
});

// =====================================================
// DOCUMENT SCHEMAS
// =====================================================

export const UploadDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  group_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_size: z.number().positive().max(50 * 1024 * 1024), // 50MB max
  file_type: z.string().min(1).max(100),
  file_path: z.string().min(1),
});

export const UpdateDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
});

// =====================================================
// MEETING SCHEMAS
// =====================================================

export const CreateMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  group_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.string().max(200).optional().nullable(),
  meeting_url: z.string().url().optional().nullable(),
  attendees: z.array(z.string().uuid()).optional(),
  agenda: z.string().max(5000).optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
}).refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
);

export const UpdateMeetingSchema = CreateMeetingSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// AI CONVERSATION SCHEMAS
// =====================================================

export const CreateAIMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  group_id: z.string().uuid(),
  message: z.string().min(1).max(10000),
  context: z.object({
    task_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    document_id: z.string().uuid().optional(),
  }).optional(),
});

export const AIQuotaCheckSchema = z.object({
  group_id: z.string().uuid(),
});

// =====================================================
// NOTIFICATION SCHEMAS
// =====================================================

export const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  action_url: z.string().url().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateNotificationSchema = z.object({
  id: z.string().uuid(),
  is_read: z.boolean(),
});

export const BulkMarkReadSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1).max(100),
});

// =====================================================
// ACTIVITY LOG SCHEMAS
// =====================================================

export const CreateActivityLogSchema = z.object({
  group_id: z.string().uuid(),
  action: z.enum([
    'created', 'updated', 'deleted',
    'assigned', 'completed', 'commented',
    'uploaded', 'downloaded', 'shared',
    'invited', 'removed', 'joined', 'left',
  ]),
  entity_type: z.enum(['task', 'project', 'document', 'meeting', 'user', 'workspace']),
  entity_id: z.string().uuid(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// =====================================================
// SEARCH & FILTER SCHEMAS
// =====================================================

export const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  entity_types: z.array(z.enum(['task', 'project', 'document', 'user'])).optional(),
  workspace_id: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const TaskFilterSchema = z.object({
  status: z.array(z.enum(['todo', 'in_progress', 'review', 'done', 'blocked'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  assigned_to: z.array(z.string().uuid()).optional(),
  project_id: z.string().uuid().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'due_date', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// =====================================================
// PAGINATION SCHEMA
// =====================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// =====================================================
// UUID PARAM SCHEMA
// =====================================================

export const UUIDParamSchema = z.object({
  id: z.string().uuid(),
});

export const WorkspaceParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

// =====================================================
// VALIDATION HELPER TYPES
// =====================================================

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof UpdateMeetingSchema>;
export type TaskFilterInput = z.infer<typeof TaskFilterSchema>;

// =====================================================
// VALIDATION ERROR FORMATTER
// =====================================================

export function formatValidationError(error: z.ZodError) {
  return {
    error: 'Validation Error',
    message: 'Invalid input data',
    details: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}

