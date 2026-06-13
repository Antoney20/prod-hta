"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings2, Plus, Trash2, Pencil, Save, X, UploadCloud, Download,
  Layers, Loader2, ChevronDown, ChevronRight, FileJson,
} from "lucide-react";
import { toast } from "react-toastify";

import { EvidenceCriterion, EvidenceField, EvidenceCriterionPayload } from "@/types/new/evidence-extraction";
import { createEvidenceCriterion, deleteEvidenceCriterion, getEvidenceCriteria, updateEvidenceCriterion } from "@/app/api/new/evidence-extraction";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";


const card = "border border-slate-200 bg-white";
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const TYPES = ["text", "number", "percent", "ratio", "rate", "date", "count", "select"];

interface DraftCriterion {
  id?: string;
  name: string;
  code: string;
  description: string;
  position: number;
  field_schema: EvidenceField[];
}
const blank = (position: number): DraftCriterion => ({ name: "", code: "", description: "", position, field_schema: [] });

/* ----------------------------- sample download ----------------------------- */
async function downloadSample() {
  const res = await fetch("/samples/dictionary.json").catch(() => null);
  // fall back to a tiny inline example if the static file isn't served
  const body = res?.ok ? await res.text() : JSON.stringify({
    version: 1,
    criteria: [{
      name: "Clinical effectiveness", code: "clinical_effectiveness", position: 1, description: "",
      field_schema: [
        { key: "survival_rate", label: "Survival rate", type: "text", required: false },
        { key: "hazard_ratio", label: "Hazard ratio", type: "ratio", required: false },
      ],
    }],
  }, null, 2);
  const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = "dictionary.json"; a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------- field editor ----------------------------- */
function FieldRows({ fields, onChange }: { fields: EvidenceField[]; onChange: (f: EvidenceField[]) => void }) {
  const set = (i: number, patch: Partial<EvidenceField>) =>
    onChange(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  return (
    <div className="space-y-1.5">
      {fields.map((f, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <Input className="w-44" placeholder="Label" value={f.label}
            onChange={(e) => set(i, { label: e.target.value, key: f.key || slug(e.target.value) })} />
          <Input className="w-40 font-mono text-xs" placeholder="key" value={f.key} onChange={(e) => set(i, { key: slug(e.target.value) })} />
          <select className="border border-slate-300 px-2 py-1.5 text-sm" value={f.type ?? "text"} onChange={(e) => set(i, { type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input type="checkbox" checked={!!f.required} onChange={(e) => set(i, { required: e.target.checked })} /> required
          </label>
          <button onClick={() => onChange(fields.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-600" aria-label="Remove variable">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onChange([...fields, { key: "", label: "" }])}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add variable
      </Button>
    </div>
  );
}

/* ----------------------------- criterion editor ----------------------------- */
function CriterionEditor({ draft, onSave, onCancel, saving }: {
  draft: DraftCriterion; onSave: (d: DraftCriterion) => void; onCancel: () => void; saving: boolean;
}) {
  const [d, setD] = useState(draft);
  return (
    <div className={`${card} p-4 space-y-3`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Criterion name</label>
          <Input value={d.name} placeholder="Clinical effectiveness"
            onChange={(e) => setD({ ...d, name: e.target.value, code: d.code || slug(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Code</label>
          <Input className="font-mono text-xs" value={d.code} onChange={(e) => setD({ ...d, code: slug(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
        <textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })}
          className="w-full border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Variables</p>
        <FieldRows fields={d.field_schema} onChange={(field_schema) => setD({ ...d, field_schema })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}><X className="h-4 w-4 mr-1.5" /> Cancel</Button>
        <Button onClick={() => d.name && d.code ? onSave(d) : toast.error("Name and code are required.")}
          disabled={saving} style={{ backgroundColor: "#27aae1" }} className="text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save criterion
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- main ----------------------------- */
export default function TemplateConfig() {
  const [criteria, setCriteria] = useState<EvidenceCriterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<DraftCriterion | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<EvidenceCriterion[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => [...criteria].sort((a, b) => a.position - b.position), [criteria]);
  const nextPos = sorted.length ? Math.max(...sorted.map((c) => c.position)) + 1 : 1;

  const allSelected = sorted.length > 0 && selected.size === sorted.length;
  const someSelected = selected.size > 0 && !allSelected;

  const load = useCallback(async () => {
    setLoading(true); setCriteria(await getEvidenceCriteria()); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (code: string) => setOpen((s) => { const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n; });

  const toggleSelect = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelected(allSelected ? new Set() : new Set(sorted.map((c) => c.id)));

  const save = async (d: DraftCriterion) => {
    setSaving(true);
    const payload: EvidenceCriterionPayload = {
      name: d.name, code: d.code, description: d.description, position: d.position, field_schema: d.field_schema,
    };
    try {
      if (d.id) { await updateEvidenceCriterion(d.id, payload); toast.success("Criterion updated."); }
      else { await createEvidenceCriterion(payload); toast.success("Criterion created."); }
      setEditing(null); await load();
    } catch (e: any) { toast.error(e?.message ?? "Failed to save criterion."); }
    finally { setSaving(false); }
  };

  // delete one or many — both flow through the DeleteDialog
  const confirmDelete = async () => {
    if (!deleteTarget?.length) return;
    const targets = deleteTarget;
    setDeleteTarget(null);
    let ok = 0, fail = 0;
    for (const c of targets) {
      try { await deleteEvidenceCriterion(c.id); ok++; }
      catch { fail++; }
    }
    if (ok) toast.success(`${ok} criteri${ok !== 1 ? "a" : "on"} deleted.`);
    if (fail) toast.error(`${fail} could not be deleted.`);
    setSelected(new Set());
    await load();
  };

  const selectedCriteria = sorted.filter((c) => selected.has(c.id));

  // upload dictionary.json -> auto-create all criteria
  const importDictionary = async (file?: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const parsed = JSON.parse(await file.text());
      const items: any[] = Array.isArray(parsed) ? parsed : parsed.criteria ?? [];
      if (!items.length) { toast.error("No criteria found in that file."); return; }
      let ok = 0, fail = 0;
      for (const [i, c] of items.entries()) {
        const payload: EvidenceCriterionPayload = {
          name: c.name, code: c.code || slug(c.name ?? `criterion_${i + 1}`),
          description: c.description ?? "", position: c.position ?? i + 1,
          field_schema: (c.field_schema ?? c.fields ?? []).map((f: any) => ({
            key: f.key || slug(f.label ?? ""), label: f.label ?? f.key,
            type: f.type, definition: f.definition, formula: f.formula,
            example: f.example, required: !!f.required, options: f.options,
          })),
        };
        try { if (payload.name && payload.code) { await createEvidenceCriterion(payload); ok++; } else fail++; }
        catch { fail++; }
      }
      if (ok) toast.success(`${ok} criteria created from dictionary.`);
      if (fail) toast.error(`${fail} entr${fail !== 1 ? "ies" : "y"} skipped (duplicate code or invalid).`);
      await load();
    } catch { toast.error("Could not parse dictionary.json — check it's valid JSON."); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><Settings2 className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Evidence template setup</h1>
            <p className="text-sm text-muted-foreground">{sorted.length} criteria · define them manually or import a dictionary.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={downloadSample} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#27aae1] hover:underline">
            <Download className="h-3.5 w-3.5" /> Sample dictionary.json
          </button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />} Import dictionary
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importDictionary(e.target.files?.[0])} />
          <Button onClick={() => setEditing(blank(nextPos))} style={{ backgroundColor: "#27aae1" }} className="text-white">
            <Plus className="h-4 w-4 mr-2" /> Add criterion
          </Button>
        </div>
      </div>

      {/* selection toolbar */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-[#27aae1]"
            />
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </label>
          {selected.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteTarget(selectedCriteria)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete selected
            </Button>
          )}
        </div>
      )}

      {/* import hint when empty */}
      {!loading && sorted.length === 0 && !editing && (
        <div className="border border-dashed border-slate-300 py-16 text-center">
          <FileJson className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No template yet</p>
          <p className="text-xs text-slate-400 mt-1">Import a dictionary.json to set everything up at once, or add criteria one by one.</p>
        </div>
      )}

      {editing && !editing.id && <CriterionEditor draft={editing} onSave={save} onCancel={() => setEditing(null)} saving={saving} />}

      {/* existing criteria */}
      {sorted.map((c) => {
        const isOpen = open.has(c.code);
        const isSelected = selected.has(c.id);
        const beingEdited = editing?.id === c.id;
        if (beingEdited) return <CriterionEditor key={c.id} draft={editing!} onSave={save} onCancel={() => setEditing(null)} saving={saving} />;
        return (
          <div key={c.id} className={`${card} ${isSelected ? "ring-1 ring-[#27aae1]" : ""}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(c.id)}
                  className="h-4 w-4 accent-[#27aae1]"
                  aria-label={`Select ${c.name}`}
                />
                <button onClick={() => toggle(c.code)} className="flex items-center gap-2 text-left">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <Layers className="h-4 w-4 text-[#27aae1]" />
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{c.code}</span>
                  <span className="text-xs text-slate-400">· {(c.field_schema ?? []).length} variables</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing({ ...c, description: c.description ?? "", field_schema: c.field_schema ?? [] })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget([c])}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            {isOpen && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-3">
                {(c.field_schema ?? []).map((f) => (
                  <span key={f.key} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {f.label}{f.required && <span className="text-red-400">*</span>}
                  </span>
                ))}
                {(c.field_schema ?? []).length === 0 && <span className="text-xs text-slate-400">No variables.</span>}
              </div>
            )}
          </div>
        );
      })}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={deleteTarget && deleteTarget.length > 1 ? `Delete ${deleteTarget.length} criteria?` : "Delete criterion?"}
        description={
          deleteTarget && deleteTarget.length > 1
            ? <>This permanently deletes <strong>{deleteTarget.length} criteria</strong> and all their variables.</>
            : <>This permanently deletes <strong>{deleteTarget?.[0]?.name}</strong> and its variables.</>
        }
        onConfirm={confirmDelete}
        confirmWord="delete"
      />
    </div>
  );
}