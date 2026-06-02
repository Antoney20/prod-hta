import React, { useState, useEffect } from 'react';
import { Edit, X } from 'lucide-react';
import { Task, PriorityLevel, TaskStatus, CustomUser } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';
import { RichEditor } from '@/components/shared/editor';

interface Props {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  availableUsers: CustomUser[];
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#27aae1] focus:border-transparent text-sm outline-none';

const EditTaskDialog: React.FC<Props> = ({ task, isOpen, onClose, onUpdate, availableUsers }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    title: '',
    description: '',
    notes: '',
    priority: PriorityLevel.MEDIUM,
    due_date: '',
    is_completed: false,
    assigned_user_ids: [] as number[],
    send_email_alert: false,
  });

  const setField = (key: keyof typeof data) => (val: any) =>
    setData(p => ({ ...p, [key]: val }));

  useEffect(() => {
    if (task && isOpen) {
      setData({
        title: task.title,
        description: task.description || '',
        notes: task.notes || '',
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        is_completed: task.status === TaskStatus.COMPLETED,
        assigned_user_ids: (task.assignments?.map(a => a.user?.id).filter(Boolean) as number[]) || [],
        send_email_alert: (task as any).send_email_alert ?? false,
      });
      setError(null);
    }
  }, [task, isOpen]);

  const toggleUser = (id: number) =>
    setData(p => ({
      ...p,
      assigned_user_ids: p.assigned_user_ids.includes(id)
        ? p.assigned_user_ids.filter(u => u !== id)
        : [...p.assigned_user_ids, id],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!task) return;
    if (!data.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!data.due_date) {
      setError('Due date is required.');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(task.id, {
        title: data.title,
        description: data.description,
        notes: data.notes,
        priority: data.priority,
        due_date: data.due_date,
        status: data.is_completed ? TaskStatus.COMPLETED : TaskStatus.NEW,
        completed_at: data.is_completed ? (task.completed_at || new Date().toISOString()) : null,
        assigned_users: data.assigned_user_ids,
        send_email_alert: data.send_email_alert,
      } as any);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const canSubmit = data.title.trim() && data.due_date && !loading;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Task</h2>
            {task.is_overdue && !data.is_completed && (
              <p className="text-xs text-[#fe7105] mt-0.5">This task is overdue</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Title *</label>
            <input
              type="text"
              value={data.title}
              onChange={e => setField('title')(e.target.value)}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
            <RichEditor
              value={data.description}
              onChange={setField('description')}
              placeholder="Describe the task…"
              minHeight={100}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
            <RichEditor
              value={data.notes}
              onChange={setField('notes')}
              placeholder="Additional notes…"
              minHeight={80}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                value={data.priority}
                onChange={e => setField('priority')(e.target.value as PriorityLevel)}
                className={inputCls}
              >
                {Object.values(PriorityLevel).map(l => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Due Date *</label>
              <input
                type="date"
                value={data.due_date}
                onChange={e => setField('due_date')(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Assign Users</label>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-gray-500 py-3">No users available</p>
            ) : (
              <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {availableUsers.map(u => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={data.assigned_user_ids.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="w-4 h-4 accent-[#27aae1]"
                    />
                    <span className="text-gray-900">{u.username}</span>
                    <span className="text-gray-400 text-xs ml-auto truncate">{u.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_completed}
                onChange={e => setField('is_completed')(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              Mark as completed
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={data.send_email_alert}
                onChange={e => setField('send_email_alert')(e.target.checked)}
                className="w-4 h-4 accent-[#27aae1]"
              />
              Send email alert to assigned users
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Edit size={16} />
              )}
              <span>{loading ? 'Updating...' : 'Update'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskDialog;