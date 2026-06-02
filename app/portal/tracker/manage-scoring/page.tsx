'use client';
import {
    AlertCircle,
    Calendar,
    ChevronLeft, ChevronRight,
    Clock,
    Filter,
    Search,
    Trash2, X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { getSubmittedProposals } from '@/app/api/dashboard/submitted-proposals';
import { getScoringWindows } from '@/app/api/new/manage-scoring';
import { Button } from '@/components/ui/button';
import { ScoringLevel, ScoringWindow, ScoringWindowStatus } from '@/types/new/manage-scoring';
import DeleteDialog from './delete';
import ScheduleDialog from './schedule';



interface Intervention {
  id: string;
  intervention_name?: string | null;
  reference_number?: string | null;
}

interface Row extends Intervention {
  window: ScoringWindow | null;
}

const PAGE_SIZES = [20, 30, 50, 100];
const LEVELS = [
  { key: ScoringLevel.PANEL,     label: 'Panel (SWG)' },
  { key: ScoringLevel.APPRAISAL, label: 'Appraisal' },
];
const SCHEDULE_FILTERS = [
  { key: 'all',           label: 'All' },
  { key: 'scheduled',     label: 'Scheduled' },
  { key: 'not_scheduled', label: 'Not scheduled' },
];

const statusStyles: Record<ScoringWindowStatus, string> = {
  open:      'bg-green-50 text-green-700 border-green-200',
  grace:     'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  closed:    'bg-gray-100 text-gray-600 border-gray-200',
  disabled:  'bg-gray-50 text-gray-500 border-gray-200',
};

const fmt = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

const ScoringPage = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [windows, setWindows] = useState<ScoringWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [level, setLevel]           = useState<ScoringLevel>(ScoringLevel.PANEL);
  const [search, setSearch]         = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(20);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editing, setEditing]           = useState<Row | null>(null);
  const [deleteOpen, setDeleteOpen]     = useState(false);

  // Initial load
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [props, wins] = await Promise.all([
        getSubmittedProposals(),
        getScoringWindows(),
      ]);
      const list = Array.isArray(props) ? props : (props as any)?.data || (props as any)?.results || [];
      setInterventions(list);
      setWindows(wins);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
      toast.error(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
  }, [level, search, scheduleFilter, pageSize]);

  // Join interventions + windows for current level
  const rows: Row[] = useMemo(() => {
    const winByIntervention = new Map<string, ScoringWindow>();
    windows
      .filter(w => w.level === level)
      .forEach(w => {
        const ivId = typeof w.intervention === 'string' ? w.intervention : w.intervention.id;
        winByIntervention.set(ivId, w);
      });

    return interventions.map(iv => ({ ...iv, window: winByIntervention.get(iv.id) ?? null }));
  }, [interventions, windows, level]);

  // Apply search + schedule filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (q) {
        const inName = r.intervention_name?.toLowerCase().includes(q);
        const inRef  = r.reference_number?.toLowerCase().includes(q);
        if (!inName && !inRef) return false;
      }
      if (scheduleFilter === 'scheduled' && !r.window) return false;
      if (scheduleFilter === 'not_scheduled' && r.window) return false;
      return true;
    });
  }, [rows, search, scheduleFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // Selection
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selectedIds.has(r.id));
  const togglePage = () =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageRows.forEach(r => next.delete(r.id));
      else pageRows.forEach(r => next.add(r.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  const selectedRows = useMemo(
    () => rows.filter(r => selectedIds.has(r.id)),
    [rows, selectedIds]
  );

  // Counts for the bulk delete button
  const selectedWithWindows = selectedRows.filter(r => r.window);

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick />

      {/* Header */}
      <div className="border-b border-gray-200  py-4">
        <div className=" mx-auto">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">Scoring Management</h1>

          {/* Level tabs */}
          <div className="flex items-center gap-2 mb-4">
            {LEVELS.map(l => (
              <Button
                key={l.key}
                variant={level === l.key ? 'default' : 'ghost'}
                onClick={() => setLevel(l.key)}
                className={`text-sm ${
                  level === l.key ? 'bg-[#27aae1] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {l.label}
              </Button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by reference or intervention name…"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[#27aae1] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={scheduleFilter}
                onChange={e => setScheduleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#27aae1]"
              >
                {SCHEDULE_FILTERS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#27aae1]"
              >
                {PAGE_SIZES.map(s => (
                  <option key={s} value={s}>{s} per page</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className=" mx-auto  py-6">
        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{selectedIds.size} selected</span>
              {selectedWithWindows.length > 0 && (
                <span className="text-gray-500">
                  · {selectedWithWindows.length} with schedule
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => { setEditing(null); setScheduleOpen(true); }}
                className="flex items-center gap-1.5 bg-[#27aae1] text-white hover:bg-[#1e8bb8]"
              >
                <Calendar size={14} />
                Schedule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteOpen(true)}
                disabled={selectedWithWindows.length === 0}
                className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection} className="h-8 w-8 p-0">
                <X size={14} />
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27aae1]" />
            <span className="ml-3 text-gray-700">Loading interventions…</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={reload} className="bg-[#27aae1] text-white hover:bg-[#1e8bb8]">Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600">No interventions found.</p>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={togglePage}
                          className="w-4 h-4 accent-[#27aae1] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Intervention</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Starts</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Ends</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Delay</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pageRows.map((row, idx) => {
                      const isSelected = selectedIds.has(row.id);
                      const w = row.window;
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(row.id)}
                              className="w-4 h-4 accent-[#27aae1] cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">
                            {row.reference_number || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {row.intervention_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {fmt(w?.starts_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {fmt(w?.ends_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {w ? `${w.submission_delay_minutes} min` : '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {w ? (
                              <span className={`inline-flex text-xs px-2 py-1 rounded-full border ${statusStyles[w.status]}`}>
                                {w.status}
                              </span>
                            ) : (
                              <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                                not scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditing(row); setScheduleOpen(true); }}
                              title={w ? 'Edit schedule' : 'Add schedule'}
                              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-[#27aae1]"
                            >
                              <Calendar size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-gray-600">
              <div>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="px-2">Page {page} of {totalPages}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}

        <ScheduleDialog
          isOpen={scheduleOpen}
          onClose={() => { setScheduleOpen(false); setEditing(null); }}
          level={level}
          targets={editing ? [editing] : selectedRows}
          onSaved={async () => {
            await reload();
            setScheduleOpen(false);
            setEditing(null);
            clearSelection();
          }}
        />

        <DeleteDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          targets={selectedWithWindows}
          onDeleted={async () => {
            await reload();
            setDeleteOpen(false);
            clearSelection();
          }}
        />
      </div>
    </div>
  );
};

export default ScoringPage;