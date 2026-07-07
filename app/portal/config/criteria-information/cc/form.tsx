"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

import RichEditor from "@/components/shared/editor";
import {
  CriteriaInformation,
  CriteriaInformationPayload,
  CriteriaTargetType,
  BODType,
} from "@/types/new/criteria-info";
import { PublicProposal } from "@/types/new/public";
import { ProgramProposal } from "@/types/new/program";
import { getPublicProposals } from "@/app/api/public";
import { getNationalPrograms } from "@/app/api/new/search";
import { createCriteriaInfo, updateCriteriaInfo, getAllCriteriaInfo } from "@/app/api/new/criteria-info";
import { sanitizeHtml } from "./clean";

type SubmitState = "idle" | "submitting" | "success" | "error";

const BOD_OPTIONS: { value: BODType; label: string }[] = [
  { value: "DALY", label: "DALY" },
  { value: "QALY", label: "QALY" },
  { value: "PREVALENCE", label: "Prevalence" },
  { value: "INCIDENCE", label: "Incidence" },
];

type CriteriaKey =
  | "brief_info" | "clinical_effectiveness" | "burden_of_disease" | "population"
  | "equity" | "cost_effectiveness" | "budget_impact_affordability"
  | "feasibility_of_implementation" | "catastrophic_health_expenditure"
  | "access_to_healthcare" | "congruence_with_health_priorities" | "additional_info";

const CRITERIA_FIELDS: { key: CriteriaKey; label: string; description?: string }[] = [
  { key: "brief_info", label: "Brief Information", description: "Short summary of the proposal" },
  { key: "clinical_effectiveness", label: "Clinical Effectiveness, Safety, and Quality.", description: "Evidence on clinical outcomes" },
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

const HTML_FIELD_KEYS: CriteriaKey[] = [
  "brief_info", "clinical_effectiveness", "burden_of_disease", "population",
  "equity", "cost_effectiveness", "budget_impact_affordability",
  "feasibility_of_implementation", "catastrophic_health_expenditure",
  "access_to_healthcare", "congruence_with_health_priorities", "additional_info",
];

interface FormState {
  target_type: CriteriaTargetType;
  target_id: string;
  bod_type: BODType | null;
  brief_info: string | null;
  clinical_effectiveness: string | null;
  burden_of_disease: string | null;
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
  target_type: "intervention",
  target_id: "",
  bod_type: null,
  brief_info: null,
  clinical_effectiveness: null,
  burden_of_disease: null,
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

function fromInitial(initial: CriteriaInformation): FormState {
  const isNational = initial.target_type === "national_proposal";
  return {
    target_type: initial.target_type,
    target_id: (isNational ? initial.national_proposal : initial.intervention) ?? "",
    bod_type: initial.bod_type ?? null,
    brief_info: initial.brief_info,
    clinical_effectiveness: initial.clinical_effectiveness,
    burden_of_disease: initial.burden_of_disease,
    population: initial.population,
    equity: initial.equity,
    cost_effectiveness: initial.cost_effectiveness,
    budget_impact_affordability: initial.budget_impact_affordability,
    feasibility_of_implementation: initial.feasibility_of_implementation,
    catastrophic_health_expenditure: initial.catastrophic_health_expenditure,
    access_to_healthcare: initial.access_to_healthcare,
    congruence_with_health_priorities: initial.congruence_with_health_priorities,
    additional_info: initial.additional_info,
  };
}


function getDraftKey(editId?: string) {
  return editId ? `criteria_draft_edit_${editId}` : "criteria_draft_new";
}
function saveDraft(form: FormState, editId?: string) {
  try { localStorage.setItem(getDraftKey(editId), JSON.stringify(form)); } catch {}
}
function loadDraft(editId?: string): FormState | null {
  try {
    const raw = localStorage.getItem(getDraftKey(editId));
    return raw ? (JSON.parse(raw) as FormState) : null;
  } catch { return null; }
}
export function clearDraft(editId?: string) {
  try { localStorage.removeItem(getDraftKey(editId)); } catch {}
}

function formIsEmpty(form: FormState): boolean {
  if (form.target_id) return false;
  for (const key of HTML_FIELD_KEYS) {
    const v = form[key];
    if (v && typeof v === "string" && v.trim()) return false;
  }
  return true;
}

function sanitizeFormPayload(form: FormState): FormState {
  const result = { ...form };
  for (const key of HTML_FIELD_KEYS) {
    const raw = form[key];
    if (typeof raw === "string" && raw.trim()) result[key] = sanitizeHtml(raw);
  }
  return result;
}


interface PickOption {
  id: string;
  reference_number: string;
  name: string;
  package_name: string | null;
}

function TargetPicker({
  options, value, onChange, disabled, error,
}: {
  options: PickOption[];
  value: string;
  onChange: (opt: PickOption) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.name.toLowerCase().includes(q) || o.reference_number.toLowerCase().includes(q))
    : options;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (disabled) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", fontSize: 13 }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{selected?.reference_number}</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>{selected?.name ?? "—"}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
          border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`, borderRadius: 6,
          fontSize: 13, cursor: "pointer", background: "#fff",
        }}
      >
        {selected ? (
          <>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1d4ed8" }}>{selected.reference_number}</span>
            <span style={{ flex: 1, color: "#0f172a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name || "—"}</span>
          </>
        ) : (
          <span style={{ color: "#9ca3af", flex: 1 }}>Select…</span>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.1)",
          zIndex: 50, overflow: "hidden",
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f3f4f6" }}>
            <input
              autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or reference…"
              style={{ width: "100%", fontSize: 13, outline: "none", border: "none", background: "transparent", color: "#111827" }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No results found</div>
            ) : (
              filtered.map((o) => (
                <div key={o.id} onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                  style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", background: o.id === value ? "#f0f4ff" : "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = o.id === value ? "#f0f4ff" : "#fff")}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{o.reference_number}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{o.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "inherit", opacity: 0.6, padding: 0 }}>×</button>
      )}
    </div>
  );
}

export interface CriteriaFormProps {
  initial?: CriteriaInformation | null;
  onSuccess: () => void;
  onCancel: () => void;
  hasChangesRef?: React.MutableRefObject<() => boolean>;
}

export function CriteriaForm({ initial, onSuccess, onCancel, hasChangesRef }: CriteriaFormProps) {
  const isEdit = !!initial;
  const editId = initial?.id;

  const [form, setForm] = useState<FormState>(() => {
    const draft = loadDraft(editId);
    if (draft) return draft;
    return initial ? fromInitial(initial) : EMPTY_FORM;
  });

  const [interventions, setInterventions] = useState<PublicProposal[]>([]);
  const [national, setNational] = useState<ProgramProposal[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const initialFormRef = useRef<FormState>(initial ? fromInitial(initial) : EMPTY_FORM);

  const hasChanges = useCallback((): boolean => {
    if (formIsEmpty(form)) return false;
    return JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
  }, [form]);

  useEffect(() => { if (hasChangesRef) hasChangesRef.current = hasChanges; }, [hasChanges, hasChangesRef]);

  useEffect(() => {
    if (formIsEmpty(form)) { clearDraft(editId); return; }
    saveDraft(form, editId);
  }, [form, editId]);

  // Fetch target lists once
  useEffect(() => {
    setLoadingMeta(true);
    Promise.all([getPublicProposals(), getNationalPrograms()])
      .then(([p, n]) => {
        setInterventions(Array.isArray(p) ? p : []);
        setNational(Array.isArray(n) ? n : []);
      })
      .finally(() => setLoadingMeta(false));
  }, []);

  const interventionOptions: PickOption[] = interventions.map((p) => ({
    id: p.id,
    reference_number: p.reference_number ?? "",
    name: p.intervention_name ?? "",
    package_name: (p as any).package_name ?? null,
  }));
  const nationalOptions: PickOption[] = national
    .filter((p) => p.reference_number)
    .map((p) => ({
      id: p.id,
      reference_number: p.reference_number,
      name: p.title ?? "",
      package_name: (p as any).package_name ?? null,
    }));

  const activeOptions = form.target_type === "intervention" ? interventionOptions : nationalOptions;
  const selectedOption = activeOptions.find((o) => o.id === form.target_id) ?? null;

  const resolvedPackage: string | null =
    selectedOption?.package_name ?? (isEdit ? initial?.package_name ?? null : null);

  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const switchTargetType = (t: CriteriaTargetType) =>
    setForm((f) => ({ ...f, target_type: t, target_id: "" }));

  const handleTargetSelect = async (opt: PickOption) => {
    setCheckingDuplicate(true);
    const all = await getAllCriteriaInfo();
    setCheckingDuplicate(false);
    const duplicate = all.find((c) =>
      form.target_type === "national_proposal"
        ? c.national_proposal === opt.id
        : c.intervention === opt.id
    );
    if (duplicate) {
      toast.warning(`"${opt.name}" already has criteria information. Edit the existing record instead.`, { autoClose: 5000 });
      return;
    }
    setField("target_id", opt.id);
  };

  const handleSubmit = async () => {
    if (!form.target_id) {
      toast.warning("Please select a proposal before saving.");
      return;
    }
    setSubmitState("submitting");

    const s = sanitizeFormPayload(form);
    const criteria: Omit<CriteriaInformationPayload, "intervention" | "national_proposal"> = {
      brief_info: s.brief_info,
      clinical_effectiveness: s.clinical_effectiveness,
      burden_of_disease: s.burden_of_disease,
      bod_type: s.bod_type,
      population: s.population,
      equity: s.equity,
      cost_effectiveness: s.cost_effectiveness,
      budget_impact_affordability: s.budget_impact_affordability,
      feasibility_of_implementation: s.feasibility_of_implementation,
      catastrophic_health_expenditure: s.catastrophic_health_expenditure,
      access_to_healthcare: s.access_to_healthcare,
      congruence_with_health_priorities: s.congruence_with_health_priorities,
      additional_info: s.additional_info,
    };

    const payload: CriteriaInformationPayload =
      form.target_type === "national_proposal"
        ? { ...criteria, national_proposal: form.target_id, intervention: null }
        : { ...criteria, intervention: form.target_id, national_proposal: null };

    const res = isEdit ? await updateCriteriaInfo(initial!.id, payload) : await createCriteriaInfo(payload);
    if (!res) { setSubmitState("error"); return; }

    clearDraft(editId);
    setSubmitState("success");
    setTimeout(() => onSuccess(), 900);
  };

  const isSubmitting = submitState === "submitting";
  const targetLabel = form.target_type === "national_proposal" ? "National Program" : "Intervention";

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "8px 8px 0 0" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontFamily: "'Georgia', serif" }}>
            {isEdit ? "Edit Criteria Information" : "New Criteria Information"}
          </div>
          {isEdit && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", marginTop: 3 }}>
              {initial?.intervention_name ?? initial?.national_proposal_name}
            </div>
          )}
          {!isEdit && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>Complete the HTA criteria fields below</div>}
        </div>
        <button onClick={onCancel} aria-label="Close"
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#6b7280", lineHeight: 1, flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#b91c1c"; e.currentTarget.style.borderColor = "#fca5a5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
          ×
        </button>
      </div>

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Target type toggle — create only */}
        {!isEdit && (
          <section>
            <SectionTitle label="Proposal type" />
            <div style={{ display: "inline-flex", border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", fontSize: 13 }}>
              {([
                { v: "intervention" as const, label: "Intervention" },
                { v: "national_proposal" as const, label: "National Program" },
              ]).map((o) => {
                const active = form.target_type === o.v;
                return (
                  <button key={o.v} type="button" onClick={() => switchTargetType(o.v)}
                    style={{ padding: "6px 16px", border: "none", cursor: "pointer", fontWeight: 600, background: active ? "#27aae1" : "#fff", color: active ? "#fff" : "#475569" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Target selector */}
        <section>
          <SectionTitle label={targetLabel} required badge={checkingDuplicate ? <span style={{ fontSize: 11, color: "#f59e0b" }}>checking…</span> : undefined} />
          {loadingMeta ? (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Loading {targetLabel.toLowerCase()}s…</div>
          ) : (
            <TargetPicker options={activeOptions} value={form.target_id} onChange={handleTargetSelect} disabled={isEdit} />
          )}
        </section>

        {/* Package — read-only */}
        <section>
          <SectionTitle label="Package" />
          <div style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", fontSize: 13 }}>
            {resolvedPackage
              ? <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{resolvedPackage}</span>
              : <span style={{ color: "#ef4444", fontWeight: 500 }}>Not assigned</span>}
          </div>
        </section>

        {/* Criteria fields */}
        {CRITERIA_FIELDS.map(({ key, label, description }) => (
          <section key={key}>
            <SectionTitle
              label={label}
              description={description}
              badge={key === "burden_of_disease" && form.bod_type
                ? <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>{form.bod_type}</span>
                : undefined}
            />
            {key === "burden_of_disease" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {BOD_OPTIONS.map(({ value, label: optLabel }) => {
                  const active = form.bod_type === value;
                  return (
                    <button key={value} type="button" onClick={() => setField("bod_type", active ? null : value)}
                      style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: active ? "#1d4ed8" : "#f1f5f9", color: active ? "#fff" : "#475569", border: active ? "1px solid #1d4ed8" : "1px solid #e2e8f0" }}>
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            )}
            <RichEditor
              value={(form[key] as string) ?? ""}
              onChange={(v: string) => setField(key, v || null)}
              placeholder={`Enter ${label.toLowerCase()}…`}
              minHeight={120}
            />
          </section>
        ))}

        <SubmitBanner state={submitState} onDismiss={submitState === "error" ? () => setSubmitState("idle") : undefined} />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onCancel} disabled={isSubmitting}
            style={{ padding: "9px 20px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting || !form.target_id || submitState === "success"}
            style={{ padding: "9px 24px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: isSubmitting || submitState === "success" ? "not-allowed" : "pointer", transition: "background 0.15s", background: submitState === "success" ? "#15803d" : isSubmitting ? "#93c5fd" : "#1d4ed8", color: "#fff", display: "flex", alignItems: "center", gap: 6, minWidth: 110, justifyContent: "center" }}>
            {isSubmitting && <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
            {submitState === "success" ? "✓ Saved!" : isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}