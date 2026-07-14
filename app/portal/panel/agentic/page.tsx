import Link from "next/link";
import { Home, Sparkles, Table2, Scale, Award, Settings, ArrowRight } from "lucide-react";

const BRAND = "#27aae1";
const BASE = "/portal/panel/agentic";

const STEPS = [
  {
    slug: "",
    step: "01",
    label: "Overview",
    icon: Home,
    desc: "The agentic appraisal pipeline at a glance — every stage from run to final recommendation.",
  },
  {
    slug: "run",
    step: "02",
    label: "Appraisal Run",
    icon: Sparkles,
    desc: "Select proposals and let the agent read the evidence and match each criterion to its scoring band.",
  },
  {
    slug: "results",
    step: "03",
    label: "Appraisal Results",
    icon: Table2,
    desc: "The scored results across all criteria, per proposal, in a single comparable table.",
  },
  {
    slug: "ranking",
    step: "04",
    label: "Weighting & Ranking",
    icon: Scale,
    desc: "Apply criterion weights, aggregate the scores deterministically, and rank the proposals.",
  },
  {
    slug: "final",
    step: "05",
    label: "Final Results",
    icon: Award,
    desc: "The consolidated inclusion or exclusion recommendation for each proposal.",
  },
  {
    slug: "settings",
    step: "06",
    label: "Settings",
    icon: Settings,
    desc: "AI models, provider keys, and agent prompts that drive the appraisal.",
  },
] as const;

export default function AgenticOverviewPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <Sparkles className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Agentic Workflow </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              An evidence-driven appraisal process for the panel
            </p>
          </div>
        </div>
        <span
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold sm:inline-flex"
          style={{ background: `${BRAND}14`, color: BRAND }}
        >
          Overview
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.slug || "overview"}
              href={s.slug ? `${BASE}/${s.slug}` : BASE}
              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg p-2" style={{ background: `${BRAND}14` }}>
                  <Icon className="h-5 w-5" style={{ color: BRAND }} />
                </div>
                <span className="font-mono text-xs font-semibold text-slate-300">{s.step}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-800">{s.label}</h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: BRAND }}
              >
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}