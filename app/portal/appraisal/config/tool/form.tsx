"use client";

import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { CriteriaAppraisalTool } from "@/types/new/appraisal";


type FormState = {
  criteria:          string;
  description:       string;
  scoring_approach:  string;
  score:             string;
};
 
const empty: FormState = {
  criteria:         "",
  description:      "",
  scoring_approach: "",
  score:            "",
};
 
interface Props {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (values: Partial<CriteriaAppraisalTool>) => Promise<void>;
  defaultValues?: Partial<CriteriaAppraisalTool>;
  isSubmitting:   boolean;
  onReload?:      () => void;
}
 

export function AppraisalToolForm({
  open, onClose, onSubmit, defaultValues, isSubmitting, onReload,
}: Props) {
  const [form, setForm]   = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isEdit = !!defaultValues?.id;
 
  // ── reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    onReload?.();
    setErrors({});
    setForm({
      criteria:         defaultValues?.criteria          ?? "",
      description:      defaultValues?.description       ?? "",
      scoring_approach: defaultValues?.scoring_approach  ?? "",
      score:            defaultValues?.scores != null
                          ? String(defaultValues.scores)
                          : "",
    });
  }, [open, defaultValues]);
 
  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.criteria.trim())    e.criteria    = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (form.score !== "" && isNaN(Number(form.score)))
      e.score = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      criteria:         form.criteria.trim(),
      description:      form.description.trim(),
      scoring_approach: form.scoring_approach.trim() || undefined,
      scores:           form.score !== "" ? Number(form.score) : undefined,
    });
  };
 
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit" : "New"} appraisal criteria</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this criterion and its scoring details."
              : "Add a new criterion for appraising intervention proposals."}
          </SheetDescription>
        </SheetHeader>
 
        <form onSubmit={handleSubmit} className="space-y-5 py-6">
 
          {/* Criteria */}
          <div className="space-y-1.5">
            <Label>Criteria <span className="text-destructive">*</span></Label>
            <Input
              value={form.criteria}
              onChange={set("criteria")}
              placeholder="e.g. Disease Burden"
            />
            {errors.criteria && (
              <p className="text-xs text-destructive">{errors.criteria}</p>
            )}
          </div>
 
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Describe what this criterion measures..."
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
 
          {/* Scoring Approach */}
          <div className="space-y-1.5">
            <Label>Scoring Approach</Label>
            <Textarea
              value={form.scoring_approach}
              onChange={set("scoring_approach")}
              rows={5}
              placeholder="How are scores assigned for this criterion?"
            />
          </div>
 
          <Separator />
 
          {/* Score */}
          <div className="space-y-1.5">
            <Label>Score</Label>
            <Input
              type="number"
              value={form.score}
              onChange={set("score")}
              placeholder="e.g. 5"
              min={0}
              max={5}
            />
            {errors.score && (
              <p className="text-xs text-destructive">{errors.score}</p>
            )}
          </div>
 
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create criteria"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}