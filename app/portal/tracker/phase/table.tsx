"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  RefreshCw, ChevronDown, ChevronRight, Link2Off, Layers3, Search,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { GroupedPhase, GroupedPhaseMember } from "@/types/new/intervention-phase";
import { getGroupedPhases, unlinkProposal, errMsg } from "@/app/api/new/intervention-phase";
import { AdminOnly } from "@/app/context/role";
import { DeleteDialog } from "../../national-programs/cc/delete";

const PAGE_SIZES = [30, 50, 100];

export function PhaseGroupedTable() {
  const [phases, setPhases] = useState<GroupedPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [toUnlink, setToUnlink] = useState<{ phaseId: number; member: GroupedPhaseMember } | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getGroupedPhases();
    setPhases(data);
    setOpen(new Set(data.map((p) => p.id)));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const unlink = async () => {
    if (!toUnlink) return;
    const { phaseId, member } = toUnlink;
    try { await unlinkProposal(phaseId, member.reference_number); toast.success(`Unlinked ${member.reference_number}.`); await load(); }
    catch (e: any) { toast.error(errMsg(e, "Failed to unlink.")); }
    setToUnlink(null);
  };

  const filteredPhases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return phases;
    return phases
      .map((phase) => {
        const phaseHit = phase.name.toLowerCase().includes(q);
        const members = phaseHit
          ? phase.members
          : phase.members.filter((m) =>
              m.reference_number.toLowerCase().includes(q) ||
              (m.name ?? "").toLowerCase().includes(q) ||
              (m.package ?? "").toLowerCase().includes(q) ||
              (m.phase ?? "").toLowerCase().includes(q) ||
              m.kind.toLowerCase().includes(q),
            );
        return { ...phase, members };
      })
      .filter((phase) => phase.members.length > 0);
  }, [phases, search]);
  const totalMembers = useMemo(
    () => filteredPhases.reduce((n, p) => n + p.members.length, 0),
    [filteredPhases],
  );
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedPhases = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    const out: GroupedPhase[] = [];
    let cursor = 0;
    for (const phase of filteredPhases) {
      const memberStart = cursor;
      const memberEnd = cursor + phase.members.length;
      cursor = memberEnd;
      // does this phase overlap the current window?
      if (memberEnd <= start || memberStart >= end) continue;
      const sliceFrom = Math.max(0, start - memberStart);
      const sliceTo = Math.min(phase.members.length, end - memberStart);
      out.push({ ...phase, members: phase.members.slice(sliceFrom, sliceTo) });
    }
    return out;
  }, [filteredPhases, safePage, pageSize]);

  const total = useMemo(() => phases.reduce((n, p) => n + p.members.length, 0), [phases]);
  const searching = search.trim().length > 0;

  return (
    <div className="border border-slate-200 shadow-sm bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-[#27aae1]" />
          <span className="text-sm font-semibold">Linked proposals by phase</span>
          <span className="text-xs text-muted-foreground">
            {searching ? `${totalMembers} of ${total}` : total} linked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref, name, package, phase…"
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading…</p>
      ) : filteredPhases.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {searching ? "No proposals match your search." : "No phases yet."}
        </p>
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {pagedPhases.map((phase) => {
              const isOpen = open.has(phase.id);
              return (
                <Fragment key={phase.id}>
                  <tr className="bg-[#27aae1]/5">
                    <td className="w-8 px-3 py-2.5 align-top">
                      <button onClick={() => toggle(phase.id)} className="text-slate-400 hover:text-[#27aae1]"
                        disabled={searching}>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td colSpan={4} className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold">{phase.name}</span>
                        {phase.is_active && <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Active</span>}
                        <span className="text-xs text-muted-foreground">
                          {phase.members.length} proposal{phase.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {(isOpen || searching) && (phase.members.length === 0 ? (
                    <tr><td /><td colSpan={4} className="px-3 py-2 text-xs text-slate-400">No linked proposals.</td></tr>
                  ) : phase.members.map((m) => (
                    <tr key={`${m.kind}-${m.id}`} className="hover:bg-slate-50/70">
                      <td />
                      <td className="px-3 py-2">
                        <Link
                          href={`/portal/interventions/${m.id}`}
                          className="font-mono text-xs text-[#27aae1] hover:underline"
                        >
                          {m.reference_number}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">{m.kind}</span>
                        {m.name || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {m.package
                          ? <span>{m.package}</span>
                          : <span className="text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <AdminOnly silent>
                          <button onClick={() => setToUnlink({ phaseId: phase.id, member: m })}
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500">
                            <Link2Off className="h-3.5 w-3.5" /> Unlink
                          </button>
                        </AdminOnly>
                      </td>
                    </tr>
                  )))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalMembers > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="ml-1">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalMembers)} of {totalMembers}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7"
              disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" className="h-7"
              disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DeleteDialog
        open={!!toUnlink}
        confirmWord="Yes"
        onOpenChange={(v) => !v && setToUnlink(null)}
        title="Unlink proposal?"
        description={
          <>
            <strong className="font-mono">{toUnlink?.member.reference_number}</strong>
            {toUnlink?.member.name ? <> — {toUnlink.member.name}</> : null} will be removed from this phase.
            The proposal itself is not deleted.
          </>
        }
        onConfirm={unlink}
      />
    </div>
  );
}