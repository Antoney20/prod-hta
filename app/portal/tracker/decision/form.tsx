"use client";

import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DecisionType } from "@/types/new/topic-prioritization";

type FormState = { name: string; description: string };
const empty: FormState = { name: "", description: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<DecisionType>) => Promise<void>;
  defaultValues?: Partial<DecisionType>;
  isSubmitting: boolean;
}

export function DecisionTypeForm({ open, onClose, onSubmit, defaultValues, isSubmitting }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
      });
    }
  }, [open, defaultValues]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: form.name.trim(), description: form.description.trim() });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-md px-1 lg:px-6">
        <SheetHeader>
          <SheetTitle className="text-lg">{isEdit ? "Edit" : "New"} Decision Type</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this HTA decision outcome."
              : "Add a formal decision outcome used in intervention review."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">
          <div className="space-y-1.5">
            <Label>Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Not Selected, Deferred, Discussed"
              autoComplete="off"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={4}
              placeholder="General description of the decision..."
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}