"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Search, RefreshCw, ClipboardList, Download, ChevronLeft, ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EvidenceTarget } from "@/types/new/decision-template";

import TargetsTable from "./table";
import { exportGrid } from "./handler";
import { generatePayload } from "@/app/api/new/panel/template";
import { buildColumns } from "./cols";

type KindFilter = "all" | EvidenceTarget["kind"];
const FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "intervention", label: "Interventions" },
  { key: "national_proposal", label: "Programs" },
];
const PAGE_SIZES = [20, 30, 50, 100];

export default function DecisionTemplatesPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<EvidenceTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTargets(await generatePayload());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (!q) return true;
      return (
        (t.reference_number ?? "").toLowerCase().includes(q) ||
        (t.name ?? "").toLowerCase().includes(q) ||
        (t.package ?? "").toLowerCase().includes(q)
      );
    });
  }, [targets, search, kind]);

  const columns = useMemo(() => buildColumns(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => { setPage(1); }, [search, kind, pageSize]);

  const open = (t: EvidenceTarget) =>
    router.push(`/portal/panel/evidence/coverage/${t.id}`);

  const download = async () => {
    if (!filtered.length) return toast.info("Nothing to export.");
    try {
      await exportGrid(filtered, columns);
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    }
  };

  return (
    <div className="space-y-6 ">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><ClipboardList className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Appraisal Template</h1>
            <p className="text-sm text-slate-500 max-w-2xl">Evidence template - this will guide how the intervention is assigned its scores. The data is all evidence generated for each intervention across every criterion. It updates auto based on evidence data changes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={download} disabled={loading || !filtered.length}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search ref, name or package…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setShowAll((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              showAll ? "border-[#27aae1] bg-[#27aae1] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
            }`}>
            {showAll ? "All fields" : "Important only"}
          </button>
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setKind(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                kind === f.key
                  ? "border-[#27aae1] bg-[#27aae1] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#27aae1]"
              }`}>
              {f.label}
            </button>
            
          ))}
        </div>
      </div>

<TargetsTable rows={paged} columns={columns} loading={loading} showAll={showAll} onOpen={open} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <span>Rows per page</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700">
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-2">
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-slate-600">Page {safePage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}