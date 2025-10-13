import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface DeleteTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
}

const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({ task, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      await onConfirm(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  if (task.is_overdue) {
    return (
      <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cannot Delete Task</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </Button>
          </div>
      </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </Button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Are you sure you want to delete this task?</h3>
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="font-medium text-gray-900">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The task will be permanently removed from the system.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
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
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 size={16} />
              )}
              <span>{loading ? 'Deleting...' : 'Delete Task'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );}
  export default DeleteTaskDialog;
