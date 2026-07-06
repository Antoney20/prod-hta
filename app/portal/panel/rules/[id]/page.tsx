"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft, Scale, BookOpen, Paperclip, Trash2, LinkIcon, FileText, ExternalLink,
  ListChecks, Layers, Target, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { htmlToText } from "@/components/shared/text";
import { AdminOnly } from "@/app/context/role";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";

import { CriteriaRule, GuideDocument, RuleBand } from "@/types/new/criteria-rules";
import { getRule, deleteDocument, deleteRule } from "@/app/api/new/panel/rules";
import DocumentDialog from "./form";
import EditRuleDialog from "./edit";

const opText = (op?: string) =>
  ({ "<=": "≤", "<": "<", ">=": "≥", ">": ">", "==": "=", "!=": "≠", between: "range", in: "one of" }[op ?? ""] ?? op ?? "");

const bandCondition = (b: RuleBand): string => {
  if (b.combo) return b.combo.join(" · ");
  if (b.op) {
    const v = Array.isArray(b.value) ? b.value.join("–") : b.value;
    return `${opText(b.op)} ${v}`;
  }
  return "";
};

export default function RuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rule, setRule] = useState<CriteriaRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GuideDocument | null>(null);
  const [confirmRule, setConfirmRule] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setRule(await getRule(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteDoc = async () => {
    if (!toDelete) return;
    const doc = toDelete;
    setToDelete(null);
    const res = await deleteDocument(doc.id);
    if (res.ok) { toast.success("Guide removed"); load(); }
    else toast.error(res.error ?? "Delete failed");
  };

  const handleDeleteRule = async () => {
    if (!rule) return;
    setConfirmRule(false);
    const res = await deleteRule(rule.id);
    if (res.ok) {
      toast.success("Rule deleted");
      router.push("/portal/panel/rules");
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  };

  // group bands by their field when the rule reads more than one field
  const bandGroups = useMemo(() => {
    if (!rule) return [];
    const bands = rule.bands ?? [];
    const multi = (rule.target_fields?.length ?? 0) > 1 && bands.some((b) => b.field);
    if (!multi) {
      return [{ field: null as string | null, bands: [...bands].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)) }];
    }
    const map = new Map<string, RuleBand[]>();
    for (const b of bands) {
      const k = b.field ?? "—";
      map.set(k, [...(map.get(k) ?? []), b]);
    }
    // preserve target_fields order
    return rule.target_fields.map((f) => ({
      field: f,
      bands: (map.get(f) ?? []).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    }));
  }, [rule]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="p-6 text-center text-slate-500">
        Rule not found.
        <Button variant="link" onClick={() => router.push("/portal/panel/rules")}>Back</Button>
      </div>
    );
  }

  const isCombo = rule.aggregate === "combo";

  return (
    <div className="space-y-6 p-6">
      {/* header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/portal/panel/rules")}
          className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-lg bg-[#27aae1]/10 p-2"><Scale className="h-5 w-5 text-[#27aae1]" /></div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">{rule.criterion_name}</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{rule.kind}</span>
            {rule.aggregate && (
              <span className="rounded-full bg-[#27aae1]/10 px-2 py-0.5 text-xs font-medium text-[#27aae1]">{rule.aggregate}</span>
            )}
            {!rule.active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">inactive</span>}
          </div>
          {rule.description && (
            <p className="mt-1 max-w-3xl text-sm text-slate-500">{htmlToText(rule.description)}</p>
          )}
        </div>
        <AdminOnly silent>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit rule
            </Button>
            <Button variant="outline" size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmRule(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete rule
            </Button>
          </div>
        </AdminOnly>
      </div>

      {/* target fields */}
      {rule.target_fields?.length > 0 && (
        <div className="border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Fields this rule uses for decision making.</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rule.target_fields.map((f) => (
              <span key={f} className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">{f}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {rule.target_fields.length > 1
              ? `Each field is scored on its own bands, then combined by “${rule.aggregate || "single"}”.`
              : "The evidence data label whose value the rule maps to a score."}
          </p>
        </div>
      )}

      {/* factor definitions */}
      {rule.items?.length > 0 && (
        <div className="border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Layers className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Factors</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {rule.items.map((f) => (
              <div key={f.key} className="px-4 py-3">
                <p className="mb-1.5 text-sm font-semibold text-slate-700">
                  <span className="mr-2 rounded bg-[#27aae1] px-1.5 py-0.5 text-xs text-white">{f.key}</span>
                  {f.label}
                </p>
                <div className="space-y-1 pl-1">
                  {(f.levels ?? []).map((lv) => (
                    <div key={lv.code} className="flex gap-2 text-sm">
                      <span className="w-10 shrink-0 font-mono text-xs text-slate-500">{lv.code}</span>
                      <span className="text-slate-600">{lv.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* scoring bands — grouped per field when multi-field */}
      <div className="space-y-4">
        {bandGroups.map((g, gi) => (
          <div key={gi} className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <ListChecks className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">
                {g.field ? `Bands · ${g.field}` : "Scoring bands"}
              </h2>
              <span className="text-xs text-slate-400">· higher score = stronger case</span>
            </div>
            {g.bands.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No bands for this field.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {g.bands.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#27aae1] text-xs font-semibold text-white">
                      {b.score ?? "–"}
                    </span>
                    <div className="min-w-0 flex-1">
                      {isCombo && b.combo ? (
                        <div className="flex flex-wrap gap-1.5">
                          {b.combo.map((c, ci) => (
                            <span key={ci} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{c}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {b.op && (
                            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500">
                              {bandCondition(b)}
                            </code>
                          )}
                          {b.label && <span className="text-sm text-slate-600">{b.label}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* guide documents */}
      <div className="border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Guide documents</h2>
          </div>
          <AdminOnly silent>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setDialogOpen(true)}>
              <Paperclip className="mr-1.5 h-4 w-4" /> Attach guide
            </Button>
          </AdminOnly>
        </div>

        {rule.documents.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No guides attached. These are reference materials — published literature or guidelines —
            that anchor how this criterion’s evidence is judged.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rule.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                {d.file_url ? <FileText className="h-4 w-4 shrink-0 text-[#27aae1]" />
                  : <LinkIcon className="h-4 w-4 shrink-0 text-slate-400" />}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium text-slate-700">{d.label}</p>
                  {d.description && <p className="line-clamp-1 text-xs text-slate-400">{d.description}</p>}
                </div>
                {(d.file_url || d.link) && (
                  <a href={d.file_url ?? d.link} target="_blank" rel="noopener noreferrer"
                    className="text-[#27aae1] hover:opacity-70">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <AdminOnly silent>
                  <button onClick={() => setToDelete(d)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AdminOnly>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditRuleDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        rule={rule}
        onSaved={() => { setEditOpen(false); load(); }}
      />

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={rule}
        onSaved={() => { setDialogOpen(false); load(); }}
      />

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remove guide?"
        description={<><strong>{toDelete?.label}</strong> will be permanently removed from this rule.</>}
        onConfirm={handleDeleteDoc}
      />
      <DeleteDialog
        open={confirmRule}
        onOpenChange={setConfirmRule}
        title="Delete rule?"
        description={
          <>
            The rule for <strong>{rule.criterion_name}</strong> — all its bands
            {rule.target_fields?.length ? `, target fields (${rule.target_fields.join(", ")})` : ""}
            {rule.documents?.length ? `, and ${rule.documents.length} guide document${rule.documents.length !== 1 ? "s" : ""}` : ""} —
            will be permanently deleted.
          </>
        }
        confirmWord="delete rule"
        onConfirm={handleDeleteRule}
      />
    </div>
  );
}