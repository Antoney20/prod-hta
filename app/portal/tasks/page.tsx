'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Circle, CheckCircle, AlertTriangle, Calendar, User, Eye, Edit2, Trash2, X } from 'lucide-react';
import { completeTask, getMyTasks, updateTask, deleteTask as deleteTaskAPI, createTask } from '@/app/api/dashboard/tasks';
import { getUsers } from '@/app/api/dashboard/proposals';
import { PriorityLevel, TaskStatus, Task, CustomUser } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';
import CreateTaskDialog from './create';
import ViewTaskDialog from './view';
import EditTaskDialog from './edit';
import DeleteTaskDialog from './delete';

const MAX_SELECTION = 3;

const priorityStyles: Record<string, string> = {
  urgent: 'text-red-700 bg-red-50 border-red-200',
  high:   'text-orange-700 bg-orange-50 border-orange-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  low:    'text-green-700 bg-green-50 border-green-200',
};

const navigationItems = [
  { key: 'my_tasks',  label: 'My Tasks',  icon: User },
  { key: 'today',     label: 'Today',     icon: Calendar },
  { key: 'tomorrow',  label: 'Tomorrow',  icon: Calendar },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'overdue',   label: 'Overdue',   icon: AlertTriangle },
];

const getDateString = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('my_tasks');
  const [showAddTask, setShowAddTask] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<CustomUser[]>([]);

  const [viewTask, setViewTask]         = useState<Task | null>(null);
  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await getMyTasks();
        setTasks(Array.isArray(data) ? data : (data as any)?.results || []);
      } catch { setError('Failed to fetch tasks. Please try again.'); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!showAddTask && !editTask) return;
    (async () => {
      try {
        const res = await getUsers();
        setAvailableUsers(Array.isArray(res) ? res : (res as any)?.results || []);
      } catch { setError('Failed to load users. Please try again.'); }
    })();
  }, [showAddTask, editTask]);

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeFilter]);

  const filteredTasks = useMemo(() => {
    const today    = getDateString(0);
    const tomorrow = getDateString(1);

    switch (activeFilter) {
      case 'my_tasks':
        return tasks.filter(t => t.status !== TaskStatus.COMPLETED);
      case 'today':
        return tasks.filter(t => t.due_date?.split('T')[0] === today && t.status !== TaskStatus.COMPLETED);
      case 'tomorrow':
        return tasks.filter(t => t.due_date?.split('T')[0] === tomorrow && t.status !== TaskStatus.COMPLETED);
      case 'completed':
        return tasks.filter(t => t.status === TaskStatus.COMPLETED);
      case 'overdue':
        return tasks.filter(t => t.is_overdue && t.status !== TaskStatus.COMPLETED);
      default:
        return tasks;
    }
  }, [tasks, activeFilter]);

  const getFilterCount = useCallback((filter: string) => {
    const today    = getDateString(0);
    const tomorrow = getDateString(1);
    switch (filter) {
      case 'my_tasks':  return tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
      case 'today':     return tasks.filter(t => t.due_date?.split('T')[0] === today && t.status !== TaskStatus.COMPLETED).length;
      case 'tomorrow':  return tasks.filter(t => t.due_date?.split('T')[0] === tomorrow && t.status !== TaskStatus.COMPLETED).length;
      case 'completed': return tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      case 'overdue':   return tasks.filter(t => t.is_overdue && t.status !== TaskStatus.COMPLETED).length;
      default: return 0;
    }
  }, [tasks]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    try {
      const updated = await completeTask(taskId);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
    } catch { setError('Failed to complete task. Please try again.'); }
  }, []);

  const handleCreateTask = useCallback(async (taskData: any) => {
    try {
      const created = await createTask(taskData);
      setTasks(prev => [created, ...prev]);
      setShowAddTask(false);
      return created;
    } catch (e) { setError('Failed to create task. Please try again.'); throw e; }
  }, []);

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(taskId, updates);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      return updated;
    } catch (e) { setError('Failed to update task. Please try again.'); throw e; }
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTaskAPI(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    } catch (e) { setError('Failed to delete task. Please try again.'); throw e; }
  }, []);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTION) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkComplete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      const t = tasks.find(x => x.id === id);
      if (t && t.status !== TaskStatus.COMPLETED) {
        await handleCompleteTask(id);
      }
    }
    clearSelection();
  }, [selectedIds, tasks, handleCompleteTask, clearSelection]);

  const handleBulkView = useCallback(() => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    const task = tasks.find(t => t.id === id);
    if (task) setViewTask(task);
  }, [selectedIds, tasks]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    const task = tasks.find(t => t.id === id);
    if (task) setTaskToDelete(task);
  }, [selectedIds, tasks]);

  const assignedNames = (t: Task) =>
    t.assignments?.map(a => a.user?.username).filter(Boolean).join(', ') || '—';

  const selectionCount = selectedIds.size;
  const canSelectMore  = selectionCount < MAX_SELECTION;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-4">
          <Button
            onClick={() => setShowAddTask(true)}
            className="flex items-center space-x-2 bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
          >
            <Plus size={16} />
            <span className="font-medium">Add Task</span>
          </Button>

          <nav className="overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const count = getFilterCount(item.key);
                const isActive = activeFilter === item.key;
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => setActiveFilter(item.key)}
                    className={`flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm ${
                      isActive
                        ? 'bg-[#27aae1] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#27aae1]'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="font-medium">{item.label}</span>
                    {count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white'
                        : item.key === 'overdue' ? 'bg-[#fe7105] text-white'
                        : 'bg-gray-200 text-gray-700'
                      }`}>{count}</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Body */}
      <div className=" mx-auto  py-6">
        {/* Bulk action toolbar */}
        {selectionCount > 0 && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {selectionCount} selected
              </span>
              <span className="text-xs text-gray-500">
                (max {MAX_SELECTION})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleBulkComplete}
                className="flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700"
              >
                <CheckCircle size={14} />
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkView}
                disabled={selectionCount !== 1}
                title={selectionCount !== 1 ? 'Select exactly 1 task to view' : 'View task'}
                className="flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={14} />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                disabled={selectionCount !== 1}
                title={selectionCount !== 1 ? 'Select exactly 1 task to delete' : 'Delete task'}
                className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                title="Clear selection"
                className="h-8 w-8 p-0"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae1]" />
            <span className="ml-3 text-gray-700">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="mx-auto h-10 w-10 text-[#fe7105] mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#27aae1] text-white hover:bg-[#1e8bb8]">
              Retry
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <Circle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-sm text-gray-600">Get started by creating your first task.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 w-10">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Created By</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredTasks.map((task, idx) => {
                    const isDone     = task.status === TaskStatus.COMPLETED;
                    const isSelected = selectedIds.has(task.id);
                    const disabled   = !isSelected && !canSelectMore;
                    return (
                      <tr
                        key={task.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={disabled}
                            onChange={() => toggleSelect(task.id)}
                            title={disabled ? `Max ${MAX_SELECTION} selected` : 'Select task'}
                            className="w-4 h-4 accent-[#27aae1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`text-sm font-medium max-w-xs truncate ${
                            isDone ? 'text-gray-400 line-through'
                            : task.is_overdue ? 'text-[#fe7105]'
                            : 'text-gray-900'
                          }`}>
                            {task.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex text-xs px-2 py-1 rounded-full border ${priorityStyles[task.priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isDone ? (
                            <span className="inline-flex text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Completed</span>
                          ) : task.is_overdue ? (
                            <span className="inline-flex text-xs px-2 py-1 rounded-full bg-[#fe7105] text-white">Overdue</span>
                          ) : (
                            <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{task.status}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(task.due_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[200px] truncate">{assignedNames(task)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{task.created_by?.username || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isDone && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCompleteTask(task.id)}
                                title="Mark complete"
                                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <CheckCircle size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewTask(task)}
                              title="View"
                              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-[#27aae1]"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditTask(task)}
                              title="Edit"
                              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-[#27aae1]"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setTaskToDelete(task)}
                              title="Delete"
                              className="h-8 w-8 text-gray-600 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
      </div>
    </div>
  );
};

export default TasksPage;