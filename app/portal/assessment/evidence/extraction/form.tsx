"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown, ChevronRight, Search, X, Layers, Check, Loader2, Save,
} from "lucide-react";
import { toast } from "react-toastify";

import { EvidenceCriterion, EvidenceExtraction, EvidenceExtractionPayload } from "@/types/new/evidence-extraction";
import { EvidenceInterventionRef } from "@/types/new/assessment";
import { ProgramProposal } from "@/types/new/program";
import {
  getInterventions, getNationalPrograms, filterInterventions, filterPrograms,
} from "@/app/api/new/search";

type LinkKind = "intervention" | "program";
interface Link { kind: LinkKind; id: number | string; label: string; }

interface Props {
  criteria: EvidenceCriterion[];
  defaultValues?: EvidenceExtraction | null;
  isSubmitting?: boolean;
  onSubmit: (payload: EvidenceExtractionPayload) => void;
  onCancel: () => void;
}

const ROUTING = [
  { key: "icd_11", label: "ICD-11", area: false },
  { key: "routing_decision", label: "Routing / Decision", area: true },
  { key: "disease_definition", label: "Definition of disease", area: true },
] as const;

const card = "border border-slate-200 bg-white";

/* -------- reference picker (reuses the in-memory search helpers) -------- */
function RefPicker({ value, onChange }: { value: Link | null; onChange: (l: Link | null) => void }) {
  const [kind, setKind] = useState<LinkKind>(value?.kind ?? "intervention");
  const [interventions, setInterventions] = useState<EvidenceInterventionRef[]>([]);
  const [programs, setPrograms] = useState<ProgramProposal[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getInterventions().then(setInterventions);
    getNationalPrograms().then(setPrograms);
  }, []);

  const results = useMemo(() => {
    if (kind === "intervention")
      return filterInterventions(interventions, q).slice(0, 30)
        .map((i) => ({ id: i.id, label: `${i.reference_number} — ${i.intervention_name ?? "Untitled"}` }));
    return filterPrograms(programs, q).slice(0, 30)
      .map((p) => ({ id: p.id, label: `${p.reference_number} — ${p.title}` }));
  }, [kind, q, interventions, programs]);

  return (
    <div className={`${card} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Linked to</p>
        <div className="inline-flex overflow-hidden border border-slate-200 text-xs">
          {(["intervention", "program"] as LinkKind[]).map((k) => (
            <button key={k} type="button" onClick={() => { setKind(k); setOpen(true); }}
              className={`px-3 py-1.5 capitalize ${kind === k ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
              style={kind === k ? { backgroundColor: "#27aae1" } : undefined}>
              {k === "program" ? "National program" : "Intervention"}
            </button>
          ))}
        </div>
      </div>

      {value ? (
        <div className="flex items-center justify-between border border-[#27aae1]/30 bg-[#27aae1]/5 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 text-slate-700"><Check className="h-4 w-4 text-[#27aae1]" />{value.label}</span>
          <button type="button" onClick={() => { onChange(null); setOpen(true); }} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={`Search ${kind === "program" ? "program proposals" : "interventions"} by ref or name…`}
            value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
          {open && q && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto border border-slate-200 bg-white shadow-lg">
              {results.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-400">No matches.</p>
              ) : results.map((r) => (
                <button key={String(r.id)} type="button"
                  onClick={() => { onChange({ kind, id: r.id, label: r.label }); setOpen(false); setQ(""); }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">{r.label}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExtractionForm({ criteria, defaultValues, isSubmitting, onSubmit, onCancel }: Props) {
  const initialLink: Link | null = defaultValues?.intervention_proposal != null
    ? { kind: "intervention", id: defaultValues.intervention_proposal, label: defaultValues.proposal_reference ?? "Intervention" }
    : defaultValues?.national_proposal != null
      ? { kind: "program", id: defaultValues.national_proposal, label: defaultValues.proposal_reference ?? "Program" }
      : null;

  const [link, setLink] = useState<Link | null>(initialLink);
  const [routing, setRouting] = useState<Record<string, string>>({
    icd_11: defaultValues?.icd_11 ?? "",
    routing_decision: defaultValues?.routing_decision ?? "",
    disease_definition: defaultValues?.disease_definition ?? "",
  });
  const [data, setData] = useState<Record<string, Record<string, any>>>(defaultValues?.data ?? {});
  const sorted = useMemo(() => [...criteria].sort((a, b) => a.position - b.position), [criteria]);
  const [open, setOpen] = useState<Set<string>>(new Set(sorted.slice(0, 1).map((c) => c.code)));

  const toggle = useCallback((code: string) =>
    setOpen((s) => { const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n; }), []);

  const setField = (code: string, key: string, v: string) =>
    setData((d) => ({ ...d, [code]: { ...(d[code] ?? {}), [key]: v } }));

  const filled = (c: EvidenceCriterion) =>
    (c.field_schema ?? []).filter((f) => {
      const v = data[c.code]?.[f.key];
      return v != null && v !== "";
    }).length;

  const submit = () => {
    if (!link) { toast.error("Link this evidence to an intervention or national program."); return; }
    for (const c of sorted) {
      for (const f of c.field_schema ?? []) {
        if (f.required && !data[c.code]?.[f.key]) { toast.error(`${c.name} — ${f.label} is required.`); return; }
      }
    }
    onSubmit({
      intervention_proposal: link.kind === "intervention" ? String(link.id) : null,
      national_proposal: link.kind === "program" ? String(link.id) : null,
      ...routing,
      data,
    });
  };

  return (
    <div className="space-y-4">
      <RefPicker value={link} onChange={setLink} />

      {/* routing block */}
      <div className={`${card} p-4`}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Routing</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROUTING.map((r) => (
            <div key={r.key} className={r.area ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-medium text-slate-600">{r.label}</label>
              {r.area ? (
                <textarea rows={2} value={routing[r.key]} onChange={(e) => setRouting((s) => ({ ...s, [r.key]: e.target.value }))}
                  className="w-full border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
              ) : (
                <Input value={routing[r.key]} onChange={(e) => setRouting((s) => ({ ...s, [r.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* criteria sections */}
      {sorted.map((c) => {
        const isOpen = open.has(c.code);
        const n = filled(c), total = (c.field_schema ?? []).length;
        return (
          <div key={c.code} className={card}>
            <button type="button" onClick={() => toggle(c.code)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <Layers className="h-4 w-4 text-[#27aae1]" />{c.name}
              </span>
              <span className="flex items-center gap-3 text-xs text-slate-400">
                {n}/{total}
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
                {(c.field_schema ?? []).map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {f.label}{f.required && <span className="text-red-500"> *</span>}
                    </label>
                    <Input value={data[c.code]?.[f.key] ?? ""} placeholder={f.example || ""}
                      onChange={(e) => setField(c.code, f.key, e.target.value)} />
                    {f.definition && <p className="mt-1 text-[11px] leading-snug text-slate-400 line-clamp-2">{f.definition}</p>}
                  </div>
                ))}
                {total === 0 && <p className="text-xs text-slate-400">No variables defined for this criterion yet.</p>}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={submit} disabled={isSubmitting} style={{ backgroundColor: "#27aae1" }} className="text-white">
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {defaultValues ? "Save changes" : "Submit evidence"}
        </Button>
      </div>
    </div>
  );
}