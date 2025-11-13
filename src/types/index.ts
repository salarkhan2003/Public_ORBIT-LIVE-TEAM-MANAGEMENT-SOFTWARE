export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  title?: string;
  position?: string;
  department?: string;
  phone?: string;
  custom_roles?: string[];
  bio?: string;
  skills?: string[];
  location?: string;
  timezone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  group_owner_id: string;
  join_code: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  users?: User;
  groups?: Group;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'started' | 'in_progress' | 'need_time' | 'completed' | 'active' | 'on_hold';
  created_by: string;
  group_id: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  progress: number;
  team_members: string[];
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assigned_to?: string;
  created_by: string;
  status: 'started' | 'in_progress' | 'need_time' | 'completed' | 'todo' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  created_at: string;
  updated_at: string;
  group_id: string;
  assignee?: User;
  creator?: User;
  projects?: { name: string };
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  task_id: string;
  created_at: string;
  user?: User;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  project_id?: string;
  group_id: string;
  uploaded_by: string;
  category: 'design' | 'development' | 'documentation' | 'media' | 'other';
  created_at: string;
  uploader?: User;
}

export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  group_id: string;
  project_id?: string;
  category: 'design' | 'development' | 'documentation' | 'media' | 'other';
  tags: string[];
  is_public: boolean;
  created_at: string;
  uploader?: User;
  project?: Project;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  group_id: string;
  created_by: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: string[];
  created_at: string;
  updated_at: string;
  creator?: User;
  attendee_users?: User[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  user_id: string;
  read: boolean;
  metadata?: Record<string, any>;
  action_url?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'project_updated' | 'document_uploaded' | 'meeting_scheduled' | 'user_joined' | 'user_left';
  description: string;
  user_id: string;
  group_id: string;
  entity_type?: string;
  entity_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  user?: User;
}

export interface UserSettings {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string | boolean | number;
  setting_type: 'notification' | 'privacy' | 'appearance' | 'preference';
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  group_id: string;
  title?: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Analytics {
  tasks_completed: number;
  tasks_created: number;
  documents_uploaded: number;
  meetings_created: number;
  productivity_score: number;
  activity_trend: Array<{
    date: string;
    tasks: number;
    documents: number;
    meetings: number;
  }>;
  team_performance: Array<{
    user_id: string;
    user_name: string;
    tasks_completed: number;
    productivity_score: number;
  }>;
}