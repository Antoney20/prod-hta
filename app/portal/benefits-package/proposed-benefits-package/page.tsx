"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers, Boxes, ChevronLeft, ChevronRight, Plus, Trash2, Download,
  Wand2, FileText, Eye, CheckCircle2, ExternalLink, Save, Check, X, Minus,
  RefreshCw, PackageOpen,
} from "lucide-react";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { AdminOnly } from "@/app/context/role";
import {
  overviewProposed, buildFromSwg, promoteProposed, setDecision,
  deleteProposed, createProposed, pkgErr,
} from "@/app/api/new/panel/benefits-package";
import { listSwg } from "@/app/api/new/panel/swg";
import { downloadProposed } from "@/app/portal/benefits-package/_lib/package-excel";
import {
  getBenefitPackages, updateBenefitPackage, createBenefitPackage,
} from "@/app/api/new/benefits-package";
import type { BenefitPackage } from "@/types/new/benefits-package";
import type {
  Decision, PackageIntervention, ProposedPackage, SwgListSummary,
} from "@/types/panel/benefits-package";

/* ---------------------------------------------------------------- helpers */

type Tab = "interventions" | "revise" | "preview" | "finalize";
type Field = { key: string; value: string };
type FlatIntervention = PackageIntervention & { service: string };

const TABS: { key: Tab; label: string; icon: typeof Boxes }[] = [
  { key: "interventions", label: "Interventions", icon: Boxes },
  { key: "revise", label: "Revise Existing", icon: FileText },
  { key: "preview", label: "Preview", icon: Eye },
  { key: "finalize", label: "Finalize", icon: CheckCircle2 },
];

const DECISION_STYLE: Record<Decision, string> = {
  include: "bg-green-100 text-green-700 border-green-200",
  exclude: "bg-red-100 text-red-600 border-red-200",
  pending: "bg-slate-100 text-slate-500 border-slate-200",
};
const DECISION_ICON: Record<Decision, typeof Check> = { include: Check, exclude: X, pending: Minus };

const asDecision = (d: string): Decision =>
  d === "include" || d === "exclude" ? d : "pending";

const coverageHref = (it: { id?: string }) =>
  typeof it.id === "string" && it.id ? `/portal/panel/evidence/coverage/${it.id}` : null;

const LABELS: Record<string, string> = {
  scope: "Scope", access_point: "Access Point", tariff: "Tariff", ppm: "PPM", access_rules: "Access Rules",
};
const labelFor = (k: string) => LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const toFields = (data?: Record<string, any>): Field[] =>
  data && Object.keys(data).length
    ? Object.entries(data).map(([key, value]) => ({
        key, value: typeof value === "string" ? value : JSON.stringify(value),
      }))
    : [{ key: "", value: "" }];

const countBy = (its: PackageIntervention[]) => {
  const c = { include: 0, exclude: 0, pending: 0, total: its.length };
  its.forEach((it) => { c[asDecision(it.decision)]++; });
  return c;
};

/* ---------------------------------------------------------------- page */

export default function ProposedBenefitsPackagePage() {
  const [pkgs, setPkgs] = useState<ProposedPackage[]>([]);
  const [benefits, setBenefits] = useState<BenefitPackage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState<Tab>("interventions");
  const [stepIndex, setStepIndex] = useState(0);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // revise-existing editor
  const [reviseName, setReviseName] = useState("");
  const [reviseFund, setReviseFund] = useState("");
  const [reviseFields, setReviseFields] = useState<Field[]>([]);

  // build-from-swg
  const [showBuild, setShowBuild] = useState(false);
  const [swgLists, setSwgLists] = useState<SwgListSummary[]>([]);
  const [buildSwg, setBuildSwg] = useState("");
  const [buildFund, setBuildFund] = useState("");
  const [buildHta, setBuildHta] = useState("");

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  /* ---- loaders ---- */
  const load = useCallback(async () => {
    setLoading(true);
    const data = await overviewProposed();
    setPkgs(data);
    const c: Record<string, string> = {};
    data.forEach((p) => p.services.forEach((s) => s.interventions.forEach((it) => { c[`${p.id}::${it.ref}`] = it.comment; })));
    setComments(c);
    setSelectedId((cur) => (data.some((p) => p.id === cur) ? cur : data[0]?.id ?? ""));
    setLoading(false);
  }, []);

  const loadBenefits = useCallback(async () => setBenefits(await getBenefitPackages()), []);

  useEffect(() => { load(); loadBenefits(); listSwg().then(setSwgLists); }, [load, loadBenefits]);

  /* ---- derived ---- */
  const selected = useMemo(() => pkgs.find((p) => p.id === selectedId) ?? null, [pkgs, selectedId]);

  const flat: FlatIntervention[] = useMemo(
    () => selected ? selected.services.flatMap((s) => s.interventions.map((it) => ({ ...it, service: s.service }))) : [],
    [selected],
  );

  const existing = useMemo(
    () => selected ? benefits.find((b) => b.name.trim().toLowerCase() === selected.name.trim().toLowerCase()) ?? null : null,
    [benefits, selected],
  );

  const includedList = useMemo(() => flat.filter((it) => asDecision(it.decision) === "include"), [flat]);
  const summary = useMemo(() => countBy(flat), [flat]);
  const pkgIndex = useMemo(() => pkgs.findIndex((p) => p.id === selectedId), [pkgs, selectedId]);

  // reset step/tab when switching package
  useEffect(() => { setStepIndex(0); setTab("interventions"); }, [selectedId]);
  // hydrate revise editor when package/existing changes
  useEffect(() => {
    setReviseName(existing?.name ?? selected?.name ?? "");
    setReviseFund(existing?.fund ?? selected?.fund ?? "");
    setReviseFields(toFields(existing?.data));
  }, [selectedId, existing?.id]); // eslint-disable-line

  const grouped = useMemo(() => {
    const m = new Map<string, ProposedPackage[]>();
    pkgs.forEach((p) => { const k = p.fund || "Unassigned fund"; if (!m.has(k)) m.set(k, []); m.get(k)!.push(p); });
    return [...m.entries()];
  }, [pkgs]);

  const step = flat[stepIndex];

  /* ---- mutations ---- */
  const patchLocal = (ref: string, patch: Partial<PackageIntervention>) =>
    setPkgs((ps) => ps.map((p) => p.id !== selectedId ? p : {
      ...p, services: p.services.map((s) => ({
        ...s, interventions: s.interventions.map((x) => x.ref === ref ? { ...x, ...patch } : x),
      })),
    }));

  const decide = async (it: PackageIntervention, decision: Decision) => {
    if (!selected) return;
    const key = `${selected.id}::${it.ref}`;
    patchLocal(it.ref, { decision }); // optimistic
    try {
      await setDecision(selected.id, { ref: it.ref, decision, comment: comments[key] ?? it.comment });
    } catch (e) { toast.error(pkgErr(e)); await load(); }
  };

  const saveComment = async (it: PackageIntervention) => {
    if (!selected) return;
    const key = `${selected.id}::${it.ref}`;
    const comment = comments[key] ?? "";
    if (comment === it.comment) return;
    try {
      await setDecision(selected.id, { ref: it.ref, decision: it.decision, comment });
      patchLocal(it.ref, { comment });
      toast.success("Comment saved");
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const setField = (i: number, patch: Partial<Field>) =>
    setReviseFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addField = () => setReviseFields((f) => [...f, { key: "", value: "" }]);
  const removeField = (i: number) => setReviseFields((f) => f.filter((_, idx) => idx !== i));

  const saveRevise = async () => {
    if (!selected) return;
    setSaving(true);
    const data: Record<string, string> = {};
    reviseFields.forEach(({ key, value }) => { if (key.trim()) data[key.trim()] = value; });
    const payload = { name: reviseName.trim() || selected.name, fund: reviseFund.trim(), data };
    const res = existing ? await updateBenefitPackage(existing.id, payload) : await createBenefitPackage(payload);
    setSaving(false);
    if (res.ok) { toast.success(existing ? "Existing package updated." : "Package created."); await loadBenefits(); }
    else toast.error(res.error ?? "Save failed.");
  };

  const finalize = async () => {
    if (!selected) return;
    try {
      const rev = await promoteProposed(selected.id);
      toast.success(`Finalized — ${rev.items.length} intervention${rev.items.length !== 1 ? "s" : ""} promoted to revised.`);
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const addPackage = async () => {
    try {
      const { id } = await createProposed({ name: "New proposed package", fund: "", items: [] });
      await load();
      setSelectedId(id);
      toast.success("Package created — build or add interventions.");
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const deleteAll = async () => {
    try {
      await Promise.all(pkgs.map((p) => deleteProposed(p.id)));
      toast.success("All proposed packages deleted.");
      setSelectedId("");
      await load();
    } catch (e) { toast.error(pkgErr(e)); }
    setConfirmDeleteAll(false);
  };

  const runBuild = async () => {
    if (!buildSwg) return toast.warn("Pick an SWG list first.");
    try {
      await buildFromSwg({ swg_id: buildSwg, fund: buildFund, hta_type: buildHta || undefined });
      setShowBuild(false);
      await load();
      toast.success("Proposed packages built from SWG.");
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const gotoPkg = (d: number) => { const n = pkgs[pkgIndex + d]; if (n) setSelectedId(n.id); };

  /* ---- render ---- */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><Layers className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Proposed Benefits Package</h1>
            <p className="text-sm text-muted-foreground">Appraise, revise, and finalize interventions by package</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AdminOnly silent>
            <Button variant="outline" onClick={() => setShowBuild((v) => !v)}>
              <Wand2 className="mr-2 h-4 w-4" />Build from SWG
            </Button>
            <Button variant="outline" onClick={addPackage}><Plus className="mr-2 h-4 w-4" />Add package</Button>
          </AdminOnly>
          <Button variant="outline" size="sm" onClick={() => downloadProposed(pkgs)} disabled={!pkgs.length}>
            <Download className="mr-1.5 h-4 w-4" />Export Excel
          </Button>
          <AdminOnly silent>
            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDeleteAll(true)} disabled={!pkgs.length}>
              <Trash2 className="mr-1.5 h-4 w-4" />Delete all
            </Button>
          </AdminOnly>
        </div>
      </div>

      {/* Build-from-SWG panel */}
      {showBuild && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[#27aae1]/30 bg-[#27aae1]/5 p-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">SWG list</span>
            <select value={buildSwg} onChange={(e) => setBuildSwg(e.target.value)}
              className="h-9 border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
              <option value="">Select…</option>
              {swgLists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.count})</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fund</span>
            <Input value={buildFund} onChange={(e) => setBuildFund(e.target.value)} className="h-9 w-52" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">HTA track</span>
            <select value={buildHta} onChange={(e) => setBuildHta(e.target.value)}
              className="h-9 border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
              <option value="">All</option><option value="rapid">Rapid</option>
              <option value="full">Full</option><option value="panel">Panel</option>
            </select>
          </label>
          <Button onClick={runBuild} style={{ backgroundColor: "#fe7105" }} className="text-white">Build</Button>
          <Button variant="outline" onClick={() => setShowBuild(false)}>Cancel</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !pkgs.length ? (
        <div className="rounded-lg border border-dashed py-20 text-center text-sm text-muted-foreground">
          No proposed packages yet.{" "}
          <AdminOnly silent><button className="text-[#27aae1] hover:underline" onClick={() => setShowBuild(true)}>Build one from an SWG list</button>.</AdminOnly>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          {/* SECTION 1 — package rail */}
          <aside className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Packages</p>
            <div className="max-h-[72vh] space-y-3 overflow-auto pr-1">
              {grouped.map(([fund, list]) => (
                <div key={fund}>
                  <p className="mb-1 px-1 text-xs font-semibold text-slate-500">{fund}</p>
                  <div className="space-y-1">
                    {list.map((p) => {
                      const c = countBy(p.services.flatMap((s) => s.interventions));
                      const active = p.id === selectedId;
                      return (
                        <button key={p.id} onClick={() => setSelectedId(p.id)}
                          className={`w-full rounded-lg border p-2.5 text-left transition-colors ${active ? "border-[#27aae1] bg-[#27aae1]/10" : "border-slate-200 hover:bg-slate-50"}`}>
                          <span className={`block text-sm font-medium ${active ? "text-[#1d70b8]" : "text-slate-700"}`}>{p.name}</span>
                          <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{c.total} interv.</span>
                            <span className="text-green-600">{c.include} in</span>
                            <span className="text-red-500">{c.exclude} out</span>
                            {c.pending > 0 && <span>{c.pending} pending</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* SECTION 2 — workspace */}
          <section className="rounded-lg border">
            {!selected ? (
              <div className="py-24 text-center text-sm text-muted-foreground">Select a package to begin.</div>
            ) : (
              <>
                {/* package header + nav */}
                <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-4 py-3">
                  <PackageOpen className="h-4 w-4 text-[#27aae1]" />
                  <h2 className="font-semibold text-[#1d70b8]">{selected.name}</h2>
                  {selected.fund && <span className="text-xs text-slate-400">{selected.fund}</span>}
                  <span className="text-xs text-slate-400">· existing: {selected.current.length} items</span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => gotoPkg(-1)} disabled={pkgIndex <= 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-1 text-xs text-slate-400">{pkgIndex + 1}/{pkgs.length}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => gotoPkg(1)} disabled={pkgIndex >= pkgs.length - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* tab bar */}
                <div className="flex border-b bg-white px-2">
                  {TABS.map((t) => {
                    const Icon = t.icon; const on = tab === t.key;
                    return (
                      <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${on ? "border-[#27aae1] font-medium text-[#1d70b8]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                        <Icon className="h-4 w-4" />{t.label}
                        {t.key === "finalize" && summary.include > 0 && (
                          <span className="rounded-full bg-green-100 px-1.5 text-[10px] text-green-700">{summary.include}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4">
                  {/* ---- Interventions ---- */}
                  {tab === "interventions" && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
                      {/* stepper card */}
                      <div>
                        {!flat.length ? (
                          <p className="py-10 text-center text-sm text-muted-foreground">No interventions in this package.</p>
                        ) : step ? (
                          <div className="rounded-lg border border-slate-200 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{step.service || "—"}</span>
                              <span className="text-xs text-slate-400">Intervention {stepIndex + 1} of {flat.length}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {coverageHref(step) ? (
                                <a href={coverageHref(step)!} onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 rounded bg-[#27aae1]/10 px-1.5 py-0.5 font-mono text-[11px] text-[#27aae1] no-underline hover:underline">
                                  {step.ref}<ExternalLink className="h-3 w-3 opacity-60" />
                                </a>
                              ) : (
                                <span className="font-mono text-[11px] text-slate-400">{step.ref}</span>
                              )}
                              {step.routing && <span className="rounded bg-[#27aae1]/10 px-2 py-0.5 text-[11px] text-[#1d70b8]">{step.routing}</span>}
                              <span className={`ml-auto inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] capitalize ${DECISION_STYLE[asDecision(step.decision)]}`}>
                                {(() => { const I = DECISION_ICON[asDecision(step.decision)]; return <I className="h-3 w-3" />; })()}
                                {asDecision(step.decision)}
                              </span>
                            </div>

                            <h3 className="mt-2 text-base font-semibold text-slate-800">{step.name}</h3>

                            {/* decision buttons */}
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {(["include", "exclude", "pending"] as Decision[]).map((d) => {
                                const on = asDecision(step.decision) === d; const I = DECISION_ICON[d];
                                return (
                                  <button key={d} onClick={() => decide(step, d)}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${on ? DECISION_STYLE[d] : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                    <I className="h-4 w-4" />{d}
                                  </button>
                                );
                              })}
                            </div>

                            {/* comment */}
                            <label className="mt-4 block">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Panel comment</span>
                              <textarea rows={2} placeholder="Rationale for this decision…"
                                value={comments[`${selected.id}::${step.ref}`] ?? ""}
                                onChange={(e) => setComments((c) => ({ ...c, [`${selected.id}::${step.ref}`]: e.target.value }))}
                                onBlur={() => saveComment(step)}
                                className="mt-1 w-full resize-y border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
                            </label>

                            {/* stepper nav */}
                            <div className="mt-4 flex items-center justify-between">
                              <Button variant="outline" size="sm" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0}>
                                <ChevronLeft className="mr-1 h-4 w-4" />Previous
                              </Button>
                              <Button size="sm" onClick={() => setStepIndex((i) => Math.min(flat.length - 1, i + 1))}
                                disabled={stepIndex >= flat.length - 1} style={{ backgroundColor: "#27aae1" }} className="text-white">
                                Next<ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* jump list */}
                      <div className="rounded-lg border border-slate-200">
                        <p className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">All interventions</p>
                        <div className="max-h-[52vh] overflow-auto">
                          {flat.map((it, i) => {
                            const I = DECISION_ICON[asDecision(it.decision)]; const on = i === stepIndex;
                            return (
                              <button key={it.ref} onClick={() => setStepIndex(i)}
                                className={`flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2 text-left text-xs ${on ? "bg-[#27aae1]/10" : "hover:bg-slate-50"}`}>
                                <I className={`h-3.5 w-3.5 shrink-0 ${asDecision(it.decision) === "include" ? "text-green-600" : asDecision(it.decision) === "exclude" ? "text-red-500" : "text-slate-300"}`} />
                                <span className="line-clamp-2 flex-1 text-slate-700">{it.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---- Revise Existing ---- */}
                  {tab === "revise" && (
                    <div className="max-w-2xl space-y-4">
                      {!existing && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          No existing benefit package named “{selected.name}”. Saving will create it.
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name</span>
                          <Input value={reviseName} onChange={(e) => setReviseName(e.target.value)} />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fund</span>
                          <Input value={reviseFund} onChange={(e) => setReviseFund(e.target.value)} />
                        </label>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Package fields</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addField}>
                            <Plus className="mr-1 h-3.5 w-3.5" />Add field
                          </Button>
                        </div>
                        {reviseFields.map((row, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Input className="w-40 shrink-0 font-mono text-xs" placeholder="access_point"
                              value={row.key} onChange={(e) => setField(i, { key: e.target.value })} />
                            <textarea className="min-w-0 flex-1 border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                              rows={2} placeholder="Level 4-6" value={row.value} onChange={(e) => setField(i, { value: e.target.value })} />
                            <button className="mt-1 text-slate-400 hover:text-red-600" onClick={() => removeField(i)} title="Remove field">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <AdminOnly silent>
                        <Button onClick={saveRevise} disabled={saving} style={{ backgroundColor: "#27aae1" }} className="text-white">
                          <Save className="mr-1.5 h-4 w-4" />{existing ? "Save changes" : "Create package"}
                        </Button>
                      </AdminOnly>
                    </div>
                  )}

                  {/* ---- Preview ---- */}
                  {tab === "preview" && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-slate-200">
                        <p className="border-b px-3 py-2 text-xs font-semibold text-slate-500">Revised package fields</p>
                        <dl className="divide-y divide-slate-100 text-sm">
                          {reviseFields.filter((f) => f.key.trim()).map((f, i) => (
                            <div key={i} className="px-3 py-2">
                              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{labelFor(f.key.trim())}</dt>
                              <dd className="whitespace-pre-line text-slate-700">{f.value || <span className="text-slate-300">—</span>}</dd>
                            </div>
                          ))}
                          {!reviseFields.some((f) => f.key.trim()) && <p className="px-3 py-4 text-xs text-slate-400">No fields set.</p>}
                        </dl>
                      </div>
                      <div className="rounded-lg border border-slate-200">
                        <p className="border-b px-3 py-2 text-xs font-semibold text-slate-500">
                          Included interventions <span className="text-green-600">({includedList.length})</span>
                        </p>
                        <div className="max-h-[52vh] divide-y divide-slate-100 overflow-auto">
                          {includedList.map((it) => (
                            <div key={it.ref} className="px-3 py-2">
                              <p className="text-sm font-medium text-slate-700">{it.name}</p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                <span className="font-mono">{it.ref}</span>
                                {it.service && <span>{it.service}</span>}
                              </p>
                              {it.comment && <p className="mt-1 text-xs text-slate-500">{it.comment}</p>}
                            </div>
                          ))}
                          {!includedList.length && <p className="px-3 py-4 text-xs text-slate-400">Nothing included yet.</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---- Finalize ---- */}
                  {tab === "finalize" && (
                    <div className="max-w-xl space-y-4">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {([
                          ["Total", summary.total, "text-slate-700"],
                          ["Included", summary.include, "text-green-600"],
                          ["Excluded", summary.exclude, "text-red-500"],
                          ["Pending", summary.pending, "text-amber-500"],
                        ] as const).map(([k, v, cls]) => (
                          <div key={k} className="rounded-lg border border-slate-200 py-3">
                            <p className={`text-2xl font-bold ${cls}`}>{v}</p>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">{k}</p>
                          </div>
                        ))}
                      </div>

                      {summary.pending > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          {summary.pending} intervention{summary.pending !== 1 ? "s" : ""} still pending a decision.
                        </div>
                      )}

                      <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                        Finalizing promotes the <strong className="text-green-700">{summary.include}</strong> included
                        intervention{summary.include !== 1 ? "s" : ""} into the revised benefits package for
                        <strong> {selected.name}</strong>. Excluded and pending items are left out.
                      </div>

                      <AdminOnly silent>
                        <Button onClick={finalize} disabled={!summary.include}
                          className="w-full bg-green-600 text-white hover:bg-green-700">
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />Finalize → Promote {summary.include} to Revised
                        </Button>
                      </AdminOnly>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <DeleteDialog
        open={confirmDeleteAll}
        onOpenChange={(v) => !v && setConfirmDeleteAll(false)}
        title="Delete all proposed packages?"
        description={<span>All <strong>{pkgs.length}</strong> proposed package{pkgs.length !== 1 ? "s" : ""} and their decisions will be permanently removed. Existing benefit packages and revised packages are not affected.</span>}
        onConfirm={deleteAll}
      />
    </div>
  );
}