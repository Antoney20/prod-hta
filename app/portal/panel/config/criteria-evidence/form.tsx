"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppraisalCriteriaEvidence, AppraisalCriteriaEvidencePayload } from "@/types/new/appraisal-evidence";
import { toast } from "react-toastify";
import { InterventionSearchResult } from "@/types/new/criteria-info";
import { searchInterventions } from "@/app/api/new/search";
import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";
import { createAppraisalEvidence, getAppraisalEvidence, updateAppraisalEvidence } from "@/app/api/criteria/evidence";
import { RichEditor } from "@/components/shared/editor";


type SubmitState = "idle" | "submitting" | "success" | "error";

interface FormState {
  intervention: string;
  brief_info: string | null;
  clinical_effectiveness: string | null;
  safety: string | null;
  quality: string | null;
  burden_of_disease_mortality: string | null;
  burden_of_disease_morbidity: string | null;
  population: string | null;
  equity: string | null;
  cost_effectiveness: string | null;
  budget_impact_affordability: string | null;
  feasibility_of_implementation: string | null;
  catastrophic_health_expenditure: string | null;
  access_to_healthcare: string | null;
  congruence_with_health_priorities: string | null;
  additional_info: string | null;
}

const EMPTY_FORM: FormState = {
  intervention: "",
  brief_info: null,
  clinical_effectiveness: null,
  safety: null,
  quality: null,
  burden_of_disease_mortality: null,
  burden_of_disease_morbidity: null,
  population: null,
  equity: null,
  cost_effectiveness: null,
  budget_impact_affordability: null,
  feasibility_of_implementation: null,
  catastrophic_health_expenditure: null,
  access_to_healthcare: null,
  congruence_with_health_priorities: null,
  additional_info: null,
};

const RICH_FIELDS: { key: keyof Omit<FormState, "intervention">; label: string; description?: string }[] = [
  { key: "brief_info",                        label: "Brief Information",                                description: "Short summary of the intervention evidence" },
  { key: "clinical_effectiveness",            label: "Clinical Effectiveness",                           description: "Evidence on clinical outcomes" },
  { key: "safety",                            label: "Safety",                                           description: "Safety profile of the intervention" },
  { key: "quality",                           label: "Quality",                                          description: "Quality of evidence and intervention delivery" },
  { key: "burden_of_disease_mortality",       label: "Burden of Disease — Mortality",                    description: "Mortality burden data and evidence" },
  { key: "burden_of_disease_morbidity",       label: "Burden of Disease — Incidence / Occurrence",       description: "Morbidity, incidence, and occurrence of diseases" },
  { key: "population",                        label: "Population",                                       description: "Target population details" },
  { key: "equity",                            label: "Equity",                                           description: "Equity and fairness considerations" },
  { key: "cost_effectiveness",                label: "Cost Effectiveness",                               description: "Economic evaluation evidence" },
  { key: "budget_impact_affordability",       label: "Budgetary Impact & Affordability",                 description: "Fiscal implications of the intervention" },
  { key: "feasibility_of_implementation",     label: "Feasibility of Implementation",                    description: "Implementation challenges and enablers" },
  { key: "catastrophic_health_expenditure",   label: "Catastrophic Health Expenditure",                  description: "Financial risk protection" },
  { key: "access_to_healthcare",              label: "Access to Healthcare",                             description: "Accessibility and availability" },
  { key: "congruence_with_health_priorities", label: "Congruence with Existing Health Priorities",       description: "Alignment with national health sector priorities" },
  { key: "additional_info",                   label: "Additional Information",                           description: "Any other relevant details" },
];

const HTML_FIELD_KEYS = new Set(RICH_FIELDS.map((f) => f.key));


function getDraftKey(editId?: string) {
  return editId ? `evidence_draft_edit_${editId}` : "evidence_draft_new";
}
function saveDraft(form: FormState, editId?: string) {
  try { localStorage.setItem(getDraftKey(editId), JSON.stringify(form)); } catch { /* ignore */ }
}
function loadDraft(editId?: string): FormState | null {
  try {
    const raw = localStorage.getItem(getDraftKey(editId));
    return raw ? (JSON.parse(raw) as FormState) : null;
  } catch { return null; }
}
export function clearDraft(editId?: string) {
  try { localStorage.removeItem(getDraftKey(editId)); } catch { /* ignore */ }
}


function sanitizeFormPayload(form: FormState): FormState {
  const result = { ...form };
  for (const key of HTML_FIELD_KEYS) {
    const raw = form[key as keyof FormState];
    if (typeof raw === "string" && raw.trim()) {
      (result as Record<string, unknown>)[key] = sanitizeHtml(raw);
    }
  }
  return result;
}

function formIsEmpty(form: FormState): boolean {
  if (form.intervention) return false;
  for (const key of HTML_FIELD_KEYS) {
    const v = form[key as keyof FormState];
    if (v && typeof v === "string" && v.trim()) return false;
  }
  return true;
}

function fromInitial(initial: AppraisalCriteriaEvidence): FormState {
  return {
    intervention:                     initial.intervention,
    brief_info:                       initial.brief_info,
    clinical_effectiveness:           initial.clinical_effectiveness,
    safety:                           initial.safety,
    quality:                          initial.quality,
    burden_of_disease_mortality:      initial.burden_of_disease_mortality,
    burden_of_disease_morbidity:      initial.burden_of_disease_morbidity,
    population:                       initial.population,
    equity:                           initial.equity,
    cost_effectiveness:               initial.cost_effectiveness,
    budget_impact_affordability:      initial.budget_impact_affordability,
    feasibility_of_implementation:    initial.feasibility_of_implementation,
    catastrophic_health_expenditure:  initial.catastrophic_health_expenditure,
    access_to_healthcare:             initial.access_to_healthcare,
    congruence_with_health_priorities: initial.congruence_with_health_priorities,
    additional_info:                  initial.additional_info,
  };
}


function SectionTitle({ label, description, required }: { label: string; description?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        {required && <span style={{ color: "#ef4444", fontSize: 11 }}>*</span>}
      </div>
      {description && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{description}</div>}
    </div>
  );
}

function SubmitBanner({ state, onDismiss }: { state: SubmitState; onDismiss?: () => void }) {
  if (state === "idle" || state === "submitting") return null;
  const ok = state === "success";
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 6, fontSize: 13, display: "flex",
      alignItems: "center", justifyContent: "space-between",
      background: ok ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
      color: ok ? "#15803d" : "#b91c1c",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{ok ? "✓" : "✕"}</span>
        <span style={{ fontWeight: 600 }}>
          {ok ? "Saved successfully!" : "Failed to save. Your data is preserved — please try again."}
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

function InterventionSearchInput({ value, onChange, disabled, checking }: {
  value: InterventionSearchResult | null;
  onChange: (result: InterventionSearchResult) => Promise<void>;
  disabled?: boolean;
  checking?: boolean;
}) {
  const [query, setQuery] = useState(value ? `${value.reference_number} — ${value.intervention_name}` : "");
  const [results, setResults] = useState<InterventionSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (value) setQuery(`${value.reference_number} — ${value.intervention_name}`);
  }, [value]);

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
            <div key={r.id} onClick={() => { setOpen(false); onChange(r); }}
              style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
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


export interface EvidenceFormProps {
  initial?: AppraisalCriteriaEvidence | null;
  onSuccess: () => void;
  onCancel: () => void;
  hasChangesRef?: React.MutableRefObject<() => boolean>;
}

export function EvidenceForm({ initial, onSuccess, onCancel, hasChangesRef }: EvidenceFormProps) {
  const isEdit = !!initial;
  const editId = initial?.id;

  const [form, setForm] = useState<FormState>(() => {
    const draft = loadDraft(editId);
    if (draft) return draft;
    if (!initial) return EMPTY_FORM;
    return fromInitial(initial);
  });

  const [selectedIntervention, setSelectedIntervention] = useState<InterventionSearchResult | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const initialFormRef = useRef<FormState>(initial ? fromInitial(initial) : EMPTY_FORM);

  const hasChanges = useCallback((): boolean => {
    if (formIsEmpty(form)) return false;
    return JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
  }, [form]);

  useEffect(() => {
    if (hasChangesRef) hasChangesRef.current = hasChanges;
  }, [hasChanges, hasChangesRef]);

  useEffect(() => {
    if (formIsEmpty(form)) { clearDraft(editId); return; }
    saveDraft(form, editId);
  }, [form, editId]);

  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const handleInterventionSelect = async (r: InterventionSearchResult) => {
    setCheckingDuplicate(true);
    const all = await getAppraisalEvidence();
    setCheckingDuplicate(false);
    const duplicate = all.find((e) => e.intervention === r.id);
    if (duplicate) {
      toast.warning(
        `"${r.intervention_name}" already has appraisal evidence. Edit the existing record instead.`,
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

    const res = isEdit
      ? await updateAppraisalEvidence(initial!.id, sanitized)
      : await createAppraisalEvidence(sanitized as AppraisalCriteriaEvidencePayload);

    if (res.error || !res.data) {
      setSubmitState("error");
      toast.error(res.error ?? "Failed to save.");
      return;
    }

    clearDraft(editId);
    setSubmitState("success");
    setTimeout(() => onSuccess(), 900);
  };

  const isSubmitting = submitState === "submitting";

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
            {isEdit ? "Edit Appraisal Evidence" : "New Appraisal Evidence"}
          </div>
          {isEdit && initial?.intervention_name && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", marginTop: 3 }}>
              {initial.intervention_name}
            </div>
          )}
          {!isEdit && (
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
              Complete the appraisal evidence fields below
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

        {/* Rich text fields */}
        {RICH_FIELDS.map(({ key, label, description }) => (
          <section key={key}>
            <SectionTitle label={label} description={description} />
            <RichEditor
              value={(form[key as keyof FormState] as string) ?? ""}
              onChange={(v) => setField(key as keyof FormState, (v || null) as any)}
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
            }}
          >
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