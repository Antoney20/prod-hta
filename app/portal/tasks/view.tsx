import React from 'react';
import { X, Calendar, User, Users, Clock, CheckCircle2 } from 'lucide-react';
import { Task, PriorityLevel, TaskStatus } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface Props {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const priorityStyles: Record<string, string> = {
  urgent: 'text-red-700 bg-red-50 border-red-200',
  high:   'text-orange-700 bg-orange-50 border-orange-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  low:    'text-green-700 bg-green-50 border-green-200',
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const Avatar: React.FC<{ user?: { username?: string; profile_image?: string | null } }> = ({ user }) => {
  if (!user?.username) return null;
  return user.profile_image ? (
    <img src={user.profile_image} alt={user.username} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-6 h-6 bg-[#27aae1] text-white rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0">
      {user.username.substring(0, 2).toUpperCase()}
    </div>
  );
};

const ViewTaskDialog: React.FC<Props> = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  const isDone = task.status === TaskStatus.COMPLETED;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Task Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title + status pills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${priorityStyles[task.priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {task.priority}
              </span>
              {isDone ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Completed
                </span>
              ) : task.is_overdue ? (
                <span className="text-xs px-2 py-1 rounded-full bg-[#fe7105] text-white">
                  Overdue
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {task.status}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              <div
                className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-strong:text-gray-900 prose-a:text-[#27aae1]"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
              <div
                className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-strong:text-gray-900 prose-a:text-[#27aae1] bg-gray-50 border border-gray-100 rounded-md p-3"
                dangerouslySetInnerHTML={{ __html: task.notes }}
              />
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Due Date</div>
                <div className="text-sm text-gray-900">{formatDate(task.due_date)}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Created By</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Avatar user={task.created_by} />
                  <span className="text-sm text-gray-900 truncate">{task.created_by?.username || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-gray-400" />
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</h4>
            </div>
            {task.assignments && task.assignments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {task.assignments.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
                    <Avatar user={a.user} />
                    <span className="text-xs text-gray-700">{a.user?.username}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-500">Unassigned</span>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={12} />
              <span>Created {formatDateTime(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={12} />
              <span>Updated {formatDateTime(task.updated_at)}</span>
            </div>
            {task.completed_at && (
              <div className="flex items-center gap-1.5 text-green-600 sm:col-span-2">
                <CheckCircle2 size={12} />
                <span>Completed {formatDateTime(task.completed_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-5 py-3 border-t border-gray-100">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskDialog;