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
  Package, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, Eye, Plus, X,
  UploadCloud, Link2, Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import type {
  InterventionPackage, InterventionPackagePayload, SchemaField,
} from "@/types/new/intervention-package";
import {
  getPackages, createPackage, updatePackage, deletePackage, errMsg,
} from "@/app/api/new/intervention-package";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import { BulkUploadPackages } from "./bulk";
import { LinkProposalDialog } from "./link";
import { PackageGroupedTable } from "./table";
import { AdminOnly } from "@/app/context/role";

const PAGE_SIZE = 10;
const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";




export default function InterventionPackagePage() {
  const [rows, setRows] = useState<InterventionPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
 
  const [viewing, setViewing] = useState<InterventionPackage | null>(null);
  const [editing, setEditing] = useState<InterventionPackage | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<InterventionPackage | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
 
  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getPackages());
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
    try { await deletePackage(toDelete.id); toast.success("Deleted."); await load(); }
    catch (e: any) { toast.error(errMsg(e, "Failed to delete.")); }
    setToDelete(null);
  };
 
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><Package className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Intervention packages</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} package{filtered.length !== 1 ? "s" : ""}
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
    <Plus className="h-4 w-4 mr-2" /> New package
  </Button>
</AdminOnly>
        </div>
      </div>
 
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search packages…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
 
      <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`${TH} w-10 text-center`}>#</th>
              <th className={TH}>Name</th>
              <th className={TH}>Description</th>
              <th className={`${TH} w-24 text-center`}>Fields</th>
              <th className={`${TH} w-28 text-center`}>Interventions</th>
              <th className={`${TH} w-28 text-center`}>Programs</th>
              <th className={`${TH} w-16 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No packages yet.</td></tr>
            ) : paged.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} text-center text-xs text-slate-400 font-mono`}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                <td className={TD}>
                  <button onClick={() => setViewing(p)} className="font-medium text-[#27aae1] hover:underline">{p.name}</button>
                </td>
                <td className={`${TD} text-xs text-slate-600`}><p className="line-clamp-2 max-w-80">{p.description || "—"}</p></td>
                <td className={`${TD} text-center text-xs text-slate-500`}>{p.field_schema?.length || 0}</td>
                <td className={`${TD} text-center text-xs text-slate-500`}>{p.interventions_count ?? "—"}</td>
                <td className={`${TD} text-center text-xs text-slate-500`}>{p.national_proposals_count ?? "—"}</td>
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





      <PackageGroupedTable/>
 
      {/* view */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
          <DialogHeader><DialogTitle className="text-[#27aae1]">{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div><p className="text-xs text-slate-400">Description</p><p className="text-slate-700">{viewing.description || "—"}</p></div>
              {viewing.field_schema?.length > 0 && (
                <div className="border border-slate-200">
                  <p className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Fields</p>
                  <dl className="divide-y divide-slate-100">
                    {viewing.field_schema.map((f, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 px-3 py-2">
                        <dt className="text-xs text-slate-500">{f.key}</dt>
                        <dd className="col-span-2 text-slate-700">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>




<AdminOnly silent>
  <PackageForm
    open={creating || !!editing}
    initial={editing}
    onClose={() => { setCreating(false); setEditing(null); }}
    onSaved={async () => { setCreating(false); setEditing(null); await load(); }}
  />
  <BulkUploadPackages open={bulkOpen} onClose={() => setBulkOpen(false)} onComplete={load} packages={rows} />
  <LinkProposalDialog open={linkOpen} onClose={() => setLinkOpen(false)} packages={rows} onComplete={load} />
  <DeleteDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} title="Delete package?"
    description={<><strong>{toDelete?.name}</strong> will be permanently deleted. Attached proposals are not deleted — their package link is cleared.</>}
    onConfirm={handleDelete} />
</AdminOnly>
    </div>
  );
}
 
function PackageForm({
  open, initial, onClose, onSaved,
}: {
  open: boolean;
  initial: InterventionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setFields(initial?.field_schema ?? []);
  }, [open, initial]);
 
  const setField = (i: number, patch: Partial<SchemaField>) =>
    setFields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
 
  const save = async () => {
    if (!name.trim()) { toast.error("Name is required."); return; }
    const payload: InterventionPackagePayload = {
      name: name.trim(),
      description: description.trim(),
      field_schema: fields.filter((f) => f.key.trim()).map((f) => ({ key: f.key.trim(), value: f.value })),
    };
    setSaving(true);
    try {
      if (initial) { await updatePackage(initial.id, payload); toast.success("Updated."); }
      else { await createPackage(payload); toast.success("Created."); }
      onSaved();
    } catch (e: any) { toast.error(errMsg(e, "Failed to save.")); }
    finally { setSaving(false); }
  };
 
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader><DialogTitle>{initial ? "Edit package" : "New package"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oncology" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Description</label>
            <textarea className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm" rows={3}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
 
          <div className="border border-slate-200">
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Custom fields</p>
              <Button variant="ghost" size="sm" className="h-7" onClick={() => setFields((f) => [...f, { key: "", value: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {fields.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-400">No custom fields.</p>
              ) : fields.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2">
                  <Input className="h-8 max-w-[200px]" placeholder="key" value={f.key} onChange={(e) => setField(i, { key: e.target.value })} />
                  <Input className="h-8 flex-1" placeholder="value" value={f.value} onChange={(e) => setField(i, { value: e.target.value })} />
                  <button onClick={() => setFields((arr) => arr.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
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