"use client";

import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminOnly } from "@/app/context/role";
import { labelFor, nameOf, refOf, str, type Field, type Proposal } from "../_lib/proposal";

/* ---- Revise Existing editor ---- */
interface ReviseProps {
  existing: boolean;
  pkgName: string;
  name: string; onName: (v: string) => void;
  fund: string; onFund: (v: string) => void;
  fields: Field[];
  onField: (i: number, patch: Partial<Field>) => void;
  onAddField: () => void;
  onRemoveField: (i: number) => void;
  onSave: () => void;
  saving: boolean;
}

export function RevisePanel({
  existing, pkgName, name, onName, fund, onFund,
  fields, onField, onAddField, onRemoveField, onSave, saving,
}: ReviseProps) {
  const area = "min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]";
  return (
    <div className="max-w-2xl space-y-4">
      {!existing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          No existing benefit package named “{pkgName}”. Saving will create it.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name</span>
          <Input value={name} onChange={(e) => onName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fund</span>
          <Input value={fund} onChange={(e) => onFund(e.target.value)} />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Package fields</span>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAddField}>
            <Plus className="mr-1 h-3.5 w-3.5" />Add field
          </Button>
        </div>
        {fields.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <Input className="w-40 shrink-0 font-mono text-xs" placeholder="access_point"
              value={row.key} onChange={(e) => onField(i, { key: e.target.value })} />
            <textarea className={area} rows={2} placeholder="Level 4-6"
              value={row.value} onChange={(e) => onField(i, { value: e.target.value })} />
            <button className="mt-1 text-slate-400 hover:text-red-600" onClick={() => onRemoveField(i)} title="Remove field">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <AdminOnly silent>
        <Button onClick={onSave} disabled={saving} style={{ backgroundColor: "#27aae1" }} className="text-white">
          <Save className="mr-1.5 h-4 w-4" />{existing ? "Save changes" : "Create package"}
        </Button>
      </AdminOnly>
    </div>
  );
}

/* ---- Preview ---- */
interface PreviewProps {
  fields: Field[];
  included: Proposal[];
}

export function PreviewPanel({ fields, included }: PreviewProps) {
  const set = fields.filter((f) => f.key.trim());
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200">
        <p className="border-b px-3 py-2 text-xs font-semibold text-slate-500">Revised package fields</p>
        <dl className="divide-y divide-slate-100 text-sm">
          {set.map((f, i) => (
            <div key={i} className="px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{labelFor(f.key.trim())}</dt>
              <dd className="whitespace-pre-line text-slate-700">{f.value || <span className="text-slate-300">—</span>}</dd>
            </div>
          ))}
          {!set.length && <p className="px-3 py-4 text-xs text-slate-400">No fields set.</p>}
        </dl>
      </div>
      <div className="rounded-lg border border-slate-200">
        <p className="border-b px-3 py-2 text-xs font-semibold text-slate-500">
          Included interventions <span className="text-green-600">({included.length})</span>
        </p>
        <div className="max-h-[52vh] divide-y divide-slate-100 overflow-auto">
          {included.map((it) => (
            <div key={it._key} className="px-3 py-2">
              <p className="text-sm font-medium text-slate-700">{nameOf(it)}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="font-mono">{refOf(it)}</span>
                {str(it.service) && <span>{str(it.service)}</span>}
              </p>
              {str(it.comment) && <p className="mt-1 text-xs text-slate-500">{str(it.comment)}</p>}
            </div>
          ))}
          {!included.length && <p className="px-3 py-4 text-xs text-slate-400">Nothing included yet.</p>}
        </div>
      </div>
    </div>
  );
}