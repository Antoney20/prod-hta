"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, Tag, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CriteriaInformation } from "@/types/new/criteria-info";
import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";
import Link from "next/link";


function fuzzyKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 20)
    .join(" ");
}

function fuzzyMatch(a: string, b: string): boolean {
  const ka = fuzzyKey(a);
  const kb = fuzzyKey(b);
  return ka.includes(kb) || kb.includes(ka);
}

const CRITERIA_FIELD_MAP: { label: string; field: keyof CriteriaInformation }[] = [
  { label: "Clinical effectiveness safety and quality of the intervention", field: "clinical_effectiveness" },
  { label: "Burden of disease", field: "burden_of_disease" },
  { label: "Population", field: "population" },
  { label: "Equity", field: "equity" },
  { label: "Cost effectiveness", field: "cost_effectiveness" },
  { label: "Budgetary impact affordability of the intervention", field: "budget_impact_affordability" },
  { label: "Feasibility of implementation of the intervention", field: "feasibility_of_implementation" },
  { label: "Catastrophic health expenditure", field: "catastrophic_health_expenditure" },
  { label: "Access to healthcare", field: "access_to_healthcare" },
  { label: "Congruence with existing priorities in the health sector UHC Kenya Health Policy", field: "congruence_with_health_priorities" },
];

function getMatchedEntry(activeCriteriaLabel: string) {
  for (const entry of CRITERIA_FIELD_MAP) {
    if (fuzzyMatch(activeCriteriaLabel, entry.label)) return entry;
  }
  return null;
}


function HtmlContent({ html }: { html: string }) {
  const clean = sanitizeHtml(html);
  return (
    <div
      className="
        text-sm text-slate-700 leading-relaxed
        [&_p]:mb-2 [&_p:last-child]:mb-0
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-0.5
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-0.5
        [&_li]:leading-relaxed
        [&_b]:font-semibold [&_strong]:font-semibold
        [&_i]:italic [&_em]:italic
        [&_u]:underline
        [&_br]:block [&_br]:h-1
        [&_div]:mb-1 [&_div:last-child]:mb-0
        [&_a]:text-teal-600 [&_a]:underline [&_a:hover]:text-teal-800
      "
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

function CriteriaHeader({
  criteriaInfo,
  interventionId,
}: {
  criteriaInfo: CriteriaInformation;
  interventionId: string;
}) {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 -mt-6 rounded-t-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-100 mb-1">
            Criteria Information
          </p>
          <h2 className="text-sm font-bold text-white leading-snug truncate">
            {criteriaInfo.intervention_name}
          </h2>
          {criteriaInfo.system_category_name && (
            <p className="text-[11px] text-teal-200 mt-0.5 leading-snug line-clamp-1">
              {criteriaInfo.system_category_name}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent shrink-0"
          onClick={() => router.push(`/portal/interventions/${interventionId}`)}
        >
          <div className="flex flex-col items-end gap-1.5">
            {criteriaInfo.intervention_reference_number && (
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs font-mono gap-1 cursor-pointer">
                {criteriaInfo.intervention_reference_number}
                <ExternalLink className="h-2.5 w-2.5" />
              </Badge>
            )}
            {criteriaInfo.bod_type && (
              <Badge className="bg-teal-700/60 text-teal-100 border-0 text-[10px]">
                BOD: {criteriaInfo.bod_type}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}



export function BasicInfoPanel({
  criteriaInfo,
  interventionId,
}: {
  criteriaInfo: CriteriaInformation;
  interventionId: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CriteriaHeader criteriaInfo={criteriaInfo} interventionId={interventionId} />

      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-teal-500" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
            Basic Info
          </p>
        </div>

        {criteriaInfo.brief_info ? (
          <div className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3">
            <HtmlContent html={criteriaInfo.brief_info} />
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No brief info provided.</p>
        )}

        {criteriaInfo.additional_info && (
          <>
            <Separator className="bg-slate-100" />
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
                Additional Info
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-md px-4 py-3">
                <HtmlContent html={criteriaInfo.additional_info} />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}



export function ActiveCriteriaPanel({
  criteriaInfo,
  activeCriteriaLabel,
}: {
  criteriaInfo: CriteriaInformation;
  activeCriteriaLabel?: string;
}) {
  const matchedEntry = activeCriteriaLabel ? getMatchedEntry(activeCriteriaLabel) : null;
  const matchedHtml = matchedEntry
    ? (criteriaInfo[matchedEntry.field] as string | null)
    : null;


  const displayLabel = matchedEntry
    ? matchedEntry.label
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/Uhc/g, "UHC")
    : activeCriteriaLabel ?? "—";

  if (!activeCriteriaLabel) {
    return (
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-5 flex items-center justify-center py-12 text-slate-400 text-sm">
          Navigate to a criteria to see details here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-teal-500 shrink-0" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 flex-1 min-w-0 truncate">
            {displayLabel}
          </p>
          <Badge
            variant="outline"
            className="text-[10px] border-teal-200 text-teal-600 bg-teal-50 shrink-0"
          >
            Active criteria
          </Badge>
        </div>



        {matchedHtml ? (
          <div className="bg-teal-50/60 border border-teal-100 rounded-md px-4 py-3 min-h-[80px]">
            <HtmlContent html={matchedHtml} />
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-md px-4 py-3 min-h-[80px] flex flex-col justify-center gap-2">
            <p className="text-xs text-slate-400 italic">
              {matchedEntry
                ? "No information available for this criteria."
                : "No matching criteria section found."}
            </p>

            {criteriaInfo?.id && (
              <Link
                href={`/portal/tp/score/ci/${criteriaInfo.intervention}`}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium underline"
              >
                See details
              </Link>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}



export function NoCriteriaPanel() {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <div className="bg-amber-100 p-3 rounded-full">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">No Criteria Information</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed max-w-sm">
            This intervention has no available criteria info. Scoring is locked until criteria
            information is added.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CriteriaInfoDetail({
  criteriaInfo,
  interventionId,
  activeCriteriaLabel,
}: {
  criteriaInfo: CriteriaInformation | null;
  interventionId: string;
  activeCriteriaLabel?: string;
}) {
  if (!criteriaInfo) return <NoCriteriaPanel />;
  return (
    <div className="space-y-4">
      <BasicInfoPanel criteriaInfo={criteriaInfo} interventionId={interventionId} />
      <ActiveCriteriaPanel criteriaInfo={criteriaInfo} activeCriteriaLabel={activeCriteriaLabel} />
    </div>
  );
}