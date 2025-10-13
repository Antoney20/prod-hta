import { 
  APIResponse, 
  CreateTaskData, 
  Task, 
  UpdateTaskData, 
  TaskFilters,
  AssignUsersData,
  AssignTaskResponse,
  UpdateProgressData 
} from "@/types/dashboard/tasks";
import api from "../../auth";

const TASKS_ENDPOINT = '/v2/proj/tasks/';

/**
 * Get all tasks (for admins) or user's tasks (for regular users)
 */
export const getTasks = async (filters?: TaskFilters): Promise<APIResponse<Task>> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.due) params.append('due', filters.due);
    
    const queryString = params.toString();
    const url = queryString ? `${TASKS_ENDPOINT}?${queryString}` : TASKS_ENDPOINT;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

/**
 * Get current user's tasks
 */
export const getMyTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.due) params.append('due', filters.due);
    
    const queryString = params.toString();
    const url = queryString ? `${TASKS_ENDPOINT}my_tasks/?${queryString}` : `${TASKS_ENDPOINT}my_tasks/`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch my tasks');
  }
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get(`${TASKS_ENDPOINT}completed_tasks/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch completed tasks');
  }
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.get(`${TASKS_ENDPOINT}${taskId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch task');
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  try {
    const response = await api.post(TASKS_ENDPOINT, taskData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create task');
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: string, taskData: UpdateTaskData): Promise<Task> => {
  try {
    const response = await api.patch(`${TASKS_ENDPOINT}${taskId}/`, taskData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update task');
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await api.delete(`${TASKS_ENDPOINT}${taskId}/`);
  } catch (error) {
    throw new Error('Failed to delete task');
  }
};

/**
 * Mark a task as completed
 */
export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.post(`${TASKS_ENDPOINT}${taskId}/complete/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to complete task');
  }
};

/**
 * Reopen a completed task
 */
export const reopenTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.post(`${TASKS_ENDPOINT}${taskId}/reopen/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to reopen task');
  }
};

/**
 * Assign multiple users to a task (admin/manager only)
 */
export const assignUsersToTask = async (
  taskId: string, 
  userData: AssignUsersData
): Promise<AssignTaskResponse> => {
  try {
    const response = await api.post(`${TASKS_ENDPOINT}${taskId}/assign_users/`, userData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to assign users to task');
  }
};

/**
 * Update task progress
 */
export const updateTaskProgress = async (
  taskId: string, 
  progressData: UpdateProgressData
): Promise<Task> => {
  try {
    const response = await api.patch(`${TASKS_ENDPOINT}${taskId}/update_progress/`, progressData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update task progress');
  }
};



/**
 * Get today's tasks
 */
export const getTodayTasks = async (): Promise<Task[]> => {
  return getMyTasks({ due: 'today' });
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = async (): Promise<Task[]> => {
  return getMyTasks({ due: 'overdue' });
};

/**
 * Get upcoming tasks
 */
export const getUpcomingTasks = async (): Promise<Task[]> => {
  return getMyTasks({ due: 'upcoming' });
};

/**
 * Get tasks with no due date
 */
export const getTasksWithoutDate = async (): Promise<Task[]> => {
  return getMyTasks({ due: 'no_date' });
};

/**
 * Quick task creation with just title
 */
export const createQuickTask = async (title: string): Promise<Task> => {
  return createTask({ title });
};

/**
 * Create task with assignment
 */
export const createTaskAndAssign = async (
  taskData: CreateTaskData,
  userIds: number[]
): Promise<Task> => {
  return createTask({
    ...taskData,
    assigned_user_ids: userIds
  });
};