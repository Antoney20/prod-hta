"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Layers3, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, Eye, Plus,
  UploadCloud, Link2, Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import type { InterventionPhase, InterventionPhasePayload } from "@/types/new/intervention-phase";
import {
  getPhases, createPhase, updatePhase, deletePhase, errMsg,
} from "@/app/api/new/intervention-phase";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";

import { AdminOnly } from "@/app/context/role";
import { BulkUploadPhases } from "./bulk";
import { LinkPhaseDialog } from "./link";
import { PhaseGroupedTable } from "./table";

const PAGE_SIZE = 10;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

export default function InterventionPhasePage() {
  const [rows, setRows] = useState<InterventionPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<InterventionPhase | null>(null);
  const [editing, setEditing] = useState<InterventionPhase | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<InterventionPhase | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getPhases());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try { await deletePhase(toDelete.id); toast.success("Deleted."); await load(); }
    catch (e: any) { toast.error(errMsg(e, "Failed to delete.")); }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><Layers3 className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Assign/group intervention by phase</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} phase{filtered.length !== 1 ? "s" : ""} —  Helps track, organize, group,  and manage interventions and national programs during the topic prioritization, the review process up to the final decision.  ie. the first batch iss batch 001, which has all interventions up to mid may 2026.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AdminOnly silent>
            <Button variant="outline" onClick={() => setLinkOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" /> Link proposal
            </Button>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <UploadCloud className="h-4 w-4 mr-2" /> Bulk link
            </Button>
            <Button onClick={() => setCreating(true)} style={{ backgroundColor: "#27aae1" }} className="text-white">
              <Plus className="h-4 w-4 mr-2" /> New phase
            </Button>
          </AdminOnly>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search phases…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`${TH} w-10 text-center`}>#</th>
              <th className={TH}>Name</th>
              <th className={TH}>Description</th>
              <th className={`${TH} w-20 text-center`}>Order</th>
              <th className={`${TH} w-24 text-center`}>Active</th>
              <th className={`${TH} w-16 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No phases yet.</td></tr>
            ) : paged.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                <td className={TD}>
                  <button onClick={() => setViewing(p)} className="font-medium text-[#27aae1] hover:underline">{p.name}</button>
                </td>
                <td className={`${TD} text-xs text-slate-600`}><p className="line-clamp-2 max-w-80">{p.description || "—"}</p></td>
                <td className={`${TD} text-center text-xs text-slate-500 font-mono`}>{p.order}</td>
                <td className={`${TD} text-center`}>
                  {p.is_active
                    ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Active</span>
                    : <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">Inactive</span>}
                </td>
                <td className={`${TD} text-right`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewing(p)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                      <AdminOnly silent>
                        <DropdownMenuItem onClick={() => setEditing(p)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </AdminOnly>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PhaseGroupedTable />

      {/* view */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
          <DialogHeader><DialogTitle className="text-[#27aae1]">{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div><p className="text-xs text-slate-400">Description</p><p className="text-slate-700">{viewing.description || "—"}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400">Order</p><p className="text-slate-700">{viewing.order}</p></div>
                <div><p className="text-xs text-slate-400">Status</p><p className="text-slate-700">{viewing.is_active ? "Active" : "Inactive"}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminOnly silent>
        <PhaseForm
          open={creating || !!editing}
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={async () => { setCreating(false); setEditing(null); await load(); }}
        />
        <BulkUploadPhases open={bulkOpen} onClose={() => setBulkOpen(false)} onComplete={load} phases={rows} />
        <LinkPhaseDialog open={linkOpen} onClose={() => setLinkOpen(false)} phases={rows} onComplete={load} />
        <DeleteDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} title="Delete phase?"
          description={<><strong>{toDelete?.name}</strong> will be permanently deleted. Attached proposals are not deleted — their phase link is cleared.</>}
          onConfirm={handleDelete} />
      </AdminOnly>
    </div>
  );
}

function PhaseForm({
  open, initial, onClose, onSaved,
}: {
  open: boolean;
  initial: InterventionPhase | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setOrder(initial?.order ?? 0);
    setIsActive(initial?.is_active ?? false);
  }, [open, initial]);

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required."); return; }
    const payload: InterventionPhasePayload = {
      name: name.trim(),
      description: description.trim(),
      order: Number.isFinite(order) ? order : 0,
      is_active: isActive,
    };
    setSaving(true);
    try {
      if (initial) { await updatePhase(initial.id, payload); toast.success("Updated."); }
      else { await createPhase(payload); toast.success("Created."); }
      onSaved();
    } catch (e: any) { toast.error(errMsg(e, "Failed to save.")); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader><DialogTitle>{initial ? "Edit phase" : "New phase (batch)"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Batch 001" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Description</label>
            <textarea className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm" rows={3}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Order</label>
              <Input type="number" min={0} className="mt-1" value={order}
                onChange={(e) => setOrder(e.target.value === "" ? 0 : Number(e.target.value))} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#27aae1]" />
                Active phase
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={saving} style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={save}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {initial ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}