"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, FileStack, Layers,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getPrograms, createProgram, updateProgram, deleteProgram,
} from "@/app/api/new/programs";
import { NationalProgram, NationalProgramPayload } from "@/types/new/program";
import { DeleteDialog } from "./cc/delete";
import { ProgramForm } from "./cc/form";

const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-middle";

export default function NationalProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<NationalProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NationalProgram | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<NationalProgram | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setPrograms(await getPrograms());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      if (activeOnly && !p.is_active) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });
  }, [programs, search, activeOnly]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: NationalProgram) => { setEditing(p); setFormOpen(true); };

  const handleSubmit = async (payload: NationalProgramPayload) => {
    setSubmitting(true);
    const res = editing
      ? await updateProgram(editing.id, payload)
      : await createProgram(payload);
    if ("error" in res && res.error) toast.error(res.error);
    else {
      toast.success(editing ? "Program updated." : "Program created.");
      setFormOpen(false);
      await load();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { ok, error } = await deleteProgram(toDelete.id);
    if (ok) { toast.success("Program deleted."); await load(); }
    else toast.error(error ?? "Failed to delete.");
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg">
            <Layers className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">National Programs</h1>
            <p className="text-sm text-muted-foreground">Create programs and manage their evidence.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate} style={{ backgroundColor: "#27aae1" }} className="text-white">
            <Plus className="h-4 w-4 mr-2" /> New Program
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          Active only
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`${TH} w-10 text-center`}>#</th>
              <th className={`${TH} w-32`}>Code</th>
              <th className={`${TH} min-w-60`}>Name</th>
              <th className={`${TH} w-20 text-center`}>Fields</th>
              <th className={`${TH} w-24`}>Status</th>
              <th className={`${TH} w-48`}>Reference Template</th>
              <th className={`${TH} w-20 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No programs found.</td></tr>
            ) : (
              filtered.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>{i + 1}</td>
                  <td className={TD}><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{p.code}</span></td>
                  <td className={`${TD} font-medium text-slate-800`}>{p.name}</td>
                  <td className={`${TD} text-center text-slate-600`}>{p.field_schema?.length ?? 0}</td>
                  <td className={TD}>
                    <Badge className={`text-xs px-2 py-0 rounded-full border-0 ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className={`${TD} font-mono text-xs text-slate-500`}>{p.reference_template ?? `INTERV-${p.code}`}</td>
                  <td className={`${TD} text-right`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/portal/national-programs/${p.id}`)}>
                          <FileStack className="h-4 w-4 mr-2" /> Evidence
                        </DropdownMenuItem>
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

      <ProgramForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={editing}
        isSubmitting={submitting}
      />

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete program?"
        description={<><strong>{toDelete?.name}</strong> and all of its proposals will be permanently removed.</>}
        onConfirm={handleDelete}
      />
    </div>
  );
}