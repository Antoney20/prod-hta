"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  RefreshCw, ChevronDown, ChevronRight, Link2Off, Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroupedPhase, GroupedPhaseMember } from "@/types/new/intervention-phase";
import { getGroupedPhases, unlinkProposal, errMsg } from "@/app/api/new/intervention-phase";
import { AdminOnly } from "@/app/context/role";
import { DeleteDialog } from "../../national-programs/cc/delete";

export function PhaseGroupedTable() {
  const [phases, setPhases] = useState<GroupedPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [toUnlink, setToUnlink] = useState<{ phaseId: number; member: GroupedPhaseMember } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getGroupedPhases();
    setPhases(data);
    setOpen(new Set(data.map((p) => p.id)));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

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

  const total = useMemo(() => phases.reduce((n, p) => n + p.members.length, 0), [phases]);

  return (
    <div className="border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-[#27aae1]" />
          <span className="text-sm font-semibold">Linked proposals by phase</span>
          <span className="text-xs text-muted-foreground">{total} linked</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading…</p>
      ) : phases.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No phases yet.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {phases.map((phase) => {
              const isOpen = open.has(phase.id);
              return (
                <Fragment key={phase.id}>
                  <tr className="bg-[#27aae1]/5">
                    <td className="w-8 px-3 py-2.5 align-top">
                      <button onClick={() => toggle(phase.id)} className="text-slate-400 hover:text-[#27aae1]">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td colSpan={3} className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold">{phase.name}</span>
                        {phase.is_active && <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Active</span>}
                        <span className="text-xs text-muted-foreground">
                          {phase.members.length} proposal{phase.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (phase.members.length === 0 ? (
                    <tr><td /><td colSpan={3} className="px-3 py-2 text-xs text-slate-400">No linked proposals.</td></tr>
                  ) : phase.members.map((m) => (
                    <tr key={`${m.kind}-${m.id}`} className="hover:bg-slate-50/70">
                      <td />
                      <td className="px-3 py-2 font-mono text-xs text-[#27aae1]">{m.reference_number}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">{m.kind}</span>
                        {m.name || "—"}
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
<DeleteDialog
        open={!!toUnlink}
          confirmWord = "Yes"
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