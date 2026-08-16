"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Layers, RefreshCw, UploadCloud, CheckCircle2, Download, Info, Boxes, FileText, Eye, PanelLeftOpen } from "lucide-react";

import { AdminOnly } from "@/app/context/role";

import { createBenefitPackage, getBenefitPackages, updateBenefitPackage } from "@/app/api/new/benefits-package";
import { downloadReport, submit } from "@/app/portal/benefits-package/appraisal-report/handler";
import { BulkImportAppraised } from "@/app/portal/benefits-package/appraisal-report/bulk";
import type { BenefitPackage } from "@/types/new/benefits-package";
import type { AppraisalRow, ImportMode } from "@/types/panel/appraisal-report";
import { asDecision, Decision, distinctPhases, Field, fieldsToData, groupByPackage, includedIn, keyed, phaseOf, pkgOf, Proposal, strip, toFields } from "../_lib/proposal";
import { buildProposed, buildRevised, createReport, getReport, listReports, updateReport } from "@/app/api/new/panel/appraisal-report";
import { PackageRail } from "../_components/package";
import { ProposalsToolbar } from "../_components/toolbar";
import { ReviewSheet } from "../_components/review-sheet";
import { ProposalsTable } from "../_components/table";
import { PreviewPanel, RevisePanel } from "../_components/revise";



type WsTab = "review" | "revise" | "preview";

const TABS: { key: WsTab; label: string; icon: typeof Boxes }[] = [
  { key: "review", label: "Review", icon: Boxes },
  { key: "revise", label: "Revise Existing", icon: FileText },
  { key: "preview", label: "Preview", icon: Eye },
];

export default function ProposedBenefitsPackagePage() {
  const [activeId, setActiveId] = useState("");
  const [name, setName] = useState("Appraised Interventions");
  const [items, setItems] = useState<Proposal[]>([]);
  const [benefits, setBenefits] = useState<BenefitPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  const [pkg, setPkg] = useState("all");
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [reviewKey, setReviewKey] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [tab, setTab] = useState<WsTab>("review");

  // revise-existing editor
  const [reviseName, setReviseName] = useState("");
  const [reviseFund, setReviseFund] = useState("");
  const [reviseFields, setReviseFields] = useState<Field[]>([]);
  const [saving, setSaving] = useState(false);

  /* ---- load ---- */
  const apply = (full: { id: string; name: string; items?: AppraisalRow[] }) => {
    setActiveId(full.id);
    setName(full.name || "Appraised Interventions");
    setItems(keyed(full.items || []));
  };

  const load = useCallback(async () => {
    setLoading(true);
    const ls = await listReports();
    if (ls.length) {
      const full = await getReport(ls[0].id);
      if (full) apply(full);
    } else {
      const { id } = await createReport({ name: "Appraised Interventions", data: {}, items: [] });
      const full = await getReport(id);
      if (full) apply(full);
    }
    setLoading(false);
  }, []);

  const loadBenefits = useCallback(async () => setBenefits(await getBenefitPackages()), []);

  useEffect(() => { load(); loadBenefits(); }, [load, loadBenefits]);
  useEffect(() => { setPage(1); }, [pkg, search, phase, perPage]);
  useEffect(() => { setTab("review"); }, [pkg]);

  /* ---- derived ---- */
  const groups = useMemo(() => groupByPackage(items), [items]);
  const phases = useMemo(() => distinctPhases(items), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (pkg !== "all" && pkgOf(r) !== pkg) return false;
      if (phase && phaseOf(r) !== phase) return false;
      if (q && ![r.ref, r.intervention, r.package, r.service].some((v) => String(v ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, pkg, phase, search]);

  const currentPkg = useMemo(
    () => pkg === "all" ? null
      : benefits.find((b) => b.name.trim().toLowerCase() === pkg.trim().toLowerCase()) ?? null,
    [benefits, pkg],
  );

  const includedForPkg = useMemo(() => pkg === "all" ? [] : includedIn(items, pkg), [items, pkg]);
  const includedTotal = useMemo(() => items.filter((r) => asDecision(r.decision) === "include").length, [items]);
  const reviewProposal = useMemo(() => items.find((r) => r._key === reviewKey) ?? null, [items, reviewKey]);

  // hydrate revise editor when package/existing changes
  useEffect(() => {
    if (pkg === "all") return;
    setReviseName(currentPkg?.name ?? pkg);
    setReviseFund(currentPkg?.fund ?? "");
    setReviseFields(toFields(currentPkg?.data));
  }, [pkg, currentPkg?.id]); // eslint-disable-line

  /* ---- mutations ---- */
  const persist = async (next: Proposal[]) => {
    setItems(next);
    if (activeId) { try { await updateReport(activeId, { items: strip(next) }); } catch { toast.error("Failed to save."); } }
  };
  const decide = (key: string, decision: Decision) =>
    persist(items.map((r) => (r._key === key ? { ...r, decision } : r)));
  const comment = (key: string, c: string) =>
    persist(items.map((r) => (r._key === key ? { ...r, comment: c } : r)));

  const ensureId = async () => {
    if (activeId) return activeId;
    const { id } = await createReport({ name, data: {}, items: [] });
    setActiveId(id);
    return id;
  };

  const handleImport = async (incoming: AppraisalRow[], mode: ImportMode) => {
    const id = await ensureId();
    const { added, items: next } = await submit({
      id, existing: strip(items), incoming, mode: items.length ? mode : "replace",
    });
    setItems(keyed(next));
    return added;
  };

  const build = async () => {
    if (!activeId) return;
    setBuilding(true);
    try {
      const out: any = await buildRevised(activeId);
      const n = Array.isArray(out) ? out.reduce((s, x) => s + (x.count ?? 0), 0) : includedTotal;
      toast.success(`Built revised packages · ${n} included intervention${n !== 1 ? "s" : ""}.`);
      await loadBenefits();
    } catch { toast.error("Build failed."); }
    finally { setBuilding(false); }
  };

  /* ---- revise-existing ---- */
  const setField = (i: number, patch: Partial<Field>) =>
    setReviseFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addField = () => setReviseFields((f) => [...f, { key: "", value: "" }]);
  const removeField = (i: number) => setReviseFields((f) => f.filter((_, idx) => idx !== i));

  const saveRevise = async () => {
    if (pkg === "all") return;
    setSaving(true);
    const payload = { name: reviseName.trim() || pkg, fund: reviseFund.trim(), data: fieldsToData(reviseFields) };
    const res = currentPkg ? await updateBenefitPackage(currentPkg.id, payload) : await createBenefitPackage(payload);
    setSaving(false);
    if (res.ok) { toast.success(currentPkg ? "Existing package updated." : "Package created."); await loadBenefits(); }
    else toast.error(res.error ?? "Save failed.");
  };

  /* ---- render ---- */
  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><Layers className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Proposed Benefits Package</h1>
            <p className="text-sm text-muted-foreground">Review panel-appraised interventions, revise the live package, build the revised set</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" onClick={() => { load(); loadBenefits(); }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AdminOnly silent>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" />Import
            </Button>
          </AdminOnly>
          <Button variant="outline" size="sm" onClick={() => downloadReport(name, strip(filtered))} disabled={loading || !items.length}>
            <Download className="mr-1.5 h-4 w-4" />Export
          </Button>
          <AdminOnly silent>
            <Button onClick={build} disabled={building || !includedTotal}
              className="bg-green-600 text-white hover:bg-green-700">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />Build revised ({includedTotal})
            </Button>
          </AdminOnly>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !items.length ? (
        <div className="rounded-lg border border-dashed py-20 text-center text-sm text-muted-foreground">
          No appraised interventions yet.{" "}
          <AdminOnly silent><button className="text-[#27aae1] hover:underline" onClick={() => setBulkOpen(true)}>Import the appraisal report</button>.</AdminOnly>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${railOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[44px_1fr]"}`}>
          {railOpen ? (
            <PackageRail
              groups={groups} total={items.length} phases={phases}
              selected={pkg} onSelect={setPkg} phaseFilter={phase} onPhase={setPhase}
              onCollapse={() => setRailOpen(false)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-white py-3">
              <button onClick={() => setRailOpen(true)} className="text-slate-400 hover:text-[#27aae1]" title="Expand packages">
                <PanelLeftOpen className="h-4 w-4" />
              </button>
              <Layers className="h-4 w-4 text-slate-300" />
            </div>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{pkg === "all" ? "All Proposals" : pkg}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                {items.length} proposals across {groups.length} package{groups.length !== 1 ? "s" : ""}
                {currentPkg && <span className="text-slate-400"> · live package has {(currentPkg.items || []).length} items</span>}
              </p>
            </div>

            {/* per-package tabs */}
            {pkg !== "all" && (
              <div className="flex border-b">
                {TABS.map((t) => {
                  const Icon = t.icon; const on = tab === t.key;
                  return (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                        on ? "border-[#27aae1] font-medium text-[#1d70b8]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                      <Icon className="h-4 w-4" />{t.label}
                      {t.key === "review" && includedForPkg.length > 0 && (
                        <span className="rounded-full bg-green-100 px-1.5 text-[10px] text-green-700">{includedForPkg.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* review (also the whole view when pkg === all) */}
            {(pkg === "all" || tab === "review") && (
              <div className="space-y-4">
                <ProposalsToolbar
                  search={search} onSearch={setSearch}
                  phases={phases} phase={phase} onPhase={setPhase}
                  rows={perPage} onRows={setPerPage}
                />
                <ProposalsTable
                  rows={filtered} page={page} perPage={perPage} onPage={setPage}
                  showPackage={pkg === "all"} onOpen={(p) => setReviewKey(p._key)}
                />
              </div>
            )}

            {pkg !== "all" && tab === "revise" && (
              <RevisePanel
                existing={!!currentPkg} pkgName={pkg}
                name={reviseName} onName={setReviseName}
                fund={reviseFund} onFund={setReviseFund}
                fields={reviseFields} onField={setField} onAddField={addField} onRemoveField={removeField}
                onSave={saveRevise} saving={saving}
              />
            )}

            {pkg !== "all" && tab === "preview" && (
              <PreviewPanel fields={reviseFields} included={includedForPkg} />
            )}
          </section>
        </div>
      )}

      <ReviewSheet
        proposal={reviewProposal}
        onClose={() => setReviewKey(null)}
        onDecide={decide}
        onComment={comment}
      />
      <AdminOnly silent>
        <BulkImportAppraised
          open={bulkOpen} onClose={() => setBulkOpen(false)}
          onImport={handleImport} currentCount={items.length}
        />
      </AdminOnly>
    </div>
  );
}