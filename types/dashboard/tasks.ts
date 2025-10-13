export interface CustomUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

export interface TaskAssignment {
  user: CustomUser;
  assigned_by: CustomUser;
  assigned_at: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date?: string; // ISO date string
  completed_at?: string; // ISO datetime string
  progress?: number; // 0-100
  assigned_users: number[]; 

  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
  created_by: CustomUser;
  assignments: TaskAssignment[];
  is_overdue: boolean;
  is_completed: boolean;
}

export enum TaskStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress', 
  REVIEW = 'review',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface CreateTaskData {
  title: string;
  description?: string;
  notes?: string;
  priority?: PriorityLevel;
  due_date?: string; // ISO date string
  progress?: number;
  position_x?: number;
  position_y?: number;
  assigned_user_ids?: number[]; // Array of user IDs to assign
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  notes?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  due_date?: string;
  progress?: number;
  position_x?: number;
  position_y?: number;
  assigned_user_ids?: number[];
}

export interface AssignUsersData {
  user_ids: number[];
}

export interface UpdateProgressData {
  progress: number; // 0-100
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: PriorityLevel;
  due?: 'today' | 'overdue' | 'upcoming' | 'no_date';
}

export interface AssignTaskResponse {
  task: Task;
  assigned_to: string[];
  message: string;
}

export interface APIResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface APIError {
  error: string;
  details?: Record<string, string[]>;
}