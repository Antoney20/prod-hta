"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload, UploadCloud, RefreshCw, Search, MoreHorizontal, Pencil, Trash2,
  ArrowLeft, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getPrograms, getProposals, createProposal, updateProposal, deleteProposal,
} from "@/app/api/new/programs";
import { NationalProgram, ProgramProposal, ProgramProposalPayload } from "@/types/new/program";
import { htmlToText } from "@/components/shared/text";
import { DeleteDialog } from "../cc/delete";
import { ProposalForm } from "../cc/proposal";
import { ProgramSelect } from "../files/programs";
import { BulkUpload } from "../files/upload";
import Link from "next/link";


const PAGE_SIZE = 10;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

function cellValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return htmlToText(String(value)) || "—";
}

export default function ProgramProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = (params?.id as string) || undefined;

  const [programs, setPrograms] = useState<NationalProgram[]>([]);
  const [programId, setProgramId] = useState<string | undefined>(routeId);
  const [proposals, setProposals] = useState<ProgramProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramProposal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<ProgramProposal | null>(null);

  // full program objects (incl. field_schema) power both the selector and the columns
  const program = useMemo(
    () => programs.find((p) => String(p.id) === String(programId)) ?? null,
    [programs, programId],
  );

  const loadPrograms = useCallback(async () => {
    setPrograms(await getPrograms());
  }, []);

  const loadProposals = useCallback(async () => {
    if (!programId) { setProposals([]); return; }
    setLoading(true);
    setProposals(await getProposals(programId));
    setLoading(false);
  }, [programId]);

  useEffect(() => { loadPrograms(); }, [loadPrograms]);
  useEffect(() => { loadProposals(); setPage(1); }, [loadProposals]);

  const columns = useMemo(() => (program?.field_schema ?? []).slice(0, 4), [program]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.reference_number?.toLowerCase().includes(q),
    );
  }, [proposals, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: ProgramProposal) => { setEditing(p); setFormOpen(true); };

  const handleSubmit = async (payload: ProgramProposalPayload) => {
    setSubmitting(true);
    const res = editing ? await updateProposal(editing.id, payload) : await createProposal(payload);
    if ("error" in res && res.error) toast.error(res.error);
    else {
      toast.success(editing ? "Evidence updated." : "Evidence submitted.");
      setFormOpen(false);
      await loadProposals();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { ok, error } = await deleteProposal(toDelete.id);
    if (ok) { toast.success("Deleted."); await loadProposals(); }
    else toast.error(error ?? "Failed to delete.");
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {routeId && (
            <button onClick={() => router.push("/portal/national-programs")} className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="bg-[#27aae1]/10 p-2 rounded-lg">
            <Layers className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Program Evidence</h1>
            <p className="text-sm text-muted-foreground">
              {program ? <>{program.name} · {filtered.length} proposal{filtered.length !== 1 ? "s" : ""}</> : "Select a program to begin."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProgramSelect programs={programs} value={programId} onChange={setProgramId} />
          <Button variant="outline" size="icon" onClick={loadProposals} disabled={loading || !programId}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)} disabled={!program}>
            <UploadCloud className="h-4 w-4 mr-2" /> Bulk Import
          </Button>
          <Button onClick={openCreate} disabled={!program} style={{ backgroundColor: "#27aae1" }} className="text-white">
            <Upload className="h-4 w-4 mr-2" /> Upload Evidence
          </Button>
        </div>
      </div>

      {/* No program selected */}
      {!program ? (
        <div className="border border-dashed border-slate-300 py-20 text-center">
          <Layers className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">Choose a national program</p>
          <p className="text-xs text-slate-400 mt-1">Use the selector above to view and manage its evidence.</p>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="relative max-w-sm ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title or ref no…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`${TH} w-10 text-center`}>#</th>
                  <th className={`${TH} w-36`}>Ref No.</th>
                  <th className={`${TH} min-w-50`}>Title</th>
                  {columns.map((c) => <th key={c.key} className={`${TH} min-w-40`}>{c.label}</th>)}
                  <th className={`${TH} w-28`}>Submitted</th>
                  <th className={`${TH} w-16 text-right`} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5 + columns.length} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={5 + columns.length} className="py-16 text-center text-slate-400 text-sm">No proposals found.</td></tr>
                ) : (
                  paged.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                      {/* <td className={TD}>
                        <span className="font-mono text-xs bg-slate-100 text-[#27aae1] px-2 py-1 rounded whitespace-nowrap">{p.reference_number}</span>
                      </td> */}
                         <td className={TD}>
                              <Link href={`/portal/interventions/${program.id}`} className="font-mono text-xs bg-slate-100 text-[#27aae1] px-2 py-1 rounded whitespace-nowrap hover:underline">{p.reference_number}</Link>
                            </td>
                      <td className={`${TD} font-medium text-slate-800`}>
                        <p className="line-clamp-2 max-w-md">{p.title}</p>
                      </td>
                      {columns.map((c) => (
                        <td key={c.key} className={`${TD} text-xs text-slate-600`}>
                          <p className="line-clamp-2 max-w-60">{cellValue((p.data as any)?.[c.key])}</p>
                        </td>
                      ))}
                      <td className={`${TD} text-xs text-slate-600 whitespace-nowrap`}>
                        {p.submitted_date ? new Date(p.submitted_date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className={`${TD} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(p)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(p)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
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
        </>
      )}

      <ProposalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        program={program}
        defaultValues={editing}
        isSubmitting={submitting}
      />

      <BulkUpload
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        program={program}
        onComplete={loadProposals}
      />

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete proposal?"
        description={<><strong>{toDelete?.title}</strong> ({toDelete?.reference_number}) will be permanently deleted.</>}
        onConfirm={handleDelete}
      />
    </div>
  );
}