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


interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

function RichEditor({ value, onChange, placeholder, minHeight = 100 }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternalUpdate.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value ?? "";
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
  };

  const handleInput = () => {
    isInternalUpdate.current = true;
    onChange(ref.current?.innerHTML ?? "");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    if (html) {
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else if (plain) {
      document.execCommand("insertText", false, plain);
    }
  };

  const toolBtn = (label: string, style: React.CSSProperties, action: () => void) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      style={{
        padding: "2px 8px",
        border: "1px solid #d1d5db",
        borderRadius: 4,
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
        color: "#374151",
        ...style,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
      <div style={{
        display: "flex", gap: 2, padding: "6px 8px",
        borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap",
      }}>
        {toolBtn("B", { fontWeight: 700 }, () => exec("bold"))}
        {toolBtn("I", { fontStyle: "italic" }, () => exec("italic"))}
        {toolBtn("U", { textDecoration: "underline" }, () => exec("underline"))}
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        {toolBtn("• List", {}, () => exec("insertUnorderedList"))}
        {toolBtn("1. List", {}, () => exec("insertOrderedList"))}
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        {toolBtn("Link", {}, () => {
          const url = prompt("Enter URL");
          if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          minHeight,
          maxHeight: 280,
          padding: "10px 12px",
          outline: "none",
          fontSize: 13,
          color: "#111827",
          lineHeight: 1.6,
          overflowY: "auto",
        }}
      />
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9ca3af;pointer-events:none}`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Searchable intervention picker
// ---------------------------------------------------------------------------

interface InterventionPickerProps {
  proposals: PublicProposal[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  error?: string;
}

function InterventionPicker({ proposals, value, onChange, disabled, error }: InterventionPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = proposals.find((p) => p.id === value);

  const filtered = query.trim()
    ? proposals.filter((p) => {
        const name = (p.intervention_name ?? "").toLowerCase();
        const ref = p.reference_number.toLowerCase();
        const q = query.toLowerCase();
        return name.includes(q) || ref.includes(q);
      })
    : proposals;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  if (disabled && selected) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm">
        <span className="font-mono text-xs text-muted-foreground shrink-0">
          {selected.reference_number}
        </span>
        <span className="truncate">{selected.intervention_name ?? "—"}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer select-none",
          disabled ? "bg-muted cursor-not-allowed" : "bg-background hover:border-ring",
          error ? "border-destructive" : "border-input",
        ].join(" ")}
      >
        {selected ? (
          <>
            <span className="font-mono text-xs text-muted-foreground shrink-0">
              {selected.reference_number}
            </span>
            <span className="flex-1 truncate">{selected.intervention_name ?? "—"}</span>
            {!disabled && (
              <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground ml-auto">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <span className="text-muted-foreground flex-1">Select intervention…</span>
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
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No interventions found
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => pick(p.id)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                    p.id === value ? "bg-accent font-medium" : "",
                  ].join(" ")}
                >
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-36 truncate">
                    {p.reference_number}
                  </span>
                  <span className="truncate">{p.intervention_name ?? "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

type FormState = {
  intervention: string;
  decision: string;
  decision_date: string;
  feedback: string;
  notes: string;
  additional_info: string;
};

const empty: FormState = {
  intervention: "",
  decision: "none",
  decision_date: "",
  feedback: "",
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
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Determine mode:
  // - isEdit = true: id is a real UUID (existing record) → EDIT mode, intervention locked
  // - isCreate = true: id is null (scored but no status) → CREATE mode, intervention pre-filled but editable
  // - otherwise: fresh CREATE mode, no defaults
  const isEdit = !!defaultValues?.id && defaultValues.id !== null;
  const isCreate = defaultValues?.id === null;

  useEffect(() => {
    if (open && proposals.length === 0) {
      setLoadingMeta(true);
      Promise.all([getDecisionTypes(), getPublicProposals()])
        .then(([d, p]) => {
          setDecisions(Array.isArray(d) ? d : []);
          setProposals(Array.isArray(p) ? p : []);
        })
        .finally(() => setLoadingMeta(false));
    }
  }, [open]);

  // Initialize form based on defaultValues and mode
  useEffect(() => {
    if (!open) return;
    setErrors({});
    
    if (!defaultValues) {
      // Fresh create: no defaults
      setForm(empty);
      return;
    }

    if (isEdit) {
      // Editing existing: use id
      setForm({
        intervention: String(defaultValues.id),
        decision: defaultValues.decision?.id ?? "none",
        decision_date: defaultValues.decision_date ?? "",
        feedback: defaultValues.feedback ?? "",
        notes: "",
        additional_info: "",
      });
    } else if (isCreate) {
      // Creating from scored intervention: pre-fill with reference_number
      // Will be resolved to intervention_id once proposals load
      setForm({
        intervention: defaultValues.reference_number ?? "",
        decision: "none",
        decision_date: "",
        feedback: "",
        notes: "",
        additional_info: "",
      });
    }
  }, [open, defaultValues, isEdit, isCreate]);

  // Resolve reference_number → proposal id once proposals are available (null-id rows)
  useEffect(() => {
    if (!proposals.length || !defaultValues || !isCreate) return;
    
    const ref = defaultValues.reference_number;
    if (!ref) return;
    
    const match = proposals.find((p) => p.reference_number === ref);
    if (match) {
      setForm((f) => ({ ...f, intervention: match.id }));
    }
  }, [proposals, defaultValues, isCreate]);

  const setField = useCallback(
    <K extends keyof FormState>(field: K) =>
      (value: FormState[K]) =>
        setForm((f) => ({ ...f, [field]: value })),
    []
  );

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.intervention) e.intervention = "Select an intervention";
    if (form.decision !== "none" && !form.decision_date)
      e.decision_date = "Required when a decision is set";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Resolve intervention_id from form.intervention
    // If form.intervention contains an intervention_id (from edit or resolved from reference_number),
    // extract it; otherwise assume it's already the id
    let interventionId = form.intervention;

    // If in create mode, form.intervention should now be a proposal.id
    // If in edit mode, form.intervention is the update record id, but we need the intervention_id
    if (isEdit && defaultValues?.intervention_id) {
      interventionId = defaultValues.intervention_id;
    } else {
      // In create mode or fresh create, form.intervention is a proposal id
      const proposal = proposals.find((p) => p.id === form.intervention);
      if (proposal) {
        interventionId = proposal.id;
      }
    }

    await onSubmit({
      intervention: interventionId,
      decision: form.decision !== "none" ? form.decision : null,
      decision_date: form.decision_date || null,
      feedback: form.feedback,
      notes: form.notes,
      additional_info: form.additional_info,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-lg lg:max-w-2xl px-1 lg:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {isEdit ? "Edit Review Status" : "Assign Review Status"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the HTA review status for this intervention."
              : isCreate
                ? `Assign an initial review status to ${defaultValues?.intervention_name}.`
                : "Assign a review status to a submitted intervention."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          {/* Intervention */}
          <div className="space-y-1.5">
            <Label>Intervention <span className="text-destructive">*</span></Label>
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading interventions…
              </div>
            ) : (
              <InterventionPicker
                proposals={proposals}
                value={form.intervention}
                onChange={setField("intervention")}
                disabled={isEdit}
                error={errors.intervention}
              />
            )}
            {errors.intervention && (
              <p className="text-xs text-destructive">{errors.intervention}</p>
            )}
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
            {errors.decision_date && (
              <p className="text-xs text-destructive">{errors.decision_date}</p>
            )}
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