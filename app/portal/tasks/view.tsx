import React from 'react';
import { X } from 'lucide-react';
import { Task, PriorityLevel, TaskStatus } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface ViewTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewTaskDialog: React.FC<ViewTaskDialogProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  const getAssignedUsersText = (task: Task): string => {
    if (!task.assignments || task.assignments.length === 0) return 'Unassigned';
    
    const usernames = task.assignments
      .map(assignment => assignment.user?.username)
      .filter(Boolean);
    
    return usernames.join(', ');
  };

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
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Task Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </Button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {task.is_overdue && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#fe7105] text-white">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                task.status === TaskStatus.COMPLETED 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {task.status === TaskStatus.COMPLETED ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
              <p className="text-gray-600">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No due date'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h4>
            <div className="flex flex-wrap gap-2">
              {task.assignments && task.assignments.length > 0 ? (
                task.assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                    {assignment.user?.profile_image ? (
                      <img
                        src={assignment.user.profile_image}
                        alt={assignment.user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-[#27aae1] text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {assignment.user?.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{assignment.user?.username}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Unassigned</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Created By</h4>
            <div className="flex items-center space-x-3">
              {task.created_by?.profile_image ? (
                <img
                  src={task.created_by.profile_image}
                  alt={task.created_by.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-[#27aae1] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {task.created_by?.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-gray-600">{task.created_by?.username || 'Unknown'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(task.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {new Date(task.updated_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {task.completed_at && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Completed:</span>{' '}
              {new Date(task.completed_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskDialog;