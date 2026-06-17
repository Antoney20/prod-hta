"use client";


import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";

import type { BenefitPackage, BenefitPackageInput } from "@/types/new/benefits-package";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BenefitPackageInput) => void;
  defaultValues?: BenefitPackage;
  fund?: string; // prefill when adding inside a fund group
  isSubmitting?: boolean;
}

type Field = { key: string; value: string };

const toFields = (data?: Record<string, any>): Field[] =>
  data && Object.keys(data).length
    ? Object.entries(data).map(([key, value]) => ({
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      }))
    : [{ key: "", value: "" }];

export function PackageForm({ open, onClose, onSubmit, defaultValues, fund, isSubmitting }: Props) {
  const [name, setName] = useState("");
  const [fundName, setFundName] = useState("");
  const [fields, setFields] = useState<Field[]>([{ key: "", value: "" }]);

  useEffect(() => {
    if (!open) return;
    setName(defaultValues?.name ?? "");
    setFundName(defaultValues?.fund ?? fund ?? "");
    setFields(toFields(defaultValues?.data));
  }, [open, defaultValues, fund]);

  const setField = (i: number, patch: Partial<Field>) =>
    setFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addField = () => setFields((f) => [...f, { key: "", value: "" }]);
  const removeField = (i: number) => setFields((f) => f.filter((_, idx) => idx !== i));

  const submit = () => {
    const data: Record<string, string> = {};
    fields.forEach(({ key, value }) => {
      if (key.trim()) data[key.trim()] = value;
    });
    onSubmit({ name: name.trim(), fund: fundName.trim(), data });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit package" : "Add package"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name *</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Renal Care Package" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fund</span>
              <Input value={fundName} onChange={(e) => setFundName(e.target.value)} placeholder="Social Health Insurance Fund" />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fields</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addField}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add field
              </Button>
            </div>
            {fields.map((row, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input
                  className="w-40 shrink-0 font-mono text-xs"
                  placeholder="access_point"
                  value={row.key}
                  onChange={(e) => setField(i, { key: e.target.value })}
                />
                <textarea
                  className="min-w-0 flex-1 border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
                  rows={2}
                  placeholder="Level 4-6"
                  value={row.value}
                  onChange={(e) => setField(i, { value: e.target.value })}
                />
                <button
                  className="mt-1 text-slate-400 hover:text-red-600"
                  onClick={() => removeField(i)}
                  title="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={isSubmitting || !name.trim()}
            style={{ backgroundColor: "#27aae1" }}
            className="text-white"
          >
            {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {defaultValues ? "Save changes" : "Create package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}