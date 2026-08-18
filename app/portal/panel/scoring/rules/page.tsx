"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw, Sliders, Upload, Trash2, FileJson, Search, AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CriteriaAppraisalTool } from "@/types/new/panel-score";
import {
  getPanelRules, importPanelRules, deletePanelRule, getAppraisalCriteria,
} from "@/app/api/new/panel/panel-scoring";
import { globalUserStore } from "@/app/context/guard";
import { PanelScoringRule } from "@/types/panel/panel-score";
import EditRuleDialog from "./edit";


const ADMIN_ROLES = new Set(["admin"]);

export default function PanelScoringRulesPage() {
  const isAdmin = !!globalUserStore.userData?.role && ADMIN_ROLES.has(globalUserStore.userData.role);

  const [rules, setRules] = useState<PanelScoringRule[]>([]);
  const [criteria, setCriteria] = useState<CriteriaAppraisalTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PanelScoringRule | null>(null);
  const [editRule, setEditRule] = useState<PanelScoringRule | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rls, crit] = await Promise.all([getPanelRules(), getAppraisalCriteria()]);
      setRules(rls);
      setCriteria(crit);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter((r) => r.criteria.toLowerCase().includes(q));
  }, [rules, search]);

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : parsed.rules;
      if (!Array.isArray(arr)) {
        toast.error("JSON must be an array of rules (or { rules: [...] }).");
        return;
      }
      const res = await importPanelRules(arr);
      const msg = `${res.created} created · ${res.updated} updated`;
      if (res.failed.length) toast.warn(`${msg} · ${res.failed.length} failed.`);
      else toast.success(msg);
      await load();
    } catch (e: any) {
      toast.error(
        e?.message?.includes("JSON") ? "Invalid JSON file." : (e?.message ?? "Import failed.")
      );
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePanelRule(pendingDelete.id);
      toast.success("Rule deleted.");
      setPendingDelete(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed.");
    }
  };

  const kindBadge = (r: PanelScoringRule) =>
    r.kind === "combo" ? (
      <Badge variant="outline" className="border-[#fe7105]/30 bg-[#fe7105]/10 text-[10px] text-[#fe7105]">
        Combo
      </Badge>
    ) : (
      <Badge variant="outline" className="border-[#27aae1]/30 bg-[#27aae1]/10 text-[10px] text-[#27aae1]">
        Band{r.aggregate === "sum" ? " · sum" : ""}
      </Badge>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#27aae1]/20 bg-[#27aae1]/10 p-2">
            <Sliders className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Auto-Score Rules</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Deterministic rules that map evidence values (or category combinations) to criterion
              scores. Applied at scoring time — never overriding the model wall.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button
                size="sm"
                style={{ backgroundColor: "#27aae1" }}
                className="gap-1.5 text-white"
                onClick={() => fileRef.current?.click()}
                disabled={importing}
              >
                {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import JSON
              </Button>
            </>
          )}
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by criterion…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "#27aae1" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
          <FileJson className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">
            {rules.length === 0
              ? "No rules yet. Import a rules JSON to begin."
              : "No rules match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{r.criteria}</span>
                    {kindBadge(r)}
                    {!r.active && (
                      <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-400">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{r.description}</p>
                  )}
                  {r.kind === "band" &&
                    (r.target_fields.length > 0 ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Reads: {r.target_fields.join(r.aggregate === "sum" ? " + " : ", ")}
                      </p>
                    ) : (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> No field mapped — won&apos;t auto-fire
                      </p>
                    ))}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {r.kind === "band" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-[#27aae1] hover:bg-[#27aae1]/10"
                        onClick={() => setEditRule(r)}
                      >
                        Map fields
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setPendingDelete(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Combo dimensions */}
                {r.kind === "combo" && r.items.length > 0 && (
                  <div className="mb-3 grid gap-2 sm:grid-cols-3">
                    {r.items.map((it) => (
                      <div key={it.key} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                        <p className="mb-1 text-[11px] font-semibold text-slate-600">{it.label}</p>
                        <ul className="space-y-0.5">
                          {it.levels.map((lv) => (
                            <li key={lv.code} className="text-[11px] text-slate-500">
                              <span className="font-mono font-semibold text-[#27aae1]">{lv.code}</span> — {lv.desc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bands table */}
                <div className="overflow-hidden rounded-md border border-slate-100">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-3 py-1.5 text-left">
                          {r.kind === "combo" ? "Combination" : "Condition"}
                        </th>
                        <th className="px-3 py-1.5 text-left">Label</th>
                        <th className="px-3 py-1.5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {r.bands.map((b, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-mono text-slate-600">
                            {r.kind === "combo"
                              ? (b.combo ?? []).join(" + ")
                              : b.op === "between" && Array.isArray(b.value)
                              ? `${b.value[0]} – ${b.value[1]}`
                              : `${b.op} ${b.value}`}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">{b.label ?? "—"}</td>
                          <td className="px-3 py-1.5 text-right">
                            <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">
                              {b.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditRuleDialog
        rule={editRule}
        criteria={criteria}
        open={!!editRule}
        onOpenChange={(o) => !o && setEditRule(null)}
        onSaved={load}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Removes the auto-score rule for <strong>{pendingDelete?.criteria}</strong>. Scoring for
              this criterion falls back to manual. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}