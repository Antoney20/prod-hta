"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Package, Search, RefreshCw, ChevronRight, ChevronDown, FlaskConical, Layers,
  Trash2, X, Loader2,
} from "lucide-react";
import { GroupedPackage, PackageMember } from "@/types/new/intervention-package";
import {
  deletePackage, unlinkProposal, errMsg, getGroupedPackages,
} from "@/app/api/new/intervention-package";
import { toast } from "react-toastify";
import { DeleteDialog } from "../../national-programs/cc/delete";
import { PageSize, TablePagination } from "./pagenation";
import Link from "next/link";

const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-2.5 align-top";

// Delete is admin-only — server enforces it (IsAdmin on destroy).
// Replace with your role source, e.g. const isAdmin = useRole() === "admin".
const isAdmin = true;

type UnlinkTarget = { group: GroupedPackage; member: PackageMember };

/** Grouped view: each package is a group header; its linked interventions and
 *  national programs are member rows. Fetches its own data — drop in anywhere. */
export function PackageGroupedTable() {
  const [groups, setGroups] = useState<GroupedPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [toDelete, setToDelete] = useState<GroupedPackage | null>(null);
  const [toUnlink, setToUnlink] = useState<UnlinkTarget | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getGroupedPackages();
    setGroups(data);
    setOpen(Object.fromEntries(data.map((g) => [g.id, true]))); // expanded by default
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // client-side filter: match the package name OR any member ref/name; keep matching members
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => {
        if (g.name.toLowerCase().includes(q)) return g;
        const members = g.members.filter(
          (m) => m.reference_number.toLowerCase().includes(q) || (m.name ?? "").toLowerCase().includes(q),
        );
        return members.length ? { ...g, members } : null;
      })
      .filter(Boolean) as GroupedPackage[];
  }, [groups, search]);

  const toggle = (id: number) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const handleDelete = async () => {
    if (!toDelete) return;
    try { await deletePackage(toDelete.id); toast.success("Deleted."); await load(); }
    catch (e: any) { toast.error(errMsg(e, "Failed to delete.")); }
    setToDelete(null);
  };

  const handleUnlink = async () => {
    if (!toUnlink) return;
    try {
      await unlinkProposal(toUnlink.group.id, toUnlink.member.reference_number);
      toast.success(`Unlinked ${toUnlink.member.reference_number}.`);
      await load();
    } catch (e: any) {
      toast.error(errMsg(e, "Failed to unlink."));
    }
    setToUnlink(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><Layers className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
           <h2 className="text-lg font-bold">Grouped Intervention Proposals by Package</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} package{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search package, ref or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={`${TH} w-8`} />
              <th className={TH}>Reference</th>
              <th className={`${TH} w-28`}>Type</th>
              <th className={TH}>Name</th>
              <th className={`${TH} w-12 text-right`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-slate-400 text-sm">No packages yet.</td></tr>
            ) : filtered.map((g) => (
              <GroupBlock key={g.id} group={g} open={!!open[g.id]}
                onToggle={() => toggle(g.id)}
                onDelete={isAdmin ? () => setToDelete(g) : undefined}
                onUnlink={(m) => setToUnlink({ group: g, member: m })} />
            ))}
          </tbody>
        </table>
      </div>

      <DeleteDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} title="Delete package?"
        description={<><strong>{toDelete?.name}</strong> will be permanently deleted. Linked proposals are not deleted — their package link is cleared.</>}
        onConfirm={handleDelete} />

      <ConfirmYesDialog
        open={!!toUnlink}
        onOpenChange={(v) => !v && setToUnlink(null)}
        title="Unlink proposal?"
        description={toUnlink && (
          <>Remove <span className="font-mono text-xs text-[#27aae1]">{toUnlink.member.reference_number}</span> from <strong>{toUnlink.group.name}</strong>. The proposal itself isn’t deleted.</>
        )}
        onConfirm={handleUnlink}
      />
    </div>
  );
}


function GroupBlock({
  group, open, onToggle, onDelete, onUnlink, defaultPageSize = 10,
}: {
  group: GroupedPackage;
  open: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onUnlink: (m: PackageMember) => void;
  defaultPageSize?: PageSize;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);

  const total = group.members.length;
  const size = pageSize === "all" ? total || 1 : pageSize;
  const pages = Math.max(1, Math.ceil(total / size));

  useEffect(() => { if (page > pages) setPage(pages); }, [pages, page]);

  const visible = pageSize === "all"
    ? group.members
    : group.members.slice((page - 1) * size, page * size);

  return (
    <>
      <tr className="bg-slate-50/60 cursor-pointer hover:bg-slate-100/60" onClick={onToggle}>
        <td className={TD}>
          {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        </td>
        <td className={TD} colSpan={3}>
          <span className="inline-flex items-center gap-2">
            <Package className="h-4 w-4 text-[#27aae1]" />
            <span className="font-semibold text-slate-800">{group.name}</span>
            <span className="rounded bg-[#27aae1]/10 px-2 py-0.5 text-xs font-medium text-[#27aae1]">{group.members.length}</span>
          </span>
        </td>
        <td className={`${TD} text-right`}>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-slate-400 hover:text-red-500"
              aria-label={`Delete ${group.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>

      {open && total === 0 && (
        <tr><td className={TD} colSpan={5}><span className="pl-6 text-xs text-slate-400">No proposals linked.</span></td></tr>
      )}

      {open && visible.map((m) => (
        <MemberRow key={`${m.kind}-${m.id}`} m={m} onUnlink={() => onUnlink(m)} />
      ))}

      {open && total > 0 && (
        <tr className="bg-white">
          <td className={`${TD} pr-3`} colSpan={5}>
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPage={setPage}
              onPageSize={(s) => { setPageSize(s); setPage(1); }}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function MemberRow({ m, onUnlink }: { m: PackageMember; onUnlink: () => void }) {
  return (
    <tr className="group hover:bg-slate-50/70">
      <td className={TD} />
     <td className={TD}>
  <Link
    href={`/portal/interventions/${m.id}`}
    onClick={(e) => e.stopPropagation()}
    className="font-mono text-xs text-[#27aae1] hover:underline"
  >
    {m.reference_number}
  </Link>
</td>
      <td className={TD}>
        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] ${m.kind === "intervention" ? "bg-[#fe7105]/10 text-[#fe7105]" : "bg-[#1d70b8]/10 text-[#1d70b8]"}`}>
          <FlaskConical className="h-3 w-3" /> {m.kind === "intervention" ? "Intervention" : "Program"}
        </span>
      </td>
      <td className={`${TD} text-slate-600`}>{m.name || "—"}</td>
      <td className={`${TD} text-right`}>
        <button
          onClick={onUnlink}
          className="text-slate-300 hover:text-red-500 group-hover:text-slate-400"
          aria-label={`Unlink ${m.reference_number}`}
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

/* ----------------------------- typed-confirm dialog ----------------------------- */
// Requires the user to type "yes" before the action is enabled.
function ConfirmYesDialog({
  open, onOpenChange, title, description, onConfirm, confirmWord = "yes",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  confirmWord?: string;
}) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!open) { setVal(""); setBusy(false); } }, [open]);

  const ready = val.trim().toLowerCase() === confirmWord.toLowerCase();

  const confirm = async () => {
    if (!ready) return;
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md backdrop-blur-sm">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">{description}</p>
          <div>
            <label className="text-xs text-slate-500">Type <strong>{confirmWord}</strong> to confirm</label>
            <Input
              className="mt-1"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              placeholder={confirmWord}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={!ready || busy} className="bg-red-600 text-white hover:bg-red-700" onClick={confirm}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Unlink
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}