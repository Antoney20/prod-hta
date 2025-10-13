import React, { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { PriorityLevel, CustomUser } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<any>;
  availableUsers: CustomUser[];
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableUsers
}) => {
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    notes: '',
    priority: PriorityLevel.MEDIUM,
    due_date: '',
    assigned_user_ids: [] as number[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    try {
      setLoading(true);
      await onSubmit(taskData);
      
      // Reset form
      setTaskData({
        title: '',
        description: '',
        notes: '',
        priority: PriorityLevel.MEDIUM,
        due_date: '',
        assigned_user_ids: [],
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = (userId: number) => {
    setTaskData(prev => ({
      ...prev,
      assigned_user_ids: prev.assigned_user_ids.includes(userId)
        ? prev.assigned_user_ids.filter(id => id !== userId)
        : [...prev.assigned_user_ids, userId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Task</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={e => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27aae1] focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={e => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27aae1] focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={taskData.notes}
              onChange={e => setTaskData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27aae1] focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskData.priority}
                onChange={e => setTaskData(prev => ({ ...prev, priority: e.target.value as PriorityLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27aae1] focus:border-transparent transition-all duration-200"
              >
                {Object.values(PriorityLevel).map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={taskData.due_date}
                onChange={e => setTaskData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27aae1] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users size={16} className="inline mr-2" />
              Assign to Users
            </label>
            {availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No users available for assignment</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableUsers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={taskData.assigned_user_ids.includes(user.id)}
                      onChange={() => handleAssignUser(user.id)}
                      className="w-4 h-4 text-[#27aae1] border-gray-300 rounded focus:ring-[#27aae1] focus:ring-2"
                    />
                    <div className="flex items-center space-x-3 min-w-0">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#27aae1] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {taskData.assigned_user_ids.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {taskData.assigned_user_ids.length} user(s) selected
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!taskData.title.trim() || loading}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>{loading ? 'Creating...' : 'Create Task'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskDialog;