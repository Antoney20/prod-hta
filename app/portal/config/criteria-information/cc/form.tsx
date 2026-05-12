"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

import { CriteriaInformation, CriteriaInformationPayload, InterventionSearchResult } from "@/types/new/criteria-info";
import { InterventionSystemCategory } from "@/types/new/client";
import { searchInterventions } from "@/app/api/new/search";
import { getInterventionCategories } from "@/app/api/new/client";
import { createCriteriaInfo, updateCriteriaInfo, getAllCriteriaInfo } from "@/app/api/new/criteria-info";
import { sanitizeHtml } from "./clean";
import { toast } from "react-toastify";


type BODType = "DALY" | "QALY" | "PREVALENCE" | "INCIDENCE";
type SubmitState = "idle" | "submitting" | "success" | "error";

const BOD_OPTIONS: { value: BODType; label: string }[] = [
  { value: "DALY", label: "DALY" },
  { value: "QALY", label: "QALY" },
  { value: "PREVALENCE", label: "Prevalence" },
  { value: "INCIDENCE", label: "Incidence" },
];

const CRITERIA_FIELDS: { key: keyof CriteriaInformationPayload; label: string; description?: string }[] = [
  { key: "brief_info", label: "Brief Information", description: "Short summary of the intervention" },
  { key: "clinical_effectiveness", label: "Clinical Effectiveness, Safety, and Quality of The Intervention.", description: "Evidence on clinical outcomes" },
  { key: "burden_of_disease", label: "Burden of Disease", description: "Disease burden data and evidence" },
  { key: "population", label: "Population", description: "Target population details" },
  { key: "equity", label: "Equity", description: "Equity and fairness considerations" },
  { key: "cost_effectiveness", label: "Cost Effectiveness", description: "Economic evaluation evidence" },
  { key: "budget_impact_affordability", label: "Budget Impact & Affordability", description: "Fiscal implications" },
  { key: "feasibility_of_implementation", label: "Feasibility of Implementation", description: "Implementation challenges and enablers" },
  { key: "catastrophic_health_expenditure", label: "Catastrophic Health Expenditure", description: "Financial risk protection" },
  { key: "access_to_healthcare", label: "Access to Healthcare", description: "Accessibility and availability" },
  { key: "congruence_with_health_priorities", label: "Congruence with Health Priorities", description: "Alignment with national priorities" },
  { key: "additional_info", label: "Additional Information", description: "Any other relevant details" },
];

interface FormState extends Omit<CriteriaInformationPayload, "bod_type"> {
  bod_type: BODType | null;
}

const EMPTY_FORM: FormState = {
  intervention: "",
  system_category: null,
  brief_info: null,
  clinical_effectiveness: null,
  burden_of_disease: null,
  bod_type: null,
  population: null,
  equity: null,
  cost_effectiveness: null,
  budget_impact_affordability: null,
  feasibility_of_implementation: null,
  catastrophic_health_expenditure: null,
  access_to_healthcare: null,
  congruence_with_health_priorities: null,
  additional_info: null,
  title: null,
};

function getDraftKey(editId?: string) {
  return editId ? `criteria_draft_edit_${editId}` : "criteria_draft_new";
}

function saveDraft(form: FormState, editId?: string) {
  try {
    localStorage.setItem(getDraftKey(editId), JSON.stringify(form));
  } catch { /* storage full / unavailable — silently ignore */ }
}

function loadDraft(editId?: string): FormState | null {
  try {
    const raw = localStorage.getItem(getDraftKey(editId));
    return raw ? (JSON.parse(raw) as FormState) : null;
  } catch {
    return null;
  }
}

export function clearDraft(editId?: string) {
  try {
    localStorage.removeItem(getDraftKey(editId));
  } catch { /* ignore */ }
}

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
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
      const clean = sanitizeHtml(html);
      document.execCommand("insertHTML", false, clean);
    } else if (plain) {
      document.execCommand("insertText", false, plain);
    }
  };

  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "flex", gap: 2, padding: "6px 8px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap" }}>
        {[
          { cmd: "bold",      icon: "B", style: { fontWeight: 700 } },
          { cmd: "italic",    icon: "I", style: { fontStyle: "italic" as const } },
          { cmd: "underline", icon: "U", style: { textDecoration: "underline" as const } },
        ].map(({ cmd, icon, style }) => (
          <button key={cmd} onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            style={{ ...style, padding: "2px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: "#374151" }}>
            {icon}
          </button>
        ))}
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}
          style={{ padding: "2px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: "#374151" }}>
          • List
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }}
          style={{ padding: "2px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: "#374151" }}>
          1. List
        </button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Enter URL");
          if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
        }} style={{ padding: "2px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: "#374151" }}>
          Link
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight: 120, padding: "10px 12px", outline: "none", fontSize: 13, color: "#111827", lineHeight: 1.6, overflowY: "auto", maxHeight: 280 }}
      />
      <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }`}</style>
    </div>
  );
}

// ── Intervention search ──────────────────────────────────────────────────────

interface InterventionSearchInputProps {
  value: InterventionSearchResult | null;
  onChange: (result: InterventionSearchResult) => Promise<void>;
  disabled?: boolean;
  checking?: boolean;
}

function InterventionSearchInput({ value, onChange, disabled, checking }: InterventionSearchInputProps) {
  const [query, setQuery] = useState(value ? `${value.reference_number} — ${value.intervention_name}` : "");
  const [results, setResults] = useState<InterventionSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timer.current);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchInterventions(q);
      setResults(res);
      setOpen(true);
      setLoading(false);
    }, 350);
  };

  const select = async (r: InterventionSearchResult) => {
    setOpen(false);
    await onChange(r);

  };


  useEffect(() => {
    if (value) {
      setQuery(`${value.reference_number} — ${value.intervention_name}`);
    }
  }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Search by reference no. or intervention name…"
          style={{
            width: "100%", padding: "9px 36px 9px 12px", border: "1px solid #d1d5db",
            borderRadius: 6, fontSize: 13, color: "#111827", background: disabled ? "#f9fafb" : "#fff",
            outline: "none", boxSizing: "border-box",
          }}
        />
        {(loading || checking) && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ width: 14, height: 14, border: "2px solid #e5e7eb", borderTopColor: checking ? "#f59e0b" : "#1d4ed8", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.1)",
          zIndex: 50, maxHeight: 240, overflowY: "auto",
        }}>
          {results.map((r) => (
            <div key={r.id} onClick={() => select(r)}
              style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{r.reference_number}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{r.intervention_name}</div>
              {r.intervention_type && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{r.intervention_type}</div>}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
}


function SectionTitle({ label, description, required, badge }: { label: string; description?: string; required?: boolean; badge?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        {required && <span style={{ color: "#ef4444", fontSize: 11 }}>*</span>}
        {badge}
      </div>
      {description && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{description}</div>}
    </div>
  );
}

function SubmitBanner({ state, onDismiss }: { state: SubmitState; onDismiss?: () => void }) {
  if (state === "idle" || state === "submitting") return null;
  const isSuccess = state === "success";
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 6, fontSize: 13,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
      color: isSuccess ? "#15803d" : "#b91c1c",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{isSuccess ? "✓" : "✕"}</span>
        <span style={{ fontWeight: 600 }}>
          {isSuccess ? "Saved successfully!" : "Failed to save. Your data is preserved — please try again."}
        </span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "inherit", opacity: 0.6, padding: 0 }}>
          ×
        </button>
      )}
    </div>
  );
}


const HTML_FIELD_KEYS = new Set<keyof FormState>([
  "brief_info", "clinical_effectiveness", "burden_of_disease", "population",
  "equity", "cost_effectiveness", "budget_impact_affordability",
  "feasibility_of_implementation", "catastrophic_health_expenditure",
  "access_to_healthcare", "congruence_with_health_priorities", "additional_info",
]);

function sanitizeFormPayload(form: FormState): FormState {
  const result = { ...form };
  for (const key of HTML_FIELD_KEYS) {
    const raw = form[key];
    if (typeof raw === "string" && raw.trim()) {
      (result as Record<string, unknown>)[key] = sanitizeHtml(raw);
    }
  }
  return result;
}

function formIsEmpty(form: FormState): boolean {
  if (form.intervention) return false;
  for (const key of HTML_FIELD_KEYS) {
    const v = form[key];
    if (v && typeof v === "string" && v.trim()) return false;
  }
  return true;
}

export interface CriteriaFormProps {
  initial?: CriteriaInformation | null;
  onSuccess: () => void;
  /**
   * Called when the form wants to close itself (cancel button / × button).
   * The parent is responsible for actually unmounting the form; this callback
   * only fires after the parent has confirmed it's OK to close.
   */
  onCancel: () => void;
  /**
   * Ref the parent can use to ask "does this form have unsaved changes?".
   * The parent calls `hasChangesRef.current()` before closing the modal.
   */
  hasChangesRef?: React.MutableRefObject<() => boolean>;
}

export function CriteriaForm({ initial, onSuccess, onCancel, hasChangesRef }: CriteriaFormProps) {
  const isEdit = !!initial;
  const editId = initial?.id;

  // ── initialise form — prefer a saved draft ───────────────────────────────
  const [form, setForm] = useState<FormState>(() => {
    const draft = loadDraft(editId);
    if (draft) return draft;
    if (!initial) return EMPTY_FORM;
    return { ...initial, bod_type: (initial.bod_type as BODType) ?? null };
  });

  const [selectedIntervention, setSelectedIntervention] = useState<InterventionSearchResult | null>(null);
  const [categories, setCategories] = useState<InterventionSystemCategory[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // ── expose hasChanges to parent ──────────────────────────────────────────
  const initialFormRef = useRef<FormState>(
    initial ? { ...initial, bod_type: (initial.bod_type as BODType) ?? null } : EMPTY_FORM
  );

  const hasChanges = useCallback((): boolean => {
    if (formIsEmpty(form)) return false;
    return JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
  }, [form]);

  useEffect(() => {
    if (hasChangesRef) hasChangesRef.current = hasChanges;
  }, [hasChanges, hasChangesRef]);


  useEffect(() => {
    if (formIsEmpty(form)) {
      clearDraft(editId);
      return;
    }
    saveDraft(form, editId);
  }, [form, editId]);

  useEffect(() => {
    if (!form.intervention) { setCategories([]); return; }
    getInterventionCategories(form.intervention).then((res: any) => {
      const arr = Array.isArray(res) ? res : (res?.results ?? []);
      setCategories(arr);
    });
  }, [form.intervention]);

  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const handleInterventionSelect = async (r: InterventionSearchResult) => {
    setCheckingDuplicate(true);
    const all = await getAllCriteriaInfo();
    setCheckingDuplicate(false);
    const duplicate = all.find((c) => c.intervention === r.id);
    if (duplicate) {
      toast.warning(
        `"${r.intervention_name}" already has criteria information. Edit the existing record instead.`,
        { autoClose: 5000 }
      );
      return;
    }
    setSelectedIntervention(r);
    setField("intervention", r.id);
  };

  const handleSubmit = async () => {
    if (!form.intervention) {
      toast.warning("Please select an intervention before saving.");
      return;
    }
    setSubmitState("submitting");

    const sanitized = sanitizeFormPayload(form);
    const payload: CriteriaInformationPayload = {
      ...sanitized,
      bod_type: sanitized.bod_type ?? null,
    };

    const res = isEdit
      ? await updateCriteriaInfo(initial!.id, payload)
      : await createCriteriaInfo(payload);

    if (!res) {
      setSubmitState("error");
      return;
    }

    // Clear draft on successful save
    clearDraft(editId);
    setSubmitState("success");
    setTimeout(() => onSuccess(), 900);
  };

  const isSubmitting = submitState === "submitting";

  const resolvedCategory: string | null =
    categories.length > 0
      ? (categories[0] as any)?.system_category_detail?.name ?? null
      : (initial as any)?.system_category_name ?? null;

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
      {/* Header */}
      <div style={{
        padding: "18px 28px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderRadius: "8px 8px 0 0",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontFamily: "'Georgia', serif" }}>
            {isEdit ? "Edit Criteria Information" : "New Criteria Information"}
          </div>
          {isEdit && initial?.intervention_name && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", marginTop: 3 }}>
              {initial.intervention_name}
            </div>
          )}
          {!isEdit && (
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
              Complete the HTA criteria fields below
            </div>
          )}
        </div>
        <button
          onClick={onCancel}
          aria-label="Close"
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "1px solid #e5e7eb",
            background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18, color: "#6b7280", lineHeight: 1, flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#b91c1c"; e.currentTarget.style.borderColor = "#fca5a5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Intervention selector */}
        <section>
          <SectionTitle label="Intervention" required />
          <InterventionSearchInput
            value={selectedIntervention}
            onChange={handleInterventionSelect}
            disabled={isEdit}
            checking={checkingDuplicate}
          />
          {selectedIntervention && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>{selectedIntervention.reference_number}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginLeft: 8 }}>{selectedIntervention.intervention_name}</span>
            </div>
          )}
        </section>

        {/* System Category — read-only */}
        <section>
          <SectionTitle label="System Category" />
          <div style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", fontSize: 13 }}>
            {resolvedCategory
              ? <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{resolvedCategory}</span>
              : <span style={{ color: "#ef4444", fontWeight: 500 }}>Not assigned</span>
            }
          </div>
        </section>

        {/* Criteria fields */}
        {CRITERIA_FIELDS.map(({ key, label, description }) => (
          <section key={key}>
            <SectionTitle
              label={label}
              description={description}
              badge={key === "burden_of_disease" && form.bod_type
                ? <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                    {form.bod_type}
                  </span>
                : undefined
              }
            />
            {key === "burden_of_disease" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {BOD_OPTIONS.map(({ value, label: optLabel }) => {
                  const active = form.bod_type === value;
                  return (
                    <button key={value}
                      onClick={() => setField("bod_type", active ? null : value)}
                      type="button"
                      style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        background: active ? "#1d4ed8" : "#f1f5f9",
                        color: active ? "#fff" : "#475569",
                        border: active ? "1px solid #1d4ed8" : "1px solid #e2e8f0",
                      }}>
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            )}
            <RichEditor
              value={form[key] as string ?? ""}
              onChange={(v) => setField(key, v || null)}
              placeholder={`Enter ${label.toLowerCase()}…`}
            />
          </section>
        ))}

        <SubmitBanner
          state={submitState}
          onDismiss={submitState === "error" ? () => setSubmitState("idle") : undefined}
        />

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onCancel} disabled={isSubmitting}
            style={{ padding: "9px 20px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.intervention || submitState === "success"}
            style={{
              padding: "9px 24px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: isSubmitting || submitState === "success" ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              background: submitState === "success" ? "#15803d" : isSubmitting ? "#93c5fd" : "#1d4ed8",
              color: "#fff", display: "flex", alignItems: "center", gap: 6, minWidth: 110, justifyContent: "center",
            }}>
            {submitState === "submitting" && (
              <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            )}
            {submitState === "success" ? "✓ Saved!" : submitState === "submitting" ? "Saving…" : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}