"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  NationalProgram, NationalProgramPayload, ProgramField, FieldType,
} from "@/types/new/program";

const TYPES: FieldType[] = [
  "text", "textarea", "richtext", "number", "integer",
  "boolean", "date", "select", "multiselect", "url", "email",
];
const HAS_OPTIONS = (t: FieldType) => t === "select" || t === "multiselect";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NationalProgramPayload) => void;
  defaultValues?: NationalProgram | null;
  isSubmitting?: boolean;
}

export function ProgramForm({ open, onClose, onSubmit, defaultValues, isSubmitting }: Props) {
  const editing = !!defaultValues;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [fields, setFields] = useState<ProgramField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(defaultValues?.name ?? "");
    setCode(defaultValues?.code ?? "");
    setDescription(defaultValues?.description ?? "");
    setActive(defaultValues?.is_active ?? true);
    setFields(defaultValues?.field_schema ?? []);
    setErrors({});
  }, [open, defaultValues]);

  const addField = () => setFields((f) => [...f, { key: "", label: "", type: "text", required: false }]);
  const upField = (i: number, patch: Partial<ProgramField>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const rmField = (i: number) => setFields((f) => f.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!code.trim()) e.code = "Code is required.";
    const seen = new Set<string>();
    fields.forEach((f, i) => {
      const key = f.key.trim();
      if (!key) e[`f${i}`] = "Field key is required.";
      else if (seen.has(key)) e[`f${i}`] = "Duplicate field key.";
      seen.add(key);
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      is_active: active,
      field_schema: fields.map((f) => ({
        key: f.key.trim(),
        label: f.label.trim() || f.key.trim(),
        type: f.type,
        required: !!f.required,
        ...(HAS_OPTIONS(f.type) && f.options?.length ? { options: f.options } : {}),
      })),
    });
  };

  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Program" : "Create National Program"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="MOH HIV Program" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                className={`${input} font-mono uppercase`}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MOH-HIV"
                disabled={editing}
                title={editing ? "Code is fixed after creation (it drives the reference number)" : undefined}
              />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className={input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          {/* Field schema builder */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Program Fields</h3>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addField}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-gray-400">No custom fields yet. These columns are unique to this program.</p>
            )}

            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="border border-gray-200 p-2.5 rounded-md space-y-2">
                  <div className="flex gap-2">
                    <input
                      className={`${input} font-mono`}
                      placeholder="variable"
                      value={f.key}
                      onChange={(e) => upField(i, { key: e.target.value.replace(/\s+/g, "_") })}
                    />
                    <input
                      className={input}
                      placeholder="Label"
                      value={f.label}
                      onChange={(e) => upField(i, { label: e.target.value })}
                    />
                    <button type="button" onClick={() => rmField(i)} className="shrink-0 px-2 text-red-500 hover:text-red-700" aria-label="Remove field">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select className={`${input} max-w-40`} value={f.type} onChange={(e) => upField(i, { type: e.target.value as FieldType })}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input type="checkbox" checked={!!f.required} onChange={(e) => upField(i, { required: e.target.checked })} />
                      Required
                    </label>
                    {HAS_OPTIONS(f.type) && (
                      <input
                        className={`${input} flex-1 min-w-50`}
                        placeholder="Options (comma separated)"
                        value={(f.options ?? []).join(", ")}
                        onChange={(e) =>
                          upField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                        }
                      />
                    )}
                  </div>
                  {errors[`f${i}`] && <p className="text-xs text-red-600">{errors[`f${i}`]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isSubmitting} style={{ backgroundColor: "#27aae1" }} className="text-white">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Save Changes" : "Create Program"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}