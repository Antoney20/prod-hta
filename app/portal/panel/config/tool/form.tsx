"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check } from "lucide-react";
import { CriteriaAppraisalTool } from "@/types/new/appraisal";
import { RichEditor } from "@/components/shared/editor";
import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";

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
  existing?:      CriteriaAppraisalTool[];   // already-created criteria, for autocomplete
}

const stripHtml = (s: string) => s?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";

export function AppraisalToolForm({
  open, onClose, onSubmit, defaultValues, isSubmitting, onReload, existing = [],
}: Props) {
  const [form, setForm]     = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [showList, setShowList] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    if (!open) return;
    onReload?.();
    setErrors({});
    setShowList(false);
    setForm({
      criteria:         defaultValues?.criteria          ?? "",
      description:      defaultValues?.description       ?? "",
      scoring_approach: defaultValues?.scoring_approach  ?? "",
      score:            defaultValues?.score != null ? String(defaultValues.score) : "",
    });
  }, [open, defaultValues]);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowList(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  // distinct existing names matching the current input (by name OR description)
  const q = form.criteria.trim().toLowerCase();
  const matches = (() => {
    const seen = new Set<string>();
    const out: CriteriaAppraisalTool[] = [];
    for (const c of existing) {
      const key = c.criteria.trim().toLowerCase();
      if (seen.has(key)) continue;                         // one per distinct name
      const hit =
        !q ||
        key.includes(q) ||
        stripHtml(c.description).toLowerCase().includes(q);
      if (hit) { seen.add(key); out.push(c); }
    }
    return out.slice(0, 8);
  })();

  const exactExists = existing.some(
    (c) => c.criteria.trim().toLowerCase() === q && q !== "",
  );

  const pick = (c: CriteriaAppraisalTool) => {
    // reuse the exact name + description so bands share one criterion group
    setForm((f) => ({
      ...f,
      criteria: c.criteria,
      description: f.description || c.description || "",
    }));
    setShowList(false);
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.criteria.trim())    e.criteria    = "Required";
    if (form.score !== "" && isNaN(Number(form.score))) e.score = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      criteria:         form.criteria.trim(),
      description:      sanitizeHtml(form.description),
      scoring_approach: form.scoring_approach ? sanitizeHtml(form.scoring_approach) : undefined,
      score:           form.score !== "" ? Number(form.score) : undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle className="text-xl">{isEdit ? "Edit" : "New"} appraisal criteria</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this criterion and its scoring details."
              : "Add a new criterion, or reuse an existing name to add another score band to it."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          {/* criteria — autocomplete against existing */}
          <div className="space-y-1.5" ref={boxRef}>
            <Label>Criteria <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                value={form.criteria}
                onChange={(e) => { set("criteria")(e); setShowList(true); }}
                onFocus={() => setShowList(true)}
                placeholder="Burden of disease (mortality)"
                autoComplete="off"
              />

              {showList && matches.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {matches.map((c) => {
                    const chosen = c.criteria.trim().toLowerCase() === q;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => pick(c)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#27aae1]/5"
                      >
                        {chosen ? (
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#27aae1]" />
                        ) : (
                          <span className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-800">{c.criteria}</span>
                          {c.description && (
                            <span className="line-clamp-1 block text-xs text-slate-400">
                              {stripHtml(c.description)}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* hint about reuse vs new */}
            {!isEdit && q && (
              exactExists ? (
                <p className="text-xs text-[#27aae1]">
                  Matches an existing criterion — this will be added as another band under it.
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  No exact match — a new criterion will be created.
                </p>
              )
            )}
            {errors.criteria && <p className="text-xs text-destructive">{errors.criteria}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <RichEditor
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Describe what this criterion measures..."
              minHeight={100}
              maxHeight={200}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Scoring Approach</Label>
            <RichEditor
              value={form.scoring_approach}
              onChange={(v) => setForm((f) => ({ ...f, scoring_approach: v }))}
              placeholder="How are scores assigned for this criterion?"
              minHeight={140}
              maxHeight={280}
            />
          </div>

          <Separator />

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
            {errors.score && <p className="text-xs text-destructive">{errors.score}</p>}
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