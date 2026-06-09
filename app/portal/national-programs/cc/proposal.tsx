"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RichEditor, isBlankHtml } from "@/components/shared/editor";
import {
  NationalProgram, ProgramField, ProgramProposal, ProgramProposalPayload,
} from "@/types/new/program";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ProgramProposalPayload) => void;
  program: NationalProgram | null;
  defaultValues?: ProgramProposal | null;
  isSubmitting?: boolean;
}

const input =
  "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]";

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function DynamicField({
  field, value, onChange, error,
}: { field: ProgramField; value: any; onChange: (v: any) => void; error?: string }) {
  const cls = `${input} ${error ? "border-red-400" : "border-gray-300"}`;
  const common = { label: field.label, required: field.required, error };

  switch (field.type) {
    case "richtext":
      return (
        <Field {...common}>
          <RichEditor value={value ?? ""} onChange={onChange} placeholder={field.placeholder} invalid={!!error} />
        </Field>
      );
    case "textarea":
      return (
        <Field {...common}>
          <textarea className={cls} rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
        </Field>
      );
    case "boolean":
      return (
        <Field {...common}>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
            {field.hint ?? "Yes"}
          </label>
        </Field>
      );
    case "select":
      return (
        <Field {...common}>
          <select className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select…</option>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      );
    case "multiselect": {
      const arr: string[] = Array.isArray(value) ? value : [];
      return (
        <Field {...common}>
          <div className="flex flex-wrap gap-3">
            {field.options?.map((o) => {
              const on = arr.includes(o);
              return (
                <label key={o} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}
                  />
                  {o}
                </label>
              );
            })}
          </div>
        </Field>
      );
    }
    case "number":
    case "integer":
      return (
        <Field {...common}>
          <input type="number" className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
        </Field>
      );
    case "date":
      return (
        <Field {...common}>
          <input type="date" className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    default:
      return (
        <Field {...common}>
          <input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            className={cls}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </Field>
      );
  }
}

export function ProposalForm({ open, onClose, onSubmit, program, defaultValues, isSubmitting }: Props) {
  const editing = !!defaultValues;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setDate(defaultValues?.submitted_date ?? "");
    setData((defaultValues?.data as Record<string, any>) ?? {});
    setErrors({});
  }, [open, defaultValues]);

  const schema = program?.field_schema ?? [];
  const setField = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    for (const f of schema) {
      if (!f.required) continue;
      const v = data[f.key];
      const empty =
        f.type === "richtext"
          ? isBlankHtml(v ?? "")
          : v == null || v === "" || (Array.isArray(v) && v.length === 0);
      if (empty) e[f.key] = `${f.label || f.key} is required.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!program || !validate()) return;
    onSubmit({
      program: program.id,
      title: title.trim(),
      data,
      submitted_date: date || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl lg:max-w-5xl  min-h-[90vh]  max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Evidence" : "Upload Evidence"}
            {program && <span className="text-muted-foreground font-normal"> — {program.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Title" required error={errors.title}>
            <input className={`${input} ${errors.title ? "border-red-400" : "border-gray-300"}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          </Field>

          <Field label="Submitted date">
            <input type="date" className={`${input} border-gray-300`} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          {schema.map((f) => (
            <DynamicField key={f.key} field={f} value={data[f.key]} onChange={(v) => setField(f.key, v)} error={errors[f.key]} />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isSubmitting || !program} style={{ backgroundColor: "#27aae1" }} className="text-white">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Save Changes" : "Submit Evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}