'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Circle, CheckCircle, AlertTriangle, Calendar, User, X } from 'lucide-react';
import { completeTask, getMyTasks, updateTask, deleteTask as deleteTaskAPI, createTask } from '@/app/api/dashboard/tasks';
import { getUsers } from '@/app/api/dashboard/proposals';
import { PriorityLevel, TaskStatus, Task, CustomUser } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';
import CreateTaskDialog from './create';
import TaskActions from './actions';
import ViewTaskDialog from './view';
import EditTaskDialog from './edit';
import DeleteTaskDialog from './delete';

const getPriorityColor = (priority: PriorityLevel) => {
  switch (priority) {
    case PriorityLevel.URGENT:
      return 'text-red-600 bg-red-100';
    case PriorityLevel.HIGH:
      return 'text-orange-600 bg-orange-100';
    case PriorityLevel.MEDIUM:
      return 'text-yellow-600 bg-yellow-100';
    case PriorityLevel.LOW:
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

const navigationItems = [
  { key: 'my_tasks', label: 'My Tasks', icon: User },
  { key: 'today', label: 'Today', icon: Calendar },
  { key: 'tomorrow', label: 'Tomorrow', icon: Calendar },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
];

const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getDateDisplayName = (dateStr: string): string => {
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const yesterday = getDateString(-1);
  
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
};

const sortDates = (dates: string[]): string[] => {
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const yesterday = getDateString(-1);
  
  return dates.sort((a, b) => {
    if (a === today) return -1;
    if (b === today) return 1;
    
    if (a === tomorrow) return -1;
    if (b === tomorrow) return 1;
    
    if (a === yesterday) return -1;
    if (b === yesterday) return 1;
    
    return new Date(a).getTime() - new Date(b).getTime();
  });
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<CustomUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyTasks();
        setTasks(Array.isArray(data) ? data : (data as any)?.results || []);
      } catch (error) {
        setError('Failed to fetch tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!showAddTask && !editTask) return;

      try {
        const response = await getUsers();
        setAvailableUsers(Array.isArray(response) ? response : (response as any)?.results || []);
      } catch (error) {
        setError('Failed to load users. Please try again.');
      }
    };

    fetchUsers();
  }, [showAddTask, editTask]);

  const filteredTasks = useMemo(() => {
    const today = getDateString(0);
    const tomorrow = getDateString(1);

    switch (activeFilter) {
      case 'my_tasks':
        return tasks.filter(task => task.status !== TaskStatus.COMPLETED);
      case 'today':
        return tasks.filter(
          task => task.due_date && task.due_date.split('T')[0] === today && task.status !== TaskStatus.COMPLETED
        );
      case 'tomorrow':
        return tasks.filter(
          task => task.due_date && task.due_date.split('T')[0] === tomorrow && task.status !== TaskStatus.COMPLETED
        );
      case 'completed':
        return tasks.filter(task => task.status === TaskStatus.COMPLETED);
      case 'overdue':
        return tasks.filter(task => task.is_overdue && task.status !== TaskStatus.COMPLETED);
      default:
        return tasks;
    }
  }, [tasks, activeFilter]);

  const groupedTasks = useMemo(() => {
    if (activeFilter === 'completed') {
      return { [activeFilter]: filteredTasks };
    }
    
    if (activeFilter === 'overdue') {
      const grouped: { [key: string]: Task[] } = {};
      
      filteredTasks.forEach(task => {
        const dateKey = task.due_date ? task.due_date.split('T')[0] : 'no-date';
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      });
      
      return grouped;
    }

    const grouped: { [key: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      const dateKey = task.due_date ? task.due_date.split('T')[0] : 'no-date';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });

    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        // Overdue tasks first
        if (a.is_overdue && !b.is_overdue) return -1;
        if (!a.is_overdue && b.is_overdue) return 1;
        
        // Then by priority
        const priorityOrder = {
          [PriorityLevel.URGENT]: 4,
          [PriorityLevel.HIGH]: 3,
          [PriorityLevel.MEDIUM]: 2,
          [PriorityLevel.LOW]: 1
        };
        
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });
    });

    return grouped;
  }, [filteredTasks, activeFilter]);

  // Get sorted date keys
  const sortedDateKeys = useMemo(() => {
    const dateKeys = Object.keys(groupedTasks).filter(key => key !== 'no-date' && key !== 'completed' && key !== 'overdue');
    const sorted = sortDates(dateKeys);
    
    if (groupedTasks['no-date']) {
      sorted.push('no-date');
    }
    
    if (groupedTasks['completed']) {
      return ['completed'];
    }
    if (groupedTasks['overdue']) {
      return sorted.length > 0 ? sorted : Object.keys(groupedTasks);
    }
    
    return sorted;
  }, [groupedTasks]);

  const handleTaskClick = useCallback((task: Task) => {
    if (task.status !== TaskStatus.COMPLETED) {
      setTaskToComplete(task);
    }
  }, []);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    try {
      const updatedTask = await completeTask(taskId);
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      setError('Failed to complete task. Please try again.');
      throw error;
    }
  }, []);

  // Handle task creation
  const handleCreateTask = useCallback(async (taskData: any) => {
    try {
      const createdTask = await createTask(taskData);
      setTasks(prevTasks => [createdTask, ...prevTasks]);
      setShowAddTask(false);
      return createdTask;
    } catch (error) {
      setError('Failed to create task. Please try again.');
      throw error;
    }
  }, []);

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? updatedTask : task))
      );
      return updatedTask;
    } catch (error) {
      setError('Failed to update task. Please try again.');
      throw error;
    }
  }, []);

  // Handle task deletion
  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTaskAPI(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Failed to delete task. Please try again.');
      throw error;
    }
  }, []);

  const getFilterCount = useCallback(
    (filter: string) => {
      const today = getDateString(0);
      const tomorrow = getDateString(1);

      switch (filter) {
        case 'my_tasks':
          return tasks.filter(task => task.status !== TaskStatus.COMPLETED).length;
        case 'today':
          return tasks.filter(
            task => task.due_date && task.due_date.split('T')[0] === today && task.status !== TaskStatus.COMPLETED
          ).length;
        case 'tomorrow':
          return tasks.filter(
            task => task.due_date && task.due_date.split('T')[0] === tomorrow && task.status !== TaskStatus.COMPLETED
          ).length;
        case 'completed':
          return tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
        case 'overdue':
          return tasks.filter(task => task.is_overdue && task.status !== TaskStatus.COMPLETED)
            .length;
        default:
          return 0;
      }
    },
    [tasks]
  );

  const getAssignedUsersText = (task: Task): string => {
    if (!task.assignments || task.assignments.length === 0) return '';
    
    const usernames = task.assignments
      .map(assignment => assignment.user?.username)
      .filter(Boolean);
    
    return usernames.join(', ');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-1 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto space-y-4 sm:space-y-0">
          <Button
            onClick={() => setShowAddTask(true)}
            className="flex items-center space-x-2 bg-[#27aae1] text-white hover:bg-[#1e8bb8] mx-2 sm:mx-0"
          >
            <Plus size={16} />
            <span className="font-medium">Add Task</span>
          </Button>
          
          <nav className="overflow-x-auto">
            <div className="flex items-center space-x-2 sm:space-x-6 px-2 sm:px-0 pb-2 sm:pb-0">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const count = getFilterCount(item.key);
                const isActive = activeFilter === item.key;

                return (
                  <Button
                    key={item.key}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => {
                      setActiveFilter(item.key);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center space-x-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${
                      isActive
                        ? 'bg-[#27aae1] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#27aae1]'
                    } ${item.key === 'overdue' && count > 0 ? 'hover:text-[#fe7105]' : ''}`}
                  >
                    <Icon size={14} className="sm:size-4" />
                    <span className="font-medium">{item.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.key === 'overdue'
                            ? 'bg-[#fe7105] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-6 py-4 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae1]"></div>
            <span className="ml-3 text-gray-800">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 mx-2">
            <AlertTriangle className="mx-auto h-12 w-12 text-[#fe7105] mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
            <p className="text-gray-800 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
            >
              Retry
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 mx-2">
            <Circle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
            </h3>
            <p className="text-gray-800">
              {activeFilter === 'today'
                ? 'You have no tasks due today. Great job!'
                : activeFilter === 'tomorrow'
                ? 'You have no tasks due tomorrow. Great job!'
                : activeFilter === 'overdue'
                ? 'No overdue tasks. You\'re all caught up!'
                : 'Get started by creating your first task.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-2">
            {sortedDateKeys.map(dateKey => {
              const tasksForDate = groupedTasks[dateKey];
              const isOverdueSection = dateKey !== 'no-date' && dateKey !== 'completed' && tasksForDate.some(task => task.is_overdue);
              
              return (
                <div key={dateKey} className="space-y-3 sm:space-y-4 mx-2 sm:mx-0">
                  <div className={`flex items-center space-x-2 pb-2 border-b-2 ${
                    isOverdueSection ? 'border-[#fe7105]' : 'border-gray-200'
                  }`}>
                    <h2 className={`text-base sm:text-lg font-semibold ${
                      isOverdueSection ? 'text-[#fe7105]' : 'text-gray-800'
                    }`}>
                      {dateKey === 'no-date' 
                        ? 'No Due Date' 
                        : dateKey === 'completed' 
                        ? 'Completed Tasks'
                        : getDateDisplayName(dateKey)}
                    </h2>
                    <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                      isOverdueSection 
                        ? 'bg-[#fe7105] text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tasksForDate.length}
                    </span>
                    {isOverdueSection && (
                      <AlertTriangle size={14} className="sm:size-4 text-[#fe7105]" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {tasksForDate.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white border rounded-lg hover:shadow-sm transition-all duration-200 group ${
                          task.is_overdue 
                            ? 'border-[#fe7105] hover:border-[#fe7105]' 
                            : 'border-gray-200 hover:border-[#27aae1]'
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTaskClick(task)}
                          disabled={task.status === TaskStatus.COMPLETED}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                            task.status === TaskStatus.COMPLETED
                              ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                              : task.is_overdue
                              ? 'border-[#fe7105] hover:border-[#fe7105] group-hover:border-[#fe7105]'
                              : 'border-gray-300 hover:border-[#27aae1] group-hover:border-[#27aae1]'
                          }`}
                          title={task.status === TaskStatus.COMPLETED ? 'Task completed' : 'Click to mark as complete'}
                        >
                          {task.status === TaskStatus.COMPLETED && (
                            <CheckCircle size={16} className="text-white" />
                          )}
                        </Button>
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h3
                              className={`font-medium text-sm sm:text-base truncate ${
                                task.status === TaskStatus.COMPLETED 
                                  ? 'text-gray-500 line-through' 
                                  : task.is_overdue
                                  ? 'text-[#fe7105]'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                            {task.is_overdue && (
                              <span className="text-xs px-2 py-1 rounded-full bg-[#fe7105] text-white flex-shrink-0">
                                Overdue
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs sm:text-sm text-gray-800 mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs text-gray-500 space-y-1 sm:space-y-0">
                            <span>
                              Created by: {task.created_by?.username || 'Unknown'}
                            </span>
                            {getAssignedUsersText(task) && (
                              <span>
                                Assigned to: {getAssignedUsersText(task)}
                              </span>
                            )}
                          </div>
                        </div>
                        <TaskActions
                          task={task}
                          onEdit={setEditTask}
                          onView={setViewTask}
                          onDelete={setTaskToDelete}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateTaskDialog
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onSubmit={handleCreateTask}
          availableUsers={availableUsers}
        />

        <ViewTaskDialog
          task={viewTask}
          isOpen={!!viewTask}
          onClose={() => setViewTask(null)}
        />

        <EditTaskDialog
          task={editTask}
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          onUpdate={handleUpdateTask}
          availableUsers={availableUsers}
        />

        <DeleteTaskDialog
          task={taskToDelete}
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
        />

        {taskToComplete && (
          <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTaskToComplete(null)}
                  className="hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </Button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Mark this task as completed?</h3>
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="font-medium text-gray-900">{taskToComplete.title}</p>
                      {taskToComplete.description && (
                        <p className="text-sm text-gray-800 mt-1 line-clamp-2">{taskToComplete.description}</p>
                      )}
               
                    </div>
                    <p className="text-sm text-gray-800">
                      This will mark the task as completed and move it to your completed tasks.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTaskToComplete(null)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleCompleteTask(taskToComplete.id);
                      setTaskToComplete(null);
                    }}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    <span>Mark Complete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;