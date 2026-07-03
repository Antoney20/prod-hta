"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X } from "lucide-react";
import {
  TopicPriority,
  TopicPriorityWritePayload,
  DecisionType,
} from "@/types/new/topic-prioritization";
import { getPublicProposals } from "@/app/api/public";
import { PublicProposal } from "@/types/new/public";
import { getDecisionTypes } from "@/app/api/new/tp";
import { getNationalPrograms } from "@/app/api/new/search";
import { ProgramProposal } from "@/types/new/program";
import RichEditor from "@/components/shared/editor";

type TargetType = "intervention" | "national_proposal";


interface PickOption {
  id: string;
  reference_number: string;
  name: string;
}

interface PickerProps {
  options: PickOption[];
  value: string;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
  disabledName?: string;
  placeholder?: string;
  error?: string;
}

function ProposalPicker({ options, value, onChange, disabled, disabledName, placeholder, error }: PickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((p) => p.id === value);

  const filtered = query.trim()
    ? options.filter((p) => {
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.reference_number.toLowerCase().includes(q);
      })
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (p: PickOption) => { onChange(p.id, p.name); setOpen(false); setQuery(""); };
  const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange("", ""); setQuery(""); };

  if (disabled) {
    const displayName = disabledName ?? selected?.name ?? "—";
    const displayRef = selected?.reference_number ?? "";
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm">
        {displayRef && <span className="font-mono text-xs text-muted-foreground shrink-0">{displayRef}</span>}
        <span className="truncate">{displayName}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer select-none",
          "bg-background hover:border-ring",
          error ? "border-destructive" : "border-input",
        ].join(" ")}
      >
        {selected ? (
          <>
            <span className="font-mono text-xs text-muted-foreground shrink-0">{selected.reference_number}</span>
            <span className="flex-1 truncate">{selected.name || "—"}</span>
            <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground ml-auto">
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <span className="text-muted-foreground flex-1">{placeholder ?? "Select…"}</span>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or reference…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => pick(p)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                    p.id === value ? "bg-accent font-medium" : "",
                  ].join(" ")}
                >
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-36 truncate">{p.reference_number}</span>
                  <span className="truncate">{p.name || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


type FormState = {
  target_type: TargetType;
  intervention: string;        // selected proposal UUID (either kind)
  intervention_name: string;
  decision: string;
  decision_date: string;
  feedback: string;
  routing_decision: string;
  notes: string;
  additional_info: string;
};

const empty: FormState = {
  target_type: "intervention",
  intervention: "",
  intervention_name: "",
  decision: "none",
  decision_date: "",
  feedback: "",
  routing_decision: "",
  notes: "",
  additional_info: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TopicPriorityWritePayload) => Promise<void>;
  defaultValues?: Partial<TopicPriority>;
  isSubmitting: boolean;
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function ReviewStatusForm({ open, onClose, onSubmit, defaultValues, isSubmitting }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [decisions, setDecisions] = useState<DecisionType[]>([]);
  const [proposals, setProposals] = useState<PublicProposal[]>([]);
  const [national, setNational] = useState<ProgramProposal[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const isEdit = !!defaultValues?.id && defaultValues.id !== null;
  const isCreate = defaultValues?.id === null;

  useEffect(() => {
    if (open && proposals.length === 0 && national.length === 0) {
      setLoadingMeta(true);
      Promise.all([getDecisionTypes(), getPublicProposals(), getNationalPrograms()])
        .then(([d, p, n]) => {
          setDecisions(Array.isArray(d) ? d : []);
          setProposals(Array.isArray(p) ? p : []);
          setNational(Array.isArray(n) ? n : []);
        })
        .finally(() => setLoadingMeta(false));
    }
  }, [open]);

  // Normalized option lists for the picker
  const interventionOptions: PickOption[] = proposals.map((p) => ({
    id: p.id,
    reference_number: p.reference_number,
    name: p.intervention_name ?? "",
  }));
  const nationalOptions: PickOption[] = national
    .filter((p) => p.reference_number)
    .map((p) => ({
      id: p.id,
      reference_number: p.reference_number,
      name: p.title ?? "",
    }));

  const activeOptions = form.target_type === "intervention" ? interventionOptions : nationalOptions;

  // Initialize form based on defaultValues and mode
  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (!defaultValues) { setForm(empty); return; }

    const targetType: TargetType =
      defaultValues.target_type === "national_proposal" ? "national_proposal" : "intervention";

    if (isEdit) {
      setForm({
        target_type: targetType,
        intervention: defaultValues.intervention_id ?? "",
        intervention_name: defaultValues.intervention_name ?? "",
        decision: defaultValues.decision?.id ?? "none",
        decision_date: defaultValues.decision_date ?? "",
        feedback: defaultValues.feedback ?? "",
        routing_decision: defaultValues.routing_decision ?? "",
        notes: "",
        additional_info: "",
      });
    } else if (isCreate) {
      setForm({
        target_type: targetType,
        intervention: defaultValues.intervention_id ?? "",
        intervention_name: defaultValues.intervention_name ?? "",
        decision: "none",
        decision_date: "",
        feedback: "",
        routing_decision: "",
        notes: "",
        additional_info: "",
      });
    }
  }, [open, defaultValues, isEdit, isCreate]);

  // Resolve reference_number → id for scored-only create rows (id not directly available)
  useEffect(() => {
    if (!defaultValues || !isCreate || form.intervention) return;
    const ref = defaultValues.reference_number;
    if (!ref) return;

    if (form.target_type === "intervention") {
      const match = proposals.find((p) => p.reference_number === ref);
      if (match) setForm((f) => ({ ...f, intervention: match.id, intervention_name: f.intervention_name || match.intervention_name || "" }));
    } else {
      const match = national.find((p) => p.reference_number === ref);
      if (match) setForm((f) => ({ ...f, intervention: match.id, intervention_name: f.intervention_name || match.title || "" }));
    }
  }, [proposals, national, defaultValues, isCreate, form.target_type]);

  const setField = useCallback(
    <K extends keyof FormState>(field: K) =>
      (value: FormState[K]) =>
        setForm((f) => ({ ...f, [field]: value })),
    []
  );

  const handleTargetChange = useCallback((id: string, name: string) => {
    setForm((f) => ({ ...f, intervention: id, intervention_name: name }));
  }, []);

  // Switching target type clears the current selection
  const switchTargetType = (t: TargetType) =>
    setForm((f) => ({ ...f, target_type: t, intervention: "", intervention_name: "" }));

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.intervention) e.intervention = "Select a proposal";
    if (form.decision !== "none" && !form.decision_date)
      e.decision_date = "Required when a decision is set";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let targetId = form.intervention;
    if (isEdit && defaultValues?.intervention_id) targetId = defaultValues.intervention_id;

    const payload: TopicPriorityWritePayload =
      form.target_type === "national_proposal"
        ? {
            national_proposal: targetId,
            decision: form.decision !== "none" ? form.decision : null,
            decision_date: form.decision_date || null,
            feedback: form.feedback,
            routing_decision: form.routing_decision || null,
            notes: form.notes,
            additional_info: form.additional_info,
          }
        : {
            intervention: targetId,
            decision: form.decision !== "none" ? form.decision : null,
            decision_date: form.decision_date || null,
            feedback: form.feedback,
            routing_decision: form.routing_decision || null,
            notes: form.notes,
            additional_info: form.additional_info,
          };

    await onSubmit(payload);
  };

  const targetLabel = form.target_type === "national_proposal" ? "National Program Proposal" : "Intervention";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-lg lg:max-w-2xl px-1 lg:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {isEdit ? "Edit Review Status" : "Assign Review Status"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the HTA review status for this proposal."
              : isCreate
                ? `Assign an initial review status to ${defaultValues?.intervention_name}.`
                : "Assign a review status to a submitted proposal."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">
          {/* Target type toggle — only on fresh create (not edit, not scored-only create) */}
          {!isEdit && !isCreate && (
            <div className="space-y-1.5">
              <Label>Proposal type</Label>
              <div className="inline-flex border border-input rounded-md overflow-hidden text-sm">
                {([
                  { v: "intervention", label: "Intervention" },
                  { v: "national_proposal", label: "National Program" },
                ] as { v: TargetType; label: string }[]).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => switchTargetType(o.v)}
                    className={`px-4 py-1.5 ${form.target_type === o.v ? "bg-[#27aae1] text-white" : "text-muted-foreground hover:bg-accent"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{targetLabel} <span className="text-destructive">*</span></Label>
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading {targetLabel.toLowerCase()}s…
              </div>
            ) : (
              <ProposalPicker
                options={activeOptions}
                value={form.intervention}
                onChange={handleTargetChange}
                disabled={isEdit}
                disabledName={form.intervention_name}
                placeholder={`Select ${targetLabel.toLowerCase()}…`}
                error={errors.intervention}
              />
            )}
            {errors.intervention && <p className="text-xs text-destructive">{errors.intervention}</p>}
          </div>

          {/* Decision */}
          <div className="space-y-1.5">
            <Label>Decision</Label>
            <Select value={form.decision} onValueChange={setField("decision")}>
              <SelectTrigger>
                <SelectValue placeholder="Select decision outcome…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {decisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Decision Date */}
          <div className="space-y-1.5">
            <Label>Decision Date</Label>
            <Input
              type="date"
              value={form.decision_date}
              onChange={(e) => setField("decision_date")(e.target.value)}
            />
            {errors.decision_date && <p className="text-xs text-destructive">{errors.decision_date}</p>}
          </div>

          {/* Routing Decision */}
          <div className="space-y-1.5">
            <Label>
              Routing Decision{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              value={form.routing_decision}
              onChange={(e) => setField("routing_decision")(e.target.value)}
              placeholder="e.g. Routed to Panel A for clinical review…"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Feedback */}
          <div className="space-y-1.5">
            <Label>
              Feedback{" "}
              <span className="text-xs text-muted-foreground">(visible to submitter)</span>
            </Label>
            <RichEditor
              value={form.feedback}
              onChange={setField("feedback")}
              placeholder="Plain-language update for the submitter…"
              minHeight={100}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>
              Notes{" "}
              <span className="text-xs text-muted-foreground">(internal)</span>
            </Label>
            <RichEditor
              value={form.notes}
              onChange={setField("notes")}
              placeholder="Internal notes on this review…"
              minHeight={80}
            />
          </div>

          {/* Additional Info */}
          <div className="space-y-1.5">
            <Label>
              Additional Info{" "}
              <span className="text-xs text-muted-foreground">(internal)</span>
            </Label>
            <RichEditor
              value={form.additional_info}
              onChange={setField("additional_info")}
              placeholder="Any supplementary notes…"
              minHeight={70}
            />
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Status"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}