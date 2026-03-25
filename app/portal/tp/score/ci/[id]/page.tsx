"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, RefreshCw, ExternalLink, ChevronRight,
  Activity, Users, Scale, DollarSign, Wrench,
  HeartPulse, Stethoscope, Building2, Target,
  ShieldAlert, FileText, Info, AlertTriangle,
} from "lucide-react";
import { CriteriaInformation } from "@/types/new/criteria-info";
import { getCriteriaInfoByIntervention } from "@/app/api/new/criteria-info";
import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";


const SECTIONS: {
  key: keyof CriteriaInformation;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    key: "clinical_effectiveness",
    label: "Clinical Effectiveness, Safety & Quality",
    shortLabel: "Clinical",
    icon: Stethoscope,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  {
    key: "burden_of_disease",
    label: "Burden of Disease",
    shortLabel: "Burden",
    icon: Activity,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    key: "population",
    label: "Population",
    shortLabel: "Population",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    key: "equity",
    label: "Equity",
    shortLabel: "Equity",
    icon: Scale,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    key: "cost_effectiveness",
    label: "Cost Effectiveness",
    shortLabel: "Cost",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    key: "budget_impact_affordability",
    label: "Budget Impact & Affordability",
    shortLabel: "Budget",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "feasibility_of_implementation",
    label: "Feasibility of Implementation",
    shortLabel: "Feasibility",
    icon: Wrench,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    key: "catastrophic_health_expenditure",
    label: "Catastrophic Health Expenditure",
    shortLabel: "Catastrophic",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    key: "access_to_healthcare",
    label: "Access to Healthcare",
    shortLabel: "Access",
    icon: HeartPulse,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  {
    key: "congruence_with_health_priorities",
    label: "Congruence with Health Priorities",
    shortLabel: "Priorities",
    icon: Target,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
];

// ── HTML renderer ──────────────────────────────────────────────────────────

function HtmlContent({ html, className = "" }: { html: string; className?: string }) {
  const clean = sanitizeHtml(html);
  return (
    <div
      className={`
        text-sm text-slate-700 leading-relaxed
        [&_p]:mb-2.5 [&_p:last-child]:mb-0
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2.5 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2.5 [&_ol]:space-y-1
        [&_li]:leading-relaxed [&_li]:text-slate-700
        [&_b]:font-semibold [&_strong]:font-semibold [&_b]:text-slate-800
        [&_i]:italic [&_em]:italic
        [&_u]:underline
        [&_br]:block [&_br]:h-1
        [&_div]:mb-1 [&_div:last-child]:mb-0
        [&_a]:text-teal-600 [&_a]:underline [&_a:hover]:text-teal-800
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

// ── Section card ───────────────────────────────────────────────────────────

function SectionCard({
  section,
  value,
  bodType,
  sectionRef,
}: {
  section: typeof SECTIONS[number];
  value: string | null;
  bodType?: string | null;
  sectionRef?: React.RefObject<HTMLDivElement>;
}) {
  const Icon = section.icon;
  const isEmpty = !value || !value.trim();

  return (
    <div
      id={`section-${section.key}`}
      ref={sectionRef}
      className="scroll-mt-6"
    >
      <Card className={`border shadow-sm overflow-hidden ${section.border}`}>
        <div className={`px-5 py-3.5 -mt-6 ${section.bg} border-b ${section.border} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md bg-white/70 ${section.border} border`}>
              <Icon className={`h-4 w-4 ${section.color}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${section.color}`}>
                {section.label}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {section.key === "burden_of_disease" && bodType && (
              <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 bg-white">
                {bodType}
              </Badge>
            )}
            {isEmpty && (
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 bg-white">
                Not filled
              </Badge>
            )}
          </div>
        </div>

        {/* Section body */}
        <CardContent className="p-5">
          {isEmpty ? (
            <p className="text-xs text-slate-400 italic">No information provided for this section.</p>
          ) : (
            <HtmlContent html={value!} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sidebar nav ────────────────────────────────────────────────────────────

function SidebarNav({
  sections,
  data,
  activeId,
  onNavigate,
}: {
  sections: typeof SECTIONS;
  data: CriteriaInformation;
  activeId: string;
  onNavigate: (key: string) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {/* Overview items */}
      {[
        { id: "section-overview", label: "Overview", icon: Info },
        { id: "section-additional", label: "Additional Info", icon: FileText },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs font-medium ${
            activeId === id
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      ))}

      <div className="pt-1 pb-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 py-1">
          Criteria Sections
        </p>
      </div>

      {sections.map((s) => {
        const Icon = s.icon;
        const value = data[s.key] as string | null;
        const isEmpty = !value || !value.trim();
        const isActive = activeId === `section-${s.key}`;
        return (
          <button
            key={s.key}
            onClick={() => onNavigate(`section-${s.key}`)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
              isActive
                ? `${s.bg} ${s.color} font-semibold border ${s.border}`
                : "text-slate-600 hover:bg-slate-100 font-normal"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? s.color : "text-slate-400"}`} />
            <span className="truncate flex-1">{s.shortLabel}</span>
            {isEmpty && (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            )}
            {!isEmpty && (
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.color.replace("text-", "bg-")}`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}


export default function CriteriaInformationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<CriteriaInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("section-overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getCriteriaInfoByIntervention(id);
      setData(list[0] ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Scroll spy ──────────────────────────────────────────────────────────
  useEffect(() => {
    const allIds = [
      "section-overview",
      "section-additional",
      ...SECTIONS.map((s) => `section-${s.key}`),
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold text-slate-800">Criteria Information</h1>
        </div>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">No Criteria Information Found</p>
              <p className="text-xs text-amber-600 mt-1">
                This intervention has no criteria information available yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Count filled sections
  const filledCount = SECTIONS.filter((s) => {
    const v = data[s.key] as string | null;
    return v && v.trim();
  }).length;

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
              <FileText className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">Criteria Information</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {data.intervention_reference_number ?? "—"} · {filledCount}/{SECTIONS.length} sections filled
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => router.push(`/portal/interventions/${id}`)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Intervention
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6  -mt-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-100 mb-1.5">
                Intervention
              </p>
              <h2 className="text-xl font-bold text-white leading-snug">
                {data.intervention_name}
              </h2>
              {data.system_category_name && (
                <p className="text-sm text-teal-200 mt-1.5 leading-snug">
                  {data.system_category_name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {data.intervention_reference_number && (
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-mono gap-1">
                  {data.intervention_reference_number}
                  <ExternalLink className="h-2.5 w-2.5" />
                </Badge>
              )}
              {data.bod_type && (
                <Badge className="bg-teal-700/60 text-teal-100 border-0 text-xs">
                  BOD: {data.bod_type}
                </Badge>
              )}
              <Badge className="bg-white/15 text-white border-white/20 text-xs">
                {filledCount}/{SECTIONS.length} sections
              </Badge>
            </div>
          </div>

          {/* Section fill progress */}
          <div className="mt-4 space-y-1.5">
            <div className="h-1.5 rounded-full bg-teal-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-700"
                style={{ width: `${(filledCount / SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Body: sidebar nav + content ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">

        {/* Sidebar */}
        <div className="lg:sticky lg:top-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-3">
              <SidebarNav
                sections={SECTIONS}
                data={data}
                activeId={activeSection}
                onNavigate={scrollTo}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="space-y-5 min-w-0">

          {/* Overview — brief info + additional info */}
          <div id="section-overview" className="scroll-mt-6 space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-white border border-slate-200">
                  <Info className="h-4 w-4 text-teal-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Overview</h3>
              </div>
              <CardContent className="p-5">
                {data.brief_info ? (
                  <HtmlContent html={data.brief_info} />
                ) : (
                  <p className="text-xs text-slate-400 italic">No overview provided.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All criteria sections */}
          {SECTIONS.map((section) => (
            <SectionCard
              key={section.key}
              section={section}
              value={data[section.key] as string | null}
              bodType={section.key === "burden_of_disease" ? data.bod_type : null}
            />
          ))}

          {/* Additional info */}
          {data.additional_info && (
            <div id="section-additional" className="scroll-mt-6">
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Additional Information</h3>
                </div>
                <CardContent className="p-5">
                  <HtmlContent html={data.additional_info} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer metadata */}
          <Card className="border-slate-100 bg-slate-50 shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                <span>
                  Created{" "}
                  <span className="text-slate-600 font-medium">
                    {new Date(data.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </span>
                <span>
                  Updated{" "}
                  <span className="text-slate-600 font-medium">
                    {new Date(data.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </span>
                {data.created_by_name && (
                  <span>
                    By{" "}
                    <span className="text-slate-600 font-medium">{data.created_by_name}</span>
                  </span>
                )}
                {data.system_category_name && (
                  <span>
                    Category{" "}
                    <span className="text-slate-600 font-medium">{data.system_category_name}</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}