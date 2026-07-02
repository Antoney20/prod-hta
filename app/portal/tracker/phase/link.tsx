"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Link2, Check } from "lucide-react";
import { toast } from "react-toastify";

import type { InterventionPhase } from "@/types/new/intervention-phase";
import type { EvidenceInterventionRef } from "@/types/new/assessment";
import type { ProgramProposal } from "@/types/new/program";
import { linkOne, errMsg } from "@/app/api/new/intervention-phase";
import {
  filterInterventions, filterPrograms, getInterventions, getNationalPrograms,
} from "@/app/api/new/search";

type Source = "intervention" | "program";
type Picked = { kind: Source; id: string | number; ref: string; label: string } | null;

export function LinkPhaseDialog({
  open, onClose, phases, onComplete,
}: {
  open: boolean;
  onClose: () => void;
  phases: InterventionPhase[];
  onComplete: () => void;
}) {
  const [source, setSource] = useState<Source>("intervention");
  const [interventions, setInterventions] = useState<EvidenceInterventionRef[]>([]);
  const [programs, setPrograms] = useState<ProgramProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Picked>(null);
  const [phaseId, setPhaseId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [ivs, pgs] = await Promise.all([getInterventions(), getNationalPrograms()]);
    setInterventions(ivs); setPrograms(pgs); setLoading(false);
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);
  useEffect(() => { if (!open) { setPicked(null); setSearch(""); setPhaseId(""); } }, [open]);

  const results = useMemo(() => {
    if (source === "intervention") {
      return filterInterventions(interventions, search).slice(0, 50)
        .map((i) => ({ kind: "intervention" as const, id: i.id, ref: i.reference_number, label: i.intervention_name ?? "" }));
    }
    return filterPrograms(programs, search).slice(0, 50)
      .map((p) => ({ kind: "program" as const, id: p.id, ref: p.reference_number, label: p.title ?? "" }));
  }, [source, interventions, programs, search]);

  const attach = async () => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!picked || !phase) { toast.error("Pick a proposal and a phase."); return; }
    setSubmitting(true);
    try {
      const res = await linkOne(phase.name, picked.ref);
      if (res.attached.length) {
        toast.success(`Linked ${picked.ref} to ${phase.name}.`);
        onComplete(); onClose();
      } else {
        toast.error(res.errors[0]?.error ?? "Could not link.");
      }
    } catch (e: any) {
      toast.error(errMsg(e, "Failed to link."));
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-[#27aae1]" /> Link to a phase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="inline-flex border border-slate-200 text-sm">
            {(["intervention", "program"] as Source[]).map((s) => (
              <button key={s} onClick={() => { setSource(s); setPicked(null); }}
                className={`px-3 py-1.5 ${source === s ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {s === "intervention" ? "Intervention" : "National program"}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reference or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="max-h-56 overflow-y-auto border border-slate-200 divide-y divide-slate-100">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No matches.</p>
            ) : results.map((r) => {
              const active = picked?.kind === r.kind && picked?.id === r.id;
              return (
                <button key={`${r.kind}-${r.id}`} onClick={() => setPicked(r)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${active ? "bg-[#27aae1]/5" : ""}`}>
                  <span>
                    <span className="font-mono text-xs text-[#27aae1]">{r.ref}</span>
                    {r.label && <span className="ml-2 text-slate-600">{r.label}</span>}
                  </span>
                  {active && <Check className="h-4 w-4 text-[#27aae1]" />}
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs text-slate-500">Phase</label>
            <select value={phaseId} onChange={(e) => setPhaseId(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 h-9 w-full border border-slate-200 px-2 text-sm">
              <option value="">Select a phase…</option>
              {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!picked || phaseId === "" || submitting}
              style={{ backgroundColor: "#27aae1" }} className="text-white" onClick={attach}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
              Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}