import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PriorityLevel, CustomUser } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';
import { RichEditor } from '@/components/shared/editor';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<any>;
  availableUsers: CustomUser[];
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#27aae1] focus:border-transparent text-sm outline-none';

const CreateTaskDialog: React.FC<Props> = ({ isOpen, onClose, onSubmit, availableUsers }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    title: '',
    description: '',
    notes: '',
    priority: PriorityLevel.MEDIUM,
    due_date: '',
    assigned_user_ids: [] as number[],
    send_email_alert: false,
  });

  const setField = (key: keyof typeof data) => (val: any) =>
    setData(p => ({ ...p, [key]: val }));

  const toggleUser = (id: number) =>
    setData(p => ({
      ...p,
      assigned_user_ids: p.assigned_user_ids.includes(id)
        ? p.assigned_user_ids.filter(u => u !== id)
        : [...p.assigned_user_ids, id],
    }));

  const reset = () => {
    setData({
      title: '',
      description: '',
      notes: '',
      priority: PriorityLevel.MEDIUM,
      due_date: '',
      assigned_user_ids: [],
      send_email_alert: false,
    });
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await onSubmit(data);
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit = data.title.trim() && data.due_date && !loading;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg lg:max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create Task</h2>
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
              placeholder="Task title"
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

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.send_email_alert}
              onChange={e => setField('send_email_alert')(e.target.checked)}
              className="w-4 h-4 accent-[#27aae1]"
            />
            Send email alert to assigned users
          </label>

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
                <Plus size={16} />
              )}
              <span>{loading ? 'Creating...' : 'Create'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskDialog;