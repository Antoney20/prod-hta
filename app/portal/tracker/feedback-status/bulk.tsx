"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, Loader2, UploadCloud, MinusCircle, RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import type { TopicPriority, DecisionType } from "@/types/new/topic-prioritization";
import type { ProgramProposal } from "@/types/new/program";
import { getNationalPrograms } from "@/app/api/new/search";
import { autoMap, buildRows, ColRole, downloadTemplate, FeedbackRow, ImportMode, ParsedSheet, parseSpreadsheet, submitRows } from "./handler";

const ROLES: { value: ColRole; label: string }[] = [
  { value: "ignore", label: "Ignore" },
  { value: "reference", label: "Reference" },
  { value: "decision", label: "Decision" },
  { value: "decision_date", label: "Decision date" },
  { value: "routing_decision", label: "Routing decision" },
  { value: "feedback", label: "Feedback" },
];

const MODE_BADGE: Record<FeedbackRow["mode"], { label: string; cls: string }> = {
  create: { label: "Create", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  update: { label: "Update", cls: "bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/30" },
  skip: { label: "Skip", cls: "bg-slate-100 text-slate-400 border-slate-200" },
};

export function BulkFeedbackDialog({
  open, onClose, onComplete, records, decisions,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  records: TopicPriority[];
  decisions: DecisionType[];
}) {
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, ColRole>>({});
  const [importMode, setImportMode] = useState<ImportMode>("update");
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  
  const [nationalProposals, setNationalProposals] = useState<ProgramProposal[]>([]);
  const [natLoaded, setNatLoaded] = useState(false);
  const [natLoading, setNatLoading] = useState(false);

  useEffect(() => {
    if (!open || natLoaded || natLoading) return;
    setNatLoading(true);
    getNationalPrograms()
      .then((list) => setNationalProposals(list ?? []))
      .catch(() => setNationalProposals([]))
      .finally(() => { setNatLoaded(true); setNatLoading(false); });
  }, [open, natLoaded, natLoading]);

  const reset = () => { setParsed(null); setMapping({}); };
  const close = () => { reset(); onClose(); };

  const rows: FeedbackRow[] = useMemo(
    () => (parsed ? buildRows(parsed, mapping, records, nationalProposals, importMode) : []),
    [parsed, mapping, records, nationalProposals, importMode],
  );

  const ingest = useCallback(async (file: File) => {
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.columns.length) { toast.error("No columns found."); return; }
      setParsed(sheet);
      setMapping(autoMap(sheet));
    } catch {
      toast.error("Could not read the spreadsheet.");
    } finally { setBusy(false); }
  }, []);

  const setRole = (key: string, role: ColRole) => {
    const next = { ...mapping };
    if (role !== "ignore") for (const k of Object.keys(next)) if (next[k] === role) next[k] = "ignore";
    next[key] = role;
    setMapping(next);
  };

  const hasReference = useMemo(() => Object.values(mapping).includes("reference"), [mapping]);
  const actionable = rows.filter((r) => r.mode !== "skip" && r.errors.length === 0);
  const skipped = rows.filter((r) => r.mode === "skip");
  const invalid = rows.filter((r) => r.mode !== "skip" && r.errors.length > 0);
  const updateCount = actionable.filter((r) => r.mode === "update").length;
  const createCount = actionable.filter((r) => r.mode === "create").length;

  const submit = async () => {
    if (!actionable.length) { toast.error("No rows to apply."); return; }
    setSubmitting(true);
    try {
      const res = await submitRows(rows, decisions);
      const succeeded = res.updated + res.created;
      if (succeeded > 0) {
        const parts = [
          res.updated ? `${res.updated} updated` : "",
          res.created ? `${res.created} created` : "",
          res.failed ? `${res.failed} failed` : "",
        ].filter(Boolean).join(", ");
        res.failed > 0 ? toast.warn(parts) : toast.success(parts);
      } else {
        toast.error(res.firstError ?? `All ${res.failed} row(s) failed.`);
      }
      onComplete();
      if (succeeded > 0) close();
    } catch {
      toast.error("Bulk update failed.");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#27aae1]" /> Bulk update feedback / decisions
          </DialogTitle>
        </DialogHeader>

        {!parsed ? (
          <div className="space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) ingest(f); }}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed py-12 text-center transition-colors ${dragging ? "border-[#27aae1] bg-[#27aae1]/5" : "border-slate-200"}`}
            >
              {busy ? <Loader2 className="h-6 w-6 animate-spin text-[#27aae1]" /> : <FileSpreadsheet className="h-6 w-6 text-slate-400" />}
              <p className="text-sm text-slate-600">Drop a .xlsx / .csv with reference, decision, routing & feedback, or</p>
              <label className="cursor-pointer text-sm font-medium text-[#27aae1] hover:underline">
                browse
                <input type="file" accept=".xlsx,.csv" className="hidden"
                  onChange={(e) => e.target.files?.[0] && ingest(e.target.files[0])} />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={downloadTemplate} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                <Download className="h-3.5 w-3.5" /> Download template
              </button>
              {natLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading national proposals…
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* existing-row handling */}
            <div className="flex flex-wrap items-center gap-3 border border-slate-200 bg-slate-50/60 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Existing records</span>
              <div className="inline-flex border border-slate-200 bg-white text-xs">
                {([
                  { v: "update", label: "Update existing" },
                  { v: "skip", label: "Skip existing" },
                ] as { v: ImportMode; label: string }[]).map((o) => (
                  <button key={o.v} onClick={() => setImportMode(o.v)}
                    className={`px-3 py-1.5 ${importMode === o.v ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              {natLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> matching national proposals…
                </span>
              )}
            </div>

            {/* column mapping */}
            <div className="border border-slate-200">
              <p className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Map columns</p>
              <div className="divide-y divide-slate-100">
                {parsed.columns.map((c) => (
                  <div key={c.key} className="flex items-center gap-2 px-3 py-2">
                    <span className="w-48 truncate text-sm text-slate-700" title={c.key}>{c.key}</span>
                    <select value={mapping[c.key] ?? "ignore"} onChange={(e) => setRole(c.key, e.target.value as ColRole)}
                      className="h-8 border border-slate-200 px-2 text-sm">
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {!hasReference && (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> Map a column to Reference.
              </p>
            )}

            {/* preview */}
            <div className="overflow-x-auto border border-slate-200 max-h-72">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="w-8 px-2 py-2" />
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-400">Reference</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-400">Decision</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-400">Routing</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-400">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const badge = MODE_BADGE[r.mode];
                    const bad = r.mode !== "skip" && r.errors.length > 0;
                    return (
                      <tr key={r.index} className={bad ? "bg-red-50/40" : r.mode === "skip" ? "opacity-60" : ""}>
                        <td className="px-2 py-2 text-center">
                          {r.mode === "skip"
                            ? <MinusCircle className="mx-auto h-4 w-4 text-slate-300" />
                            : bad
                              ? <AlertCircle className="mx-auto h-4 w-4 text-red-500" />
                              : <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-600">{r.reference || "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{r.decision || "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 truncate max-w-[160px]">{r.routing_decision || "—"}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {bad && <span className="block text-[11px] text-red-400">{r.errors[0]}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-[#27aae1]"><RefreshCw className="h-3.5 w-3.5" />{updateCount} update</span>
                {createCount > 0 && <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{createCount} create</span>}
                {skipped.length > 0 && <span className="inline-flex items-center gap-1 text-slate-400"><MinusCircle className="h-3.5 w-3.5" />{skipped.length} skip</span>}
                {invalid.length > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertCircle className="h-3.5 w-3.5" />{invalid.length} errors</span>}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={reset}><X className="h-4 w-4 mr-2" /> Start over</Button>
                <Button size="sm" disabled={!actionable.length || !hasReference || submitting || natLoading}
                  style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={submit}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                  Apply {actionable.length}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}