import { deleteScoringWindow } from '@/app/api/new/manage-scoring';
import { Button } from '@/components/ui/button';
import { ScoringWindow } from '@/types/new/manage-scoring';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';


interface Target {
  id: string;
  intervention_name?: string | null;
  reference_number?: string | null;
  window: ScoringWindow | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targets: Target[];
  onDeleted: () => void | Promise<void>;
}

const DeleteDialog: React.FC<Props> = ({ isOpen, onClose, targets, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => { if (isOpen) setConfirmText(''); }, [isOpen]);

  const canDelete = confirmText.trim().toLowerCase() === 'delete' && targets.length > 0;

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    const results = await Promise.allSettled(
      targets
        .filter(t => t.window)
        .map(t => deleteScoringWindow(t.window!.id))
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - ok;

    if (failed === 0) {
      toast.success(`Deleted ${ok} schedule${ok === 1 ? '' : 's'}.`);
    } else if (ok === 0) {
      toast.error(`Failed to delete ${failed} schedule${failed === 1 ? '' : 's'}.`);
    } else {
      toast.warn(`Deleted ${ok}, failed ${failed}.`);
    }

    setLoading(false);
    if (ok > 0) await onDeleted();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Delete Schedule(s)</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p>You are about to delete <strong>{targets.length}</strong> scoring schedule{targets.length === 1 ? '' : 's'}.</p>
              <p className="text-gray-500 mt-2">This action cannot be undone. Submitted scores are not affected.</p>
            </div>
          </div>

          {targets.length <= 5 && targets.length > 0 && (
            <ul className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-2 space-y-0.5">
              {targets.map(t => (
                <li key={t.id} className="truncate">
                  <span className="font-mono text-gray-500">{t.reference_number || '—'}</span>{' '}
                  {t.intervention_name || '—'}
                </li>
              ))}
            </ul>
          )}

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
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>{loading ? 'Deleting…' : 'Delete'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;