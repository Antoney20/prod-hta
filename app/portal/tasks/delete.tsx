import React, { useState, useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/dashboard/tasks';
import { Button } from '@/components/ui/button';

interface Props {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
}

const DeleteTaskDialog: React.FC<Props> = ({ task, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  const canDelete = confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!task || !canDelete) return;
    try {
      setLoading(true);
      await onConfirm(task.id);
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Delete Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p>You are about to permanently delete:</p>
              <p className="font-medium text-gray-900 mt-1">{task.title}</p>
              <p className="text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Type <span className="font-mono text-red-600">delete</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="delete"
              autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Trash2 size={16} />}
              <span>{loading ? 'Deleting...' : 'Delete'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskDialog;