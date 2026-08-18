"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Save, Loader2, Plus, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { CriteriaAppraisalTool } from "@/types/new/panel-score";
import { updatePanelRule } from "@/app/api/new/panel/panel-scoring";
import { PanelScoringRule } from "@/types/panel/panel-score";

/** Normalized criteria key — mirrors backend make_key / rule.criteria_key. */
const critKey = (s: string): string => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const humanize = (key: string): string =>
  key.replace(/_/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

interface FieldOption {
  key: string;
  label: string;
}

export default function EditRuleDialog({
  rule,
  criteria,
  open,
  onOpenChange,
  onSaved,
}: {
  rule: PanelScoringRule | null;
  criteria: CriteriaAppraisalTool[]; 
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [fields, setFields] = useState<string[]>([]);
  const [aggregate, setAggregate] = useState<"" | "sum">("");
  const [manualKey, setManualKey] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed state when a different rule opens.
  useEffect(() => {
    if (!rule) return;
    setFields(rule.target_fields ?? []);
    setAggregate(rule.aggregate === "sum" ? "sum" : "");
    setManualKey("");
    setSearch("");
  }, [rule]);

  // Available fields for THIS criterion: union of header keys across every
  // appraisal-tool row that shares the rule's criteria name (case-insensitive).
  const available: FieldOption[] = useMemo(() => {
    if (!rule) return [];
    const key = rule.criteria_key || critKey(rule.criteria);
    const seen = new Map<string, string>();
    for (const c of criteria) {
      if (critKey(c.criteria) !== key) continue;
      for (const h of c.headers ?? []) {
        const k = (h?.key || "").trim();
        if (k && !seen.has(k)) seen.set(k, h.label || humanize(k));
      }
    }
    return Array.from(seen.entries())
      .map(([k, label]) => ({ key: k, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rule, criteria]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (f) => f.key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q)
    );
  }, [available, search]);

  if (!rule) return null;

  const toggle = (key: string) =>
    setFields((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));
  const remove = (key: string) => setFields((f) => f.filter((x) => x !== key));

  const addManual = () => {
    const k = manualKey.trim();
    if (!k || fields.includes(k)) return;
    setFields((f) => [...f, k]);
    setManualKey("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await updatePanelRule(rule.id, {
        target_fields: fields,
        aggregate: fields.length > 1 ? aggregate : "",
      });
      toast.success("Rule updated.");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Map evidence fields</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">{rule.criteria}</p>
            <p className="text-xs text-slate-500">
              Pick the evidence field(s) this rule reads. The value is matched against the rule&apos;s
              bands to pick a score. Selecting two fields lets you sum them.
            </p>
          </div>

          {/* Selected fields */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#27aae1]">
              Selected {fields.length > 0 && `(${fields.length})`}
            </p>
            {fields.length === 0 ? (
              <p className="text-xs italic text-amber-600">
                None selected — this rule won&apos;t auto-fire until you add a field.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {fields.map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    className="gap-1 border-[#27aae1]/30 bg-[#27aae1]/10 font-mono text-[11px] text-[#27aae1]"
                  >
                    {f}
                    <button
                      onClick={() => remove(f)}
                      className="ml-0.5 rounded-full hover:bg-[#27aae1]/20"
                      aria-label={`Remove ${f}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Aggregate — only when >1 field */}
          {fields.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#27aae1]">
                Combine
              </p>
              <div className="flex gap-1.5">
                {(["sum", ""] as const).map((mode) => (
                  <button
                    key={mode || "first"}
                    onClick={() => setAggregate(mode)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      aggregate === mode
                        ? "border-[#27aae1] bg-[#27aae1] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
                    }`}
                  >
                    {mode === "sum" ? "Sum the fields" : "Use first field"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available fields from this criterion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Available fields
              </p>
              {available.length > 6 && (
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter…"
                    className="h-7 pl-8 text-xs"
                  />
                </div>
              )}
            </div>

            {available.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                No evidence fields found for this criterion. Its appraisal-tool rows have no headers —
                add a field key manually below.
              </p>
            ) : (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-slate-100 p-2">
                {filtered.map((f) => {
                  const on = fields.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggle(f.key)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition ${
                        on
                          ? "border-[#27aae1] bg-[#27aae1]/5"
                          : "border-slate-200 hover:border-[#27aae1] hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-700">{f.label}</span>
                        <span className="block truncate font-mono text-[11px] text-slate-400">{f.key}</span>
                      </span>
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                          on ? "border-[#27aae1] bg-[#27aae1]" : "border-slate-300"
                        }`}
                      >
                        {on && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="py-3 text-center text-xs text-slate-400">No fields match.</p>
                )}
              </div>
            )}

            {/* Manual key escape hatch */}
            <div className="flex gap-2">
              <Input
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addManual();
                  }
                }}
                placeholder="Or type a field key manually…"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={addManual} className="gap-1 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="gap-1.5 text-white"
            style={{ backgroundColor: "#27aae1" }}
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}