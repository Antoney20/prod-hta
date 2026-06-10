"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, RefreshCw, Upload, ChevronLeft, ChevronRight, Layers, FileStack, ArrowUpRight,
} from "lucide-react";
import { toast } from "react-toastify";

import { getPrograms, getProposals, createProposal } from "@/app/api/new/programs";
import { NationalProgram, ProgramProposal, ProgramProposalPayload } from "@/types/new/program";
import { htmlToText } from "@/components/shared/text";

import { ProposalForm } from "../cc/proposal";
import { ProgramSelect } from "../files/programs";
import Link from "next/link";

const GROUPS_PER_PAGE = 4;   // programs per page
const ROWS_PREVIEW = 5;      // rows shown per group before "view all"
const TH = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-2.5 align-top";

function cellValue(v: unknown): string {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return htmlToText(String(v)) || "—";
}

export default function EvidenceListPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<NationalProgram[]>([]);
  const [proposals, setProposals] = useState<ProgramProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formProgram, setFormProgram] = useState<NationalProgram | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [progs, props] = await Promise.all([getPrograms(), getProposals()]);
    setPrograms(progs);
    setProposals(props);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filterProgram]);

  // text-filter proposals first
  const filteredProposals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proposals.filter((p) => {
      if (filterProgram && String(p.program) !== String(filterProgram)) return false;
      if (!q) return true;
      return p.title?.toLowerCase().includes(q) || p.reference_number?.toLowerCase().includes(q);
    });
  }, [proposals, search, filterProgram]);

  // group by program
  const byProgram = useMemo(() => {
    const map = new Map<number, ProgramProposal[]>();
    for (const p of filteredProposals) {
      if (!map.has(p.program)) map.set(p.program, []);
      map.get(p.program)!.push(p);
    }
    return map;
  }, [filteredProposals]);

  // programs to display: when filtering to one, always show it; otherwise only those with matches
  const visiblePrograms = useMemo(() => {
    const base = filterProgram
      ? programs.filter((p) => String(p.id) === String(filterProgram))
      : programs;
    return base.filter((p) => filterProgram || (byProgram.get(p.id)?.length ?? 0) > 0);
  }, [programs, filterProgram, byProgram]);

  const totalPages = Math.max(1, Math.ceil(visiblePrograms.length / GROUPS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedPrograms = useMemo(
    () => visiblePrograms.slice((safePage - 1) * GROUPS_PER_PAGE, safePage * GROUPS_PER_PAGE),
    [visiblePrograms, safePage],
  );

  const openUpload = (program: NationalProgram) => { setFormProgram(program); setFormOpen(true); };

  const handleSubmit = async (payload: ProgramProposalPayload) => {
    setSubmitting(true);
    const res = await createProposal(payload);
    if ("error" in res && res.error) toast.error(res.error);
    else { toast.success("Evidence submitted."); setFormOpen(false); await load(); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg">
            <FileStack className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">National Programs Intervention Proposals</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProposals.length} proposal{filteredProposals.length !== 1 ? "s" : ""} across {visiblePrograms.length} program{visiblePrograms.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <ProgramSelect
          programs={programs}
          value={filterProgram}
          onChange={(id) => setFilterProgram(id)}
          placeholder="All programs"
        />
        {filterProgram && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setFilterProgram(undefined)}>
            Clear program
          </Button>
        )}
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search title or ref no…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Groups */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : pagedPrograms.length === 0 ? (
        <div className="border border-dashed border-slate-300 py-20 text-center">
          <Layers className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No evidence found</p>
          <p className="text-xs text-slate-400 mt-1">Adjust the program filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pagedPrograms.map((program) => {
            const rows = byProgram.get(program.id) ?? [];
            const cols = program.field_schema ?? [];
            const preview = rows.slice(0, ROWS_PREVIEW);

            return (
              <section key={program.id} className="border border-slate-200 bg-white">
                {/* Group header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-1 rounded">{program.code}</span>
                    <span className="font-semibold text-slate-800">{program.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {rows.length} proposal{rows.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="h-8 text-xs"
                      onClick={() => router.push(`/portal/national-programs/${program.id}`)}
                    >
                      View all <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs text-white"
                      style={{ backgroundColor: "#27aae1" }}
                      onClick={() => openUpload(program)}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Evidence
                    </Button>
                  </div>
                </div>

                {/* Group table — columns are dynamic per program */}
                {rows.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No evidence yet.{" "}
                    <button className="text-[#27aae1] underline underline-offset-2" onClick={() => openUpload(program)}>
                      Upload the first.
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200">
                        <tr>
                          <th className={`${TH} w-32`}>Ref No.</th>
                          <th className={`${TH} min-w-48`}>Title</th>
                          {cols.map((c) => <th key={c.key} className={`${TH} min-w-40`}>{c.label}</th>)}
                          <th className={`${TH} w-28`}>Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                            // onClick={() => router.push(`/portal/national-programs/${program.id}`)}
                          >
                            <td className={TD}>
                              <Link href={`/portal/interventions/${p.id}`} className="font-mono text-xs bg-slate-100 text-[#27aae1] px-2 py-1 rounded whitespace-nowrap hover:underline">{p.reference_number}</Link>
                            </td>
                            <td className={`${TD} font-medium text-slate-800`}>
                              <p className="line-clamp-2 max-w-md">{p.title}</p>
                            </td>
                            {cols.map((c) => (
                              <td key={c.key} className={`${TD} text-xs text-slate-600`}>
                                <p className="line-clamp-2 max-w-60">{cellValue((p.data as any)?.[c.key])}</p>
                              </td>
                            ))}
                            <td className={`${TD} text-xs text-slate-600 whitespace-nowrap`}>
                              {p.submitted_date ? new Date(p.submitted_date).toLocaleDateString("en-GB") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rows.length > ROWS_PREVIEW && (
                  <div className="border-t border-slate-100 px-4 py-2 text-right">
                    <button
                      onClick={() => router.push(`/portal/national-programs/${program.id}`)}
                      className="text-xs font-medium text-[#27aae1] hover:underline"
                    >
                      View all {rows.length} →
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Group pagination */}
      {visiblePrograms.length > GROUPS_PER_PAGE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Programs {(safePage - 1) * GROUPS_PER_PAGE + 1}–{Math.min(safePage * GROUPS_PER_PAGE, visiblePrograms.length)} of {visiblePrograms.length}
          </span>
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
      )}

      <ProposalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        program={formProgram}
        isSubmitting={submitting}
      />
    </div>
  );
}