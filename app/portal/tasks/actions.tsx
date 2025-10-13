import React, { useState } from 'react';
import { MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import { Task } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ task, onEdit, onView, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const canDelete = !task.is_overdue;
  const canEdit = true;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex-shrink-0 h-8 w-8 hover:bg-gray-100"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </Button>
      
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32">
            <button
              onClick={() => {
                onView(task);
                setShowDropdown(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Eye size={14} />
              <span>View</span>
            </button>
            
            {canEdit && (
              <button
                onClick={() => {
                  onEdit(task);
                  setShowDropdown(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => {
                  onDelete(task);
                  setShowDropdown(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
            
            {!canDelete && (
              <div className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
                <div className="flex items-center space-x-2 opacity-50">
                  <Trash2 size={14} />
                  <span>Delete</span>
                </div>
                <p className="text-xs mt-1">Cannot delete overdue tasks</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskActions;