import { createScoringWindow, updateScoringWindow } from '@/app/api/new/manage-scoring';
import { Button } from '@/components/ui/button';
import { ScoringLevel, ScoringWindow } from '@/types/new/manage-scoring';
import { Calendar, X } from 'lucide-react';
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
  level: ScoringLevel;
  targets: Target[];
  onSaved: () => void | Promise<void>;
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#27aae1] focus:border-transparent text-sm outline-none';

const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ScheduleDialog: React.FC<Props> = ({ isOpen, onClose, level, targets, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    starts_at: '',
    ends_at: '',
    submission_delay_minutes: 0,
    is_active: true,
    notes: '',
  });

  const isSingle = targets.length === 1;
  const single = isSingle ? targets[0] : null;
  const existing = single?.window ?? null;

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setForm({
        starts_at: toLocalInput(existing.starts_at),
        ends_at: toLocalInput(existing.ends_at),
        submission_delay_minutes: existing.submission_delay_minutes,
        is_active: existing.is_active,
        notes: existing.notes ?? '',
      });
    } else {
      setForm({ starts_at: '', ends_at: '', submission_delay_minutes: 0, is_active: true, notes: '' });
    }
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.starts_at || !form.ends_at) {
      toast.error('Both start and end times are required.');
      return;
    }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) {
      toast.error('End time must be after start time.');
      return;
    }
    if (targets.length === 0) {
      toast.error('No interventions selected.');
      return;
    }

    setLoading(true);
    const payload = {
      level,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      submission_delay_minutes: Number(form.submission_delay_minutes) || 0,
      is_active: form.is_active,
      notes: form.notes,
    };

    const results = await Promise.allSettled(
      targets.map(t =>
        t.window
          ? updateScoringWindow(t.window.id, payload)
          : createScoringWindow({ ...payload, intervention: t.id })
      )
    );

    const ok = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - ok;

    if (failed === 0) {
      toast.success(`Scheduled ${ok} intervention${ok === 1 ? '' : 's'}.`);
    } else if (ok === 0) {
      toast.error(`Failed to schedule ${failed} intervention${failed === 1 ? '' : 's'}.`);
    } else {
      toast.warn(`Scheduled ${ok}, failed ${failed}.`);
    }

    setLoading(false);
    if (ok > 0) await onSaved();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {existing ? 'Edit Schedule' : 'Schedule Scoring'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Level: {level === ScoringLevel.PANEL ? 'Panel (SWG)' : 'Appraisal'} ·{' '}
              {targets.length} intervention{targets.length === 1 ? '' : 's'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {!isSingle && targets.length > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Applying to</p>
              <ul className="text-xs text-gray-700 space-y-0.5">
                {targets.slice(0, 10).map(t => (
                  <li key={t.id} className="truncate">
                    <span className="font-mono text-gray-500">{t.reference_number || '—'}</span>{' '}
                    {t.intervention_name || '—'}
                  </li>
                ))}
                {targets.length > 10 && (
                  <li className="text-gray-500 italic">+{targets.length - 10} more…</li>
                )}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Starts At *</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Ends At *</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Submission Delay (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={form.submission_delay_minutes}
              onChange={e => setForm(p => ({ ...p, submission_delay_minutes: Number(e.target.value) }))}
              className={inputCls}
            />
            <p className="text-xs text-gray-500 mt-1">
              Grace period after end time during which late submissions are accepted.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Optional"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-[#27aae1]"
            />
            Active
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.starts_at || !form.ends_at}
              className="flex items-center gap-2 bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Calendar size={16} />
              )}
              <span>{loading ? 'Saving…' : 'Save Schedule'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleDialog;