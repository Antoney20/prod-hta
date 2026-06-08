"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { AssessmentCriteria, AssessmentEvidence } from "@/types/new/assessment";
import { PublicProposal } from "@/types/new/public";
import { RichEditor } from "@/components/shared/editor";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";


const DRAFT_KEY = "assessment-evidence-draft";

export interface FormValues {
  criteria: string;
  interventions: string[];
  title: string;
  notes: string;
}

const EMPTY: FormValues = { criteria: "", interventions: [], title: "", notes: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<boolean>;   // returns success
  isSubmitting: boolean;
  criteria: AssessmentCriteria[];
  proposals: SubmittedProposal[];
  defaultValues?: AssessmentEvidence;
}

export function EvidenceForm({ open, onClose, onSubmit, isSubmitting, criteria, proposals, defaultValues }: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [query, setQuery]   = useState("");
  const [dirty, setDirty]   = useState(false);
  const isEdit = !!defaultValues?.id;

  // Hydrate: edit → from record; create → from saved draft
  useEffect(() => {
    if (!open) return;
    if (isEdit && defaultValues) {
      setValues({
        criteria: defaultValues.criteria,
        interventions: defaultValues.interventions ?? [],
        title: defaultValues.title ?? "",
        notes: defaultValues.notes ?? "",
      });
    } else {
      const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
      if (raw) {
        try { setValues(JSON.parse(raw)); toast.info("Restored your unsaved draft."); }
        catch { setValues(EMPTY); }
      } else setValues(EMPTY);
    }
    setDirty(false);
    setQuery("");
  }, [open, isEdit, defaultValues]);

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  // Persist draft (create mode only)
  useEffect(() => {
    if (!open || isEdit || !dirty) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  }, [values, open, isEdit, dirty]);

  // Warn on refresh / hard navigation while dirty
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter(
      (p) => (p.intervention_name ?? "").toLowerCase().includes(q) || p.reference_number.toLowerCase().includes(q)
    );
  }, [proposals, query]);

const toggle = (id: string) =>
  set("interventions",
    values.interventions.includes(id)
      ? values.interventions.filter((i) => i !== id)
      : [...values.interventions, id]);

const selected = proposals.filter((p) => values.interventions.includes(String(p.id)));
  const canSubmit = !!values.criteria && values.interventions.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) { toast.error("Select a criterion and at least one intervention."); return; }
    const ok = await onSubmit(values);
    if (ok) { localStorage.removeItem(DRAFT_KEY); setDirty(false); }
  };

  // Guarded close — keep the draft so they can continue later
  const attemptClose = () => {
    if (dirty && !isEdit) toast.info("Draft saved — you can continue later.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && attemptClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Evidence" : "Add Evidence"}</DialogTitle>
          <DialogDescription>Classify evidence under a criterion and link it to interventions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Criteria */}
          <div className="space-y-2">
            <Label>Criteria <span className="text-destructive">*</span></Label>
            <Select value={values.criteria} onValueChange={(v) => set("criteria", v)}>
              <SelectTrigger><SelectValue placeholder="Select a criterion" /></SelectTrigger>
              <SelectContent>
                {criteria.map((c) => <SelectItem key={c.id} value={c.id}>{c.order}. {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Interventions */}
          <div className="space-y-2">
            <Label>Interventions <span className="text-destructive">*</span></Label>

            {selected.map((p) => (
            <Badge key={p.id} variant="secondary" className="gap-1">
                {p.reference_number}
                <button onClick={() => toggle(String(p.id))}><X className="h-3 w-3" /></button>
            </Badge>
            ))}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or reference no…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className="max-h-44 overflow-y-auto rounded-md border divide-y">
             {filtered.map((p) => {
                const idStr = String(p.id);
                const active = values.interventions.includes(idStr);
                return (
                    <button key={p.id} onClick={() => toggle(idStr)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted">
                    <span className="min-w-0 truncate">
                        <span className="font-medium">{p.reference_number}</span>{" "}
                        <span className="text-muted-foreground">{p.intervention_name ?? "Untitled"}</span>
                    </span>
                    {active && <Check className="h-4 w-4 text-[#27aae1] shrink-0" />}
                    </button>
                );
                })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Short label for this evidence" value={values.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <RichEditor value={values.notes} onChange={(html: string) => set("notes", html)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={attemptClose} disabled={isSubmitting}>
            {dirty && !isEdit ? "Save & continue later" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Update" : "Save Evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}