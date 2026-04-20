"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";


import {
  getAllFeedbackCategories,
  getAllFeedbackEmailLogs,
  getInterventionFeedbackStatuses,
  resendFeedbackEmail,
} from "@/app/api/feedback";

import type {
  FeedbackCategory,
  FeedbackEmailLog,
  InterventionFeedbackStatus,
  FeedbackLogFilters,
} from "@/types/new/feedback";
import { ActiveTab, Tabs } from "./tt/tabs";
import { InterventionTable } from "./tt/table";
import { Pagination } from "./tt/pagenation";
import { LogFilters } from "./tt/filters";
import { LogsTable } from "./tt/logstt";
import { SendDialog } from "./tt/senddiaogue";
import { BulkSendDialog } from "./tt/bulksenddialogue";
import { DeleteDialog } from "./tt/delete";

function exportToCsv(rows: InterventionFeedbackStatus[]) {
  const headers = [
    "Reference", "Name", "Email", "Submitted", "System Categories",
    "Decision", "Decision Date", "Emails Sent", "Is Scored",
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map(iv => [
      escape(iv.reference_number),
      escape(iv.intervention_name),
      escape(iv.email),
      escape(iv.submitted_at ? new Date(iv.submitted_at).toLocaleDateString() : ""),
      escape(iv.system_categories.join("; ")),
      escape(iv.decision ?? ""),
      escape(iv.decision_date ?? ""),
      escape(iv.feedback_sent_count),
      escape(iv.is_scored ? "Yes" : "No"),
    ].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `interventions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
 

export default function SendEmailPage() {

  const [categories,    setCategories]    = useState<FeedbackCategory[]>([]);
  const [interventions, setInterventions] = useState<InterventionFeedbackStatus[]>([]);
  const [logs,          setLogs]          = useState<FeedbackEmailLog[]>([]);
  const [loading,       setLoading]       = useState(true);
 
  const [activeTab, setActiveTab] = useState<ActiveTab>("send");
 
  const [logFilters, setLogFilters] = useState<FeedbackLogFilters>({});
 
  const [search,          setSearch]          = useState("");
  const [ivDateFrom,      setIvDateFrom]      = useState("");
  const [ivDateTo,        setIvDateTo]        = useState("");
  const [categoryFilter,  setCategoryFilter]  = useState("");
  const [decisionFilter,  setDecisionFilter]  = useState("");

  const [logPage,     setLogPage]     = useState(1);
  const [logPageSize, setLogPageSize] = useState(20);
  const [ivPage,      setIvPage]      = useState(1);
  const [ivPageSize,  setIvPageSize]  = useState(20);
 

  const [selected, setSelected] = useState<Set<string>>(new Set());
 
  const [sendTarget,   setSendTarget]   = useState<InterventionFeedbackStatus | null>(null);
  const [bulkOpen,     setBulkOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackEmailLog | null>(null);
 
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, ivRes, logRes] = await Promise.all([
        getAllFeedbackCategories(),
        getInterventionFeedbackStatuses(),
        getAllFeedbackEmailLogs(logFilters),
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (ivRes.success)  setInterventions(ivRes.data);
      if (logRes.success) setLogs(logRes.data);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [logFilters]);
 
  useEffect(() => { loadAll(); }, [loadAll]);

  const handleResend = useCallback(async (log: FeedbackEmailLog) => {
    try {
      const res = await resendFeedbackEmail(log.id);
      if (res.success) { toast.success("Email resent"); loadAll(); }
      else toast.error(res.message || "Resend failed");
    } catch { toast.error("Resend failed"); }
  }, [loadAll]);
 
  const toggleOne = useCallback((id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const toggleAll = useCallback((ids: string[]) => setSelected(new Set(ids)), []);
 

  const allSystemCategories = useMemo(() =>
    [...new Set(interventions.flatMap(iv => iv.system_categories))].sort(),
  [interventions]);
 
  const allDecisions = useMemo(() =>
    [...new Set(interventions.map(iv => iv.decision).filter(Boolean) as string[])].sort(),
  [interventions]);
 
  const filteredInterventions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return interventions.filter(iv => {
      if (q && !iv.intervention_name.toLowerCase().includes(q) &&
               !iv.reference_number.toLowerCase().includes(q)) return false;
      if (ivDateFrom && iv.submitted_at && iv.submitted_at < ivDateFrom) return false;
      if (ivDateTo   && iv.submitted_at && iv.submitted_at > ivDateTo + "T23:59:59") return false;
      if (categoryFilter && !iv.system_categories.includes(categoryFilter)) return false;
      if (decisionFilter === "__none__" && iv.decision) return false;
      if (decisionFilter && decisionFilter !== "__none__" && iv.decision !== decisionFilter) return false;
      return true;
    });
  }, [interventions, search, ivDateFrom, ivDateTo, categoryFilter, decisionFilter]);
 
  const resetIvFilters = useCallback(() => {
    setSearch(""); setIvDateFrom(""); setIvDateTo("");
    setCategoryFilter(""); setDecisionFilter(""); setIvPage(1);
  }, []);
 
  const pagedIv   = useMemo(() =>
    filteredInterventions.slice((ivPage - 1) * ivPageSize, ivPage * ivPageSize),
  [filteredInterventions, ivPage, ivPageSize]);
 
  const pagedLogs = useMemo(() =>
    logs.slice((logPage - 1) * logPageSize, logPage * logPageSize),
  [logs, logPage, logPageSize]);
 
  const selectedInterventions = useMemo(() =>
    interventions.filter(iv => selected.has(iv.intervention_id)),
  [interventions, selected]);
 
  return (
    <div className="min-h-screen py-8 font-sans">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Feedback Emails</h1>
        <p className="text-sm text-gray-500">Send feedback emails to proposal submitters and view send history.</p>
      </div>
 
      <Tabs active={activeTab} onChange={setActiveTab} />
 
      {loading ? (
        <div className="flex justify-center py-16">
          <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #27aae1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* ── SEND TAB ── */}
          {activeTab === "send" && (
            <div>
              {selected.size > 0 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => setBulkOpen(true)}
                    className="px-4 py-2 text-sm font-semibold bg-[#27aae1] text-white rounded-lg hover:bg-[#1d8fbc] transition-colors"
                  >
                    Bulk Send ({selected.size})
                  </button>
                </div>
              )}
 
              <InterventionTable
                interventions={pagedIv}
                selected={selected}
                search={search}
                dateFrom={ivDateFrom}
                dateTo={ivDateTo}
                categoryFilter={categoryFilter}
                decisionFilter={decisionFilter}
                allCategories={allSystemCategories}
                allDecisions={allDecisions}
                onSearch={v => { setSearch(v); setIvPage(1); }}
                onDateFrom={v => { setIvDateFrom(v); setIvPage(1); }}
                onDateTo={v => { setIvDateTo(v); setIvPage(1); }}
                onCategoryFilter={v => { setCategoryFilter(v); setIvPage(1); }}
                onDecisionFilter={v => { setDecisionFilter(v); setIvPage(1); }}
                onResetFilters={resetIvFilters}
                onToggle={toggleOne}
                onToggleAll={toggleAll}
                onSendOne={iv => setSendTarget(iv)}
                onExportCsv={() => exportToCsv(filteredInterventions)}
              />
 
              <Pagination
                total={filteredInterventions.length}
                page={ivPage}
                pageSize={ivPageSize}
                onPage={setIvPage}
                onPageSize={s => { setIvPageSize(s); setIvPage(1); }}
              />
            </div>
          )}
 
          {/* ── LOGS TAB ── */}
          {activeTab === "logs" && (
            <div>
              <LogFilters
                filters={logFilters}
                categories={categories}
                onChange={f => { setLogFilters(f); setLogPage(1); }}
                onReset={() => { setLogFilters({}); setLogPage(1); }}
              />
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <LogsTable
                  logs={pagedLogs}
                  onResend={handleResend}
                  onDelete={log => setDeleteTarget(log)}
                />
              </div>
              <Pagination
                total={logs.length}
                page={logPage}
                pageSize={logPageSize}
                onPage={setLogPage}
                onPageSize={s => { setLogPageSize(s); setLogPage(1); }}
              />
            </div>
          )}
        </>
      )}
 
      <SendDialog
        open={!!sendTarget}
        intervention={sendTarget}
        categories={categories}
        onClose={() => setSendTarget(null)}
        onSent={loadAll}
      />
 
      <BulkSendDialog
        open={bulkOpen}
        selected={selectedInterventions}
        categories={categories}
        onClose={() => setBulkOpen(false)}
        onSent={() => { loadAll(); setSelected(new Set()); }}
      />
 
      <DeleteDialog
        open={!!deleteTarget}
        log={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={loadAll}
      />
    </div>
  );
}