"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, BookOpen, FileText, Info } from "lucide-react";
import { PanelIntervention, CriteriaAppraisalTool } from "@/types/new/panel-appraisal";
import { AppraisalCriteriaEvidence } from "@/types/new/appraisal-evidence";

const BRAND = "#27aae1";

// ── Criteria name → evidence field mapping ────────────────────────────────────
// Each entry maps keywords found in a criteria name to the model field that
// holds the corresponding evidence. Scored by keyword hit count (best match wins).

const CRITERIA_TO_EVIDENCE_FIELD: {
  keywords: string[];
  field: keyof AppraisalCriteriaEvidence;
  label: string;
}[] = [
  { keywords: ["clinical", "effectiveness"],          field: "clinical_effectiveness",            label: "Clinical Effectiveness" },
  { keywords: ["safety"],                             field: "safety",                            label: "Safety" },
  { keywords: ["quality"],                            field: "quality",                           label: "Quality" },
  { keywords: ["burden", "mortality"],                field: "burden_of_disease_mortality",       label: "Burden of Disease — Mortality" },
  { keywords: ["burden", "morbidity", "incidence"],   field: "burden_of_disease_morbidity",       label: "Burden of Disease — Morbidity" },
  { keywords: ["population"],                         field: "population",                        label: "Population" },
  { keywords: ["equity"],                             field: "equity",                            label: "Equity" },
  { keywords: ["cost", "effectiveness"],              field: "cost_effectiveness",                label: "Cost Effectiveness" },
  { keywords: ["budget", "affordability"],            field: "budget_impact_affordability",       label: "Budgetary Impact & Affordability" },
  { keywords: ["feasibility", "implementation"],      field: "feasibility_of_implementation",     label: "Feasibility of Implementation" },
  { keywords: ["catastrophic", "expenditure"],        field: "catastrophic_health_expenditure",   label: "Catastrophic Health Expenditure" },
  { keywords: ["access", "healthcare"],               field: "access_to_healthcare",              label: "Access to Healthcare" },
  { keywords: ["congruence", "priorities", "uhc"],    field: "congruence_with_health_priorities", label: "Congruence with Health Priorities" },
];

interface MatchResult {
  field: keyof AppraisalCriteriaEvidence;
  label: string;
}

function getEvidenceMatch(criteriaName: string): MatchResult | null {
  const lower = criteriaName.toLowerCase();
  let best: (MatchResult & { hits: number }) | null = null;
  for (const entry of CRITERIA_TO_EVIDENCE_FIELD) {
    const hits = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { field: entry.field, label: entry.label, hits };
    }
  }
  return best ? { field: best.field, label: best.label } : null;
}

function hasValue(val: unknown): val is string {
  return typeof val === "string" && val.trim().length > 0;
}

// ── HTML renderer ─────────────────────────────────────────────────────────────

function HtmlContent({ html, clamp = false }: { html: string; clamp?: boolean }) {
  return (
    <div
      className={[
        "text-sm text-slate-700 leading-relaxed",
        "[&_p]:mb-1.5 [&_p:last-child]:mb-0",
        "[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-1.5",
        "[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-1.5",
        "[&_li]:leading-relaxed",
        "[&_b]:font-semibold [&_strong]:font-semibold",
        "[&_span]:leading-relaxed",
        clamp ? "line-clamp-2" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Evidence section block ────────────────────────────────────────────────────

function EvidenceSection({
  title,
  html,
  highlight = false,
}: {
  title: string;
  html: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {title}
      </p>
      <div
        className={[
          "rounded-md px-4 py-3 leading-relaxed",
          "[&_p]:mb-2 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
          "[&_li]:leading-relaxed [&_b]:font-semibold [&_strong]:font-semibold",
          highlight
            ? "border border-[#27aae1]/20 bg-[#27aae1]/5 text-slate-700"
            : "border border-slate-100 bg-slate-50 text-slate-600",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function NoInfo({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-3 px-3 rounded-md border border-slate-100 bg-slate-50 text-slate-400">
      <Info className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <p className="text-xs italic">
        {label
          ? `No ${label.toLowerCase()} information available.`
          : "No information available for this criterion."}
      </p>
    </div>
  );
}

// ── Intervention header ───────────────────────────────────────────────────────

export function InterventionHeaderPanel({
  intervention,
}: {
  intervention: PanelIntervention;
}) {
  return (
    <div
      className="rounded-xl border px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}
    >
      {/* Left — name + description */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: BRAND }}
        >
          Intervention under review
        </p>
        <h2 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
          {intervention.intervention_name}
        </h2>
      </div>

      {/* Right — badges */}
      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 shrink-0 flex-wrap">
        {intervention.reference_number && (
          <Badge
            variant="outline"
            className="font-mono text-xs"
            style={{ borderColor: `${BRAND}40`, color: BRAND }}
          >
            {intervention.reference_number}
          </Badge>
        )}
        {intervention.system_categories?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {intervention.system_categories.slice(0, 2).map((sc) => (
              <Badge key={sc} variant="secondary" className="text-xs line-clamp-1 max-w-[180px]">
                {sc}
              </Badge>
            ))}
            {intervention.system_categories.length > 2 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                +{intervention.system_categories.length - 2} more
              </Badge>
            )}
          </div>
        )}
        {intervention.decision && (
          <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
            {intervention.decision.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── No evidence lock ──────────────────────────────────────────────────────────

export function NoEvidencePanel() {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <div className="bg-amber-100 p-3 rounded-full">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">No Evidence Available</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed max-w-sm">
            Appraisal evidence has not been submitted for this intervention yet.
            Scoring is locked until evidence is available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Evidence panel ────────────────────────────────────────────────────────────
// activeCriteriaName is now the GROUP NAME (e.g. "Access to healthcare")
// passed up from the wizard via onActiveCriteriaChange.
// criteria list is used only for the deduped coverage sidebar.

export function AppraisalEvidencePanel({
  evidence,
  activeCriteriaName,
  criteria,
}: {
  evidence: AppraisalCriteriaEvidence[];
  activeCriteriaName: string;       // group name from wizard
  criteria: CriteriaAppraisalTool[];
}) {
  const evidenceRecord = evidence[0] ?? null;

  // Resolve matched field for the active criteria name
  const match = activeCriteriaName ? getEvidenceMatch(activeCriteriaName) : null;
  const matchedContent =
    match && evidenceRecord
      ? (evidenceRecord[match.field] as string | null)
      : null;

  const briefInfo = evidenceRecord?.brief_info ?? null;
  const additionalInfo = evidenceRecord?.additional_info ?? null;

  // Deduplicate criteria by group name for the coverage list
  const uniqueCriteriaNames = Array.from(
    new Map(criteria.map((c) => [c.criteria.trim(), c])).values()
  );

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div
        className="px-4 sm:px-5 py-4 border-b border-slate-100"
        style={{ background: `${BRAND}08` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: BRAND }}
          >
            Appraisal Evidence
          </p>
        </div>

        {activeCriteriaName ? (
          <p className="text-xs font-semibold text-slate-700 line-clamp-2 mt-1">
            {activeCriteriaName}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mt-1">
            Navigate to a criterion to see its evidence.
          </p>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* No criteria selected yet */}
        {!activeCriteriaName && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <FileText className="h-8 w-8 opacity-20" />
            <p className="text-sm">Select a criterion to view evidence</p>
          </div>
        )}

        {/* No evidence record at all */}
        {activeCriteriaName && !evidenceRecord && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
            <Info className="h-6 w-6 opacity-30" />
            <p className="text-sm text-center">No evidence record for this intervention.</p>
          </div>
        )}

        {/* Evidence content */}
        {activeCriteriaName && evidenceRecord && (
          <div className="space-y-4">

            {/* ── Brief info ── */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Brief Information
              </p>
              {hasValue(briefInfo)
                ? <EvidenceSection title="" html={briefInfo} />
                : <NoInfo label="Brief" />}
            </div>

            <Separator className="bg-slate-100" />

            {/* ── Criterion-specific evidence ── */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {match?.label ?? activeCriteriaName}
              </p>
              {hasValue(matchedContent)
                ? <EvidenceSection title="" html={matchedContent} highlight />
                : <NoInfo />}
            </div>

            {/* ── Additional info ── */}
            {(hasValue(additionalInfo) || true) && (
              <>
                <Separator className="bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Additional Information
                  </p>
                  {hasValue(additionalInfo)
                    ? <EvidenceSection title="" html={additionalInfo} />
                    : <NoInfo label="Additional" />}
                </div>
              </>
            )}

          </div>
        )}


      </CardContent>
    </Card>
  );
}