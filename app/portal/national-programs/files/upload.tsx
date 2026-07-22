"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, FileSpreadsheet, Download, ArrowLeft, ArrowRight, AlertTriangle,
  CheckCircle2, Loader2, X, Plus, Trash2, ChevronRight, RefreshCw, MinusCircle,
  Sparkles, PlusCircle, Check,
} from "lucide-react";
import { toast } from "react-toastify";

import { NationalProgram, ProgramProposal } from "@/types/new/program";
import { createProposal, updateProposal, updateProgram } from "@/app/api/new/programs";
import {
  buildTargets, autoMap, unmappedRequired, buildRows, indexProposalsByRef,
  downloadTemplate, fieldsFromColumns, ParsedSheet, MapTarget, RowResult, ImportMode,
  parseSpreadsheet,
} from "./handler";

type Step = "setup" | "upload" | "match" | "review";

interface Props {
  open: boolean;
  onClose: () => void;
  program: NationalProgram | null;
  proposals: ProgramProposal[];
  onComplete: () => void;
  onProgramChanged: (p: NationalProgram) => void;
}

const STEPS: { key: Step; label: string }[] = [
  { key: "setup", label: "Set up fields" },
  { key: "upload", label: "Upload file" },
  { key: "match", label: "Match & labels" },
  { key: "review", label: "Review & import" },
];

const MODE_BADGE: Record<RowResult["mode"], { label: string; cls: string }> = {
  create: { label: "New", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  update: { label: "Update", cls: "bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/30" },
  skip: { label: "Skip", cls: "bg-slate-100 text-slate-400 border-slate-200" },
};

export function BulkUpload({ open, onClose, program, proposals, onComplete, onProgramChanged }: Props) {
  const [step, setStep] = useState<Step>("setup");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newCols, setNewCols] = useState<string[]>([]);
  const [pickedNew, setPickedNew] = useState<Set<string>>(new Set());
  const [savingLabels, setSavingLabels] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("update");
  const [progress, setProgress] = useState({ done: 0, total: 0, ok: 0, fail: 0 });
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const targets: MapTarget[] = useMemo(
    () => (program ? buildTargets(program.field_schema ?? []) : []),
    [program],
  );

  const refIndex = useMemo(() => indexProposalsByRef(proposals), [proposals]);

  const usedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const p of proposals) {
      for (const [k, v] of Object.entries(p.data ?? {})) {
        if (v != null && v !== "") s.add(k);
      }
    }
    return s;
  }, [proposals]);

  const rows: RowResult[] = useMemo(
    () => (parsed ? buildRows(parsed, mapping, targets, refIndex, importMode) : []),
    [parsed, mapping, targets, refIndex, importMode],
  );

  const importable = rows.filter((r) => r.mode !== "skip");
  const valid = importable.filter((r) => r.errors.length === 0);
  const invalid = importable.filter((r) => r.errors.length > 0);
  const skipped = rows.filter((r) => r.mode === "skip");
  const newCount = valid.filter((r) => r.mode === "create").length;
  const updateCount = valid.filter((r) => r.mode === "update").length;

  const missingRequired = unmappedRequired(targets, mapping);
  const headerOptions = parsed?.headers ?? [];

  const reset = () => {
    setStep("setup"); setFileName(""); setParsed(null); setMapping({});
    setNewCols([]); setPickedNew(new Set());
    setProgress({ done: 0, total: 0, ok: 0, fail: 0 }); setBusy(false); setImporting(false);
  };
  const close = () => { reset(); onClose(); };

  useEffect(() => { if (!open) reset(); }, [open]);

  const handleFile = async (file?: File | null) => {
    if (!file || !program) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.headers.length) { toast.error("Could not read any columns from that file."); return; }
      const auto = autoMap(sheet.headers, targets);
      setFileName(file.name);
      setParsed(sheet);
      setMapping(auto.mapping);
      setNewCols(auto.newColumns);
      setPickedNew(new Set(auto.newColumns));
      setStep("match");
    } catch {
      toast.error("Failed to parse the file. Use .xlsx or .csv.");
    } finally {
      setBusy(false);
    }
  };

  const addLabels = async () => {
    if (!program) return;
    const additions = fieldsFromColumns([...pickedNew], program.field_schema ?? []);
    if (!additions.length) { toast.info("Nothing new to add."); return; }
    setSavingLabels(true);
    const nextSchema = [...(program.field_schema ?? []), ...additions];
    const res: any = await updateProgram(program.id, {
      name: program.name,
      code: program.code,
      description: program.description ?? "",
      is_active: program.is_active,
      field_schema: nextSchema,
    });
    setSavingLabels(false);
    if (res?.error) { toast.error(res.error); return; }
    const updated: NationalProgram = res?.data ?? { ...program, field_schema: nextSchema };
    onProgramChanged(updated);
    setMapping((m) => {
      const n = { ...m };
      for (const f of additions) {
        const col = [...pickedNew].find((c) => c === f.label);
        if (col) n[f.key] = col;
      }
      return n;
    });
    setNewCols((c) => c.filter((col) => !pickedNew.has(col)));
    setPickedNew(new Set());
    toast.success(`${additions.length} label${additions.length !== 1 ? "s" : ""} added to program.`);
  };

  const removeLabel = async (key: string) => {
    if (!program) return;
    if (usedKeys.has(key)) { toast.error("This label has proposal data — clear it first."); return; }
    setRemoving(key);
    const next = (program.field_schema ?? []).filter((f) => f.key !== key);
    const res: any = await updateProgram(program.id, {
      name: program.name,
      code: program.code,
      description: program.description ?? "",
      is_active: program.is_active,
      field_schema: next,
    });
    setRemoving(null);
    if (res?.error) { toast.error(res.error); return; }
    const updated: NationalProgram = res?.data ?? { ...program, field_schema: next };
    onProgramChanged(updated);
    setMapping((m) => { const n = { ...m }; delete n[key]; return n; });
    toast.success("Label removed.");
  };

  const updateCell = (rowIdx: number, header: string, value: string) =>
    setParsed((p) => {
      if (!p) return p;
      const next = p.rows.slice();
      next[rowIdx] = { ...next[rowIdx], [header]: value };
      return { ...p, rows: next };
    });

  const removeRow = (rowIdx: number) =>
    setParsed((p) => (p ? { ...p, rows: p.rows.filter((_, i) => i !== rowIdx) } : p));

  const addRow = () =>
    setParsed((p) =>
      p ? { ...p, rows: [...p.rows, Object.fromEntries(p.headers.map((h) => [h, ""]))] } : p,
    );

  const runImport = async () => {
    if (!program) return;
    setImporting(true);
    setProgress({ done: 0, total: valid.length, ok: 0, fail: 0 });
    let ok = 0, fail = 0;
    for (const r of valid) {
      const payload = {
        program: program.id,
        title: r.title,
        justification: r.justification,
        data: r.data,
        submitted_date: r.submitted_date,
      };
      const res = r.mode === "update" && r.match
        ? await updateProposal(r.match.id, payload)
        : await createProposal(payload);
      if ("error" in res && res.error) fail++; else ok++;
      setProgress({ done: ok + fail, total: valid.length, ok, fail });
    }
    if (ok) toast.success(`${ok} proposal${ok !== 1 ? "s" : ""} imported.`);
    if (fail) toast.error(`${fail} row${fail !== 1 ? "s" : ""} failed to import.`);
    onComplete();
    close();
  };

  const activeIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[96vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#27aae1]" />
            Bulk Import — {program?.name ?? "Program"}
          </DialogTitle>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
          {STEPS.map((s, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => done && setStep(s.key)}
                  disabled={!done}
                  className={`flex items-center gap-1.5 ${active ? "font-semibold text-[#27aae1]" : done ? "text-slate-500 hover:underline" : "text-slate-300"}`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i <= activeIdx ? "text-white" : "bg-slate-100 text-slate-400"}`}
                    style={i <= activeIdx ? { backgroundColor: "#27aae1" } : undefined}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
              </div>
            );
          })}
        </div>

        {/* STEP 1 — setup */}
        {step === "setup" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#27aae1]/10 p-2"><FileSpreadsheet className="h-5 w-5 text-[#27aae1]" /></div>
              <div>
                <h3 className="font-semibold text-slate-800">Start with the right columns</h3>
                <p className="text-sm text-slate-500">
                  A <strong>Reference No.</strong> column matches existing proposals for updates, plus this program's data labels.
                  Missing a column? Upload anyway — new ones are detected automatically and can be added in one click.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Current data labels</p>
              {(program?.field_schema ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">None yet — upload a file and we'll detect labels from your columns.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(program?.field_schema ?? []).map((f) => {
                    const inUse = usedKeys.has(f.key);
                    return (
                      <span key={f.key}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#27aae1]/10 px-2.5 py-1 text-xs font-medium text-[#27aae1]">
                        {f.label}
                        {inUse ? (
                          <span className="rounded bg-white/60 px-1 text-[10px] text-slate-500" title="In use by proposals — can't remove">
                            in use
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeLabel(f.key)}
                            disabled={removing === f.key}
                            className="text-[#1d70b8] hover:text-red-500 disabled:opacity-50"
                            title="Remove label"
                          >
                            {removing === f.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => program && downloadTemplate(program)}>
                <Download className="mr-2 h-4 w-4" /> Download template
              </Button>
              <Button style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={() => setStep("upload")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 — upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-14 text-center transition-colors hover:border-[#27aae1] hover:bg-[#27aae1]/5"
            >
              {busy ? <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
              <p className="text-sm font-medium text-slate-700">Drop an Excel/CSV file here, or click to browse</p>
              <p className="text-xs text-slate-400">.xlsx, .xls or .csv — first row must be column headers</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            <Button variant="outline" onClick={() => setStep("setup")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        )}

        {/* STEP 3 — match + new labels */}
        {step === "match" && parsed && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-600 font-medium">{fileName}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{newCount} new</span>
                <span className="inline-flex items-center gap-1 text-[#27aae1]"><RefreshCw className="h-3.5 w-3.5" />{updateCount} update</span>
                {skipped.length > 0 && <span className="inline-flex items-center gap-1 text-slate-400"><MinusCircle className="h-3.5 w-3.5" />{skipped.length} skip</span>}
                {invalid.length > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{invalid.length} errors</span>}
              </div>
            </div>

            {/* reference column */}
            <div className="border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Reference column (used to match existing proposals)</p>
              <select
                value={mapping["reference_number"] ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, reference_number: e.target.value }))}
                className={`w-full border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${mapping["reference_number"] ? "border-slate-300" : "border-amber-300"}`}
              >
                <option value="">— not mapped —</option>
                {headerOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              {!mapping["reference_number"] && <p className="mt-1 text-xs text-amber-600">Without a reference column every row is treated as new.</p>}
            </div>

            {/* existing-row handling */}
            <div className="flex flex-wrap items-center gap-3 border border-slate-200 bg-slate-50/60 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Existing references</span>
              <div className="inline-flex border border-slate-200 bg-white text-xs">
                {([
                  { v: "update", label: "Update existing" },
                  { v: "skip", label: "Skip existing" },
                ] as { v: ImportMode; label: string }[]).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setImportMode(o.v)}
                    className={`px-3 py-1.5 ${importMode === o.v ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* field mapping */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Match fields to columns</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {targets.filter((t) => t.key !== "reference_number").map((t) => {
                  const missing = t.required && !mapping[t.key];
                  return (
                    <div key={t.key} className="flex items-center gap-2">
                      <div className="w-40 shrink-0 truncate text-sm">
                        <span className={missing ? "text-red-600" : "text-slate-700"}>{t.label}</span>
                        {t.required && <span className="text-red-500"> *</span>}
                      </div>
                      <select
                        value={mapping[t.key] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                        className={`flex-1 border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1] ${missing ? "border-red-300" : "border-slate-300"}`}
                      >
                        <option value="">— not mapped —</option>
                        {headerOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
              {missingRequired.length > 0 && (
                <div className="mt-2 flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Required not mapped: {missingRequired.map((t) => t.label).join(", ")}.</span>
                </div>
              )}
            </div>

            {/* new columns detected */}
            {newCols.length > 0 && (
              <div className="border border-[#27aae1]/30 bg-[#27aae1]/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#27aae1]" />
                  <p className="text-sm font-semibold text-slate-700">New columns found in your file</p>
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  Not part of this program yet. Pick the ones to add as data labels — plain text, saved to the program and included in every future template.
                </p>
                <div className="flex flex-wrap gap-2">
                  {newCols.map((col) => {
                    const on = pickedNew.has(col);
                    return (
                      <button key={col}
                        onClick={() => setPickedNew((s) => { const n = new Set(s); n.has(col) ? n.delete(col) : n.add(col); return n; })}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                          on ? "border-[#27aae1] bg-[#27aae1] text-white" : "border-slate-300 bg-white text-slate-600 hover:border-[#27aae1]"
                        }`}>
                        {on ? <Check className="h-3 w-3" /> : <PlusCircle className="h-3 w-3" />} {col}
                      </button>
                    );
                  })}
                </div>
                <Button size="sm" className="mt-3 text-white" style={{ backgroundColor: "#27aae1" }}
                  disabled={savingLabels || pickedNew.size === 0} onClick={addLabels}>
                  {savingLabels ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="mr-1.5 h-3.5 w-3.5" />}
                  Add {pickedNew.size} to program
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                style={{ backgroundColor: "#27aae1" }} className="text-white"
                disabled={missingRequired.length > 0}
                onClick={() => setStep("review")}
              >
                Review <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — review + import */}
        {step === "review" && !importing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="New" value={newCount} tone="emerald" />
              <Stat label="Update" value={updateCount} tone="blue" />
              <Stat label="Skip" value={skipped.length} tone="slate" />
              <Stat label="Errors" value={invalid.length} tone="red" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rows</p>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add row
                </Button>
              </div>

              {rows.length === 0 ? (
                <div className="border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
                  No rows. Go back and map your columns, or add a row manually.
                </div>
              ) : (
                <div className="max-h-96 overflow-auto border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-10">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-8" />
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-400 w-20">State</th>
                        {targets.filter((t) => t.key !== "reference_number").map((t) => (
                          <th key={t.key} className="px-2 py-1.5 text-left font-semibold text-slate-400 whitespace-nowrap">
                            {t.label}{t.required && <span className="text-red-400"> *</span>}
                          </th>
                        ))}
                        <th className="px-2 py-1.5 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r, i) => {
                        const bad = r.mode !== "skip" && r.errors.length > 0;
                        const badge = MODE_BADGE[r.mode];
                        return (
                          <tr key={i} className={bad ? "bg-red-50/40" : r.mode === "skip" ? "bg-slate-50/60 opacity-60" : ""}>
                            <td className="px-2 py-1 font-mono text-slate-400">{i + 1}</td>
                            <td className="px-2 py-1">
                              {r.mode === "skip"
                                ? <MinusCircle className="h-3.5 w-3.5 text-slate-300" />
                                : bad
                                  ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-label={r.errors.map((e) => e.message).join("; ")} />
                                  : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            </td>
                            <td className="px-2 py-1">
                              <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                                {badge.label}
                              </span>
                            </td>
                            {targets.filter((t) => t.key !== "reference_number").map((t) => {
                              const header = mapping[t.key];
                              const raw = header ? (parsed?.rows[i]?.[header] ?? "") : "";
                              return (
                                <td key={t.key} className="px-1 py-0.5">
                                  {header ? (
                                    <input
                                      value={String(raw)}
                                      onChange={(e) => updateCell(i, header, e.target.value)}
                                      className="w-full min-w-28 bg-transparent px-1 py-1 text-slate-700 focus:bg-[#27aae1]/5 focus:outline-none"
                                    />
                                  ) : (
                                    <span className="px-1 text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1 text-right">
                              <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-600" aria-label="Remove row">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {invalid.length > 0 && (
                <p className="mt-1.5 text-xs text-red-500">Rows with errors are skipped on import — hover the warning icon for details.</p>
              )}
              {skipped.length > 0 && (
                <p className="mt-1 text-xs text-slate-400">{skipped.length} row{skipped.length !== 1 ? "s" : ""} already exist and will be skipped. Switch to “Update existing” to overwrite them.</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("match")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={runImport}
                disabled={valid.length === 0}
                style={{ backgroundColor: "#27aae1" }}
                className="text-white"
              >
                Import {valid.length} row{valid.length !== 1 ? "s" : ""}
                {updateCount > 0 && newCount > 0 ? ` (${newCount} new, ${updateCount} update)` : ""}
              </Button>
            </div>
          </div>
        )}

        {step === "review" && importing && (
          <div className="space-y-3 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#27aae1]" />
              Importing {progress.done} / {progress.total}…
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div className="h-full bg-[#27aae1] transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-slate-400">{progress.ok} imported · {progress.fail} failed</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "blue" | "slate" | "red" }) {
  const map = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue: "text-[#27aae1] bg-[#27aae1]/5 border-[#27aae1]/30",
    slate: "text-slate-500 bg-slate-50 border-slate-200",
    red: "text-red-600 bg-red-50 border-red-200",
  } as const;
  return (
    <div className={`border p-3 text-center ${map[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}