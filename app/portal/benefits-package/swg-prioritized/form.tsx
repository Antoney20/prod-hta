"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { slug } from "@/app/portal/benefits-package/_lib/swg-excel";
import { DEFAULT_SWG_SECTIONS, type SwgRow, type SwgSection } from "@/types/panel/benefits-package";

const CORE = ["ref", "intervention", "package", "hta_type", "justification", "next_steps", "_key"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (topic: SwgRow) => void;
  defaultValues?: SwgRow;
  presetTrack?: string;
  tracks?: SwgSection[];
  isSubmitting?: boolean;
}

type Field = { key: string; value: string };

const toExtras = (data?: SwgRow): Field[] => {
  const e = data
    ? Object.entries(data)
        .filter(([k]) => !CORE.includes(k))
        .map(([key, value]) => ({ key, value: typeof value === "string" ? value : JSON.stringify(value) }))
    : [];
  return e.length ? e : [];
};

export function SwgTopicForm({
  open, onClose, onSubmit, defaultValues, presetTrack, tracks, isSubmitting,
}: Props) {
  const secs = tracks?.length ? tracks : DEFAULT_SWG_SECTIONS;
  const [ref, setRef] = useState("");
  const [intervention, setIntervention] = useState("");
  const [pkg, setPkg] = useState("");
  const [track, setTrack] = useState("");
  const [justification, setJustification] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [extras, setExtras] = useState<Field[]>([]);

  useEffect(() => {
    if (!open) return;
    const d = defaultValues;
    setRef((d?.ref as string) ?? "");
    setIntervention((d?.intervention as string) ?? "");
    setPkg((d?.package as string) ?? "");
    setTrack((d?.hta_type as string) ?? presetTrack ?? secs[0]?.key ?? "");
    setJustification((d?.justification as string) ?? "");
    setNextSteps((d?.next_steps as string) ?? "");
    setExtras(toExtras(d));
  }, [open, defaultValues, presetTrack]); // eslint-disable-line

  const setExtra = (i: number, patch: Partial<Field>) =>
    setExtras((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addExtra = () => setExtras((f) => [...f, { key: "", value: "" }]);
  const removeExtra = (i: number) => setExtras((f) => f.filter((_, idx) => idx !== i));

  const submit = () => {
    const topic: SwgRow = {
      ref: ref.trim(),
      intervention: intervention.trim(),
      package: pkg.trim(),
      hta_type: track,
      justification,
      next_steps: nextSteps,
    };
    extras.forEach(({ key, value }) => { if (key.trim()) topic[slug(key)] = value; });
    onSubmit(topic);
  };

  const lbl = "text-[10px] font-semibold uppercase tracking-wide text-slate-400";
  const area =
    "min-w-0 flex-1 border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit topic" : "Add topic"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={lbl}>Ref</span>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="INTERV-2026-03-23-0005" className="font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={lbl}>HTA Track</span>
              <select value={track} onChange={(e) => setTrack(e.target.value)}
                className="h-9 border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
                {secs.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className={lbl}>Proposed Intervention *</span>
            <Input value={intervention} onChange={(e) => setIntervention(e.target.value)} placeholder="Craniosynostosis repair / release suturectomy" />
          </label>

          <label className="flex flex-col gap-1">
            <span className={lbl}>Benefit Package</span>
            <Input value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="Surgical Services Package" />
          </label>

          <label className="flex flex-col gap-1">
            <span className={lbl}>Justification</span>
            <textarea className={area} rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={lbl}>Proposed Next Steps</span>
            <textarea className={area} rows={2} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="Rapid Assessment for Costing" />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={lbl}>Additional fields</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addExtra}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add field
              </Button>
            </div>
            {extras.map((row, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input className="w-40 shrink-0 font-mono text-xs" placeholder="service_type"
                  value={row.key} onChange={(e) => setExtra(i, { key: e.target.value })} />
                <textarea className={area} rows={1} placeholder="value"
                  value={row.value} onChange={(e) => setExtra(i, { value: e.target.value })} />
                <button className="mt-1 text-slate-400 hover:text-red-600" onClick={() => removeExtra(i)} title="Remove field">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={submit} disabled={isSubmitting || !intervention.trim()}
            style={{ backgroundColor: "#27aae1" }} className="text-white">
            {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {defaultValues ? "Save changes" : "Add topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}