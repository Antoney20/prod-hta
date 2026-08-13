"use client";


import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, Printer } from "lucide-react";
import { DuplicateGroup, EvidenceSource, NA_LABEL } from "./helpers";
import { buildReport, BudgetRecord, GradeRow, RenderFormBlock, RenderSection } from "./resolve";

const BRAND = "#27aae1";

/* Exact wording carried over from the .docx template. */
const SECTION_1_TITLE = "Evidence Synthesis Report";
const SECTION_2_TITLE = "Appendix B: HTA Submission Report";
const SYNTHESIS_INTRO =
  "This report is organized against the 12 HBTAP criteria (Clinical Effectiveness; Safety; Quality; " +
  "Burden of Disease; Incidence/Prevalence; Population Impact; Equity; Cost-Effectiveness; Budgetary " +
  "Impact; Feasibility; Catastrophic Health Expenditure; Government Priorities).";
const FORM_A = {
  title: "Form A: Clinical Evidence Summary",
  instructions:
    "Provide a structured summary of the best available evidence for clinical effectiveness, safety, and quality. Use GRADE framework where possible.",
};
const FORM_B = {
  title: "Form B: Economic Evaluation",
  instructions: "Cost-effectiveness results and budget impact analysis.",
};
const FORM_C = {
  title: "Form C: Equity and Feasibility",
  instructions: "The Kenya HTA process explicitly recognizes equity and feasibility as priority-setting criteria.",
};

export default function EvidenceReport({ source }: { source: EvidenceSource }) {
  const model = useMemo(() => buildReport(source), [source]);
  const { meta } = model;
  const refLabel = `${meta.kind} Ref No`;
  const byId = (id: string) => model.submission.find((b) => b.id === id);

  return (
    <article className="w-full overflow-hidden">
      {/* accent bar */}
      <div className="h-1.5 w-full" />

      {/* document identity */}
      <header className=" ">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#27aae1]">{meta.kind}</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-900">{meta.name}</h1>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-600">{refLabel}:</span> {meta.reference}
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-medium text-slate-600">Package:</span> {meta.package}
        </p>
        <div className="mt-6 h-px w-full bg-slate-100" />
      </header>

      {/* ===================== SECTION 1 ===================== */}
      <section className=" py-7 ">
        <SectionLabel n={1} title={SECTION_1_TITLE} />
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{SYNTHESIS_INTRO}</p>
        {meta.justification && (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-700">Justification: </span>
            {meta.justification}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {model.synthesis.map((s) => (
            <Criterion key={s.id} section={s} />
          ))}
        </div>

        {model.duplicates.length > 0 && <DuplicateRecords groups={model.duplicates} />}
      </section>

      {/* section divider */}
      <div className="mx-6 border-t-2 border-slate-100 sm:mx-10" />

      {/* ===================== SECTION 2 ===================== */}
      <section className="py-7 ">
        <SectionLabel n={2} title={SECTION_2_TITLE} />

        {/* Form A */}
        <FormHeading title={FORM_A.title} instructions={FORM_A.instructions} />
        <div className="space-y-4">
          {byId("a1") && <FormBlockView block={byId("a1")!} />}
          <KeyEvidence model={model} />
          <GradeProfile rows={model.grade} />
        </div>

        {/* Form B */}
        <FormHeading title={FORM_B.title} instructions={FORM_B.instructions} />
        <div className="space-y-4">
          {byId("b5") && <FormBlockView block={byId("b5")!} />}
          <BudgetImpact records={model.budgetImpact.records} />
        </div>

        {/* Form C */}
        <FormHeading title={FORM_C.title} instructions={FORM_C.instructions} />
        <div className="space-y-4">
          {byId("c1eq") && <FormBlockView block={byId("c1eq")!} />}
          {byId("c2feas") && <FormBlockView block={byId("c2feas")!} />}
        </div>
      </section>

      {/* signature */}
      <footer className="border-t border-dashed border-slate-200 px-6 py-6 sm:px-10">
        <p className="text-sm font-semibold text-slate-700">
          System-generated report for {meta.name} ({meta.reference}).
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Figures are compiled deterministically from the evidence record; panel members remain
          responsible for all appraisal decisions.
        </p>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wider text-white"
        style={{ background: BRAND }}
      >
        Section {n}
      </span>
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}

function FormHeading({ title, instructions }: { title: string; instructions: string }) {
  return (
    <div className="mb-3 mt-8 border-b border-slate-200 pb-2 first:mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
      <p className="mt-1 text-xs italic leading-relaxed text-slate-500">{instructions}</p>
    </div>
  );
}

/* ---- Section 1 pieces ---- */

function Criterion({ section }: { section: RenderSection }) {
  const m = section.title.match(/^Criterion\s+(\d+):\s*(.*)$/);
  const num = m?.[1];
  const label = m?.[2] ?? section.title;

  return (
    <div className="break-inside-avoid rounded-xl border border-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        {num ? (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: BRAND }}
          >
            {num}
          </span>
        ) : null}
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
        {!section.hasData && (
          <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-slate-300">
            {section.emptyText}
          </span>
        )}
      </div>

      {section.hasData && (
        <div className="space-y-3 p-4">
          {section.tables.map((t, i) => (
            <div key={i}>
              {t.caption && (
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1d70b8]">
                  {t.caption}
                </p>
              )}
              <FieldTable rows={t.rows} />
            </div>
          ))}
          {section.notes.map((n, i) => (
            <p key={i} className="text-xs italic leading-relaxed text-slate-500">{n}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldTable({ rows }: { rows: RenderSection["tables"][number]["rows"] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="w-1/3 bg-slate-50/70 px-3 py-2 align-top text-xs font-semibold text-slate-600">
                {r.label}
              </td>
              <td className={`whitespace-pre-wrap break-words px-3 py-2 align-top text-sm ${r.present ? "text-slate-700" : "text-slate-300"}`}>
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Duplicate evidence records (per criterion) ---- */

function DuplicateRecords({ groups }: { groups: DuplicateGroup[] }) {
  return (
    <div className="mt-6 break-inside-avoid rounded-xl border border-amber-200 bg-amber-50/30">
      <div className="border-b border-amber-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Multiple evidence records</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          The criteria below hold more than one evidence record. The synthesis above uses the fullest
          record; every record is listed here so the panel can review each on its own.
        </p>
      </div>
      <div className="space-y-6 p-4">
        {groups.map((g) => (
          <div key={g.criterionName}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1d70b8]">
              {g.criterionName} — {g.records.length} records
            </p>
            <div className="space-y-3">
              {g.records.map((r) => (
                <div key={r.label} className="break-inside-avoid">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-[10px] font-bold text-white"
                      style={{ background: BRAND }}
                    >
                      {r.label}
                    </span>
                    {r.score != null && (
                      <span className="text-[11px] text-slate-500">Score: {r.score}</span>
                    )}
                  </div>
                  <FieldTable rows={r.rows} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Section 2 pieces ---- */

function KeyEvidence({ model }: { model: ReturnType<typeof buildReport> }) {
  const k = model.keyEvidence;
  return (
    <Block title="A.2 Key Evidence Summary">
      {!k.hasRow ? (
        <Empty />
      ) : (
        <MiniTable
          head={["#", "Design", "Outcome", "Effect size (95% CI)", "Limitations"]}
          rows={[["1", k.design, k.outcome, k.effect, k.limitations]]}
        />
      )}
    </Block>
  );
}

function GradeProfile({ rows }: { rows: GradeRow[] }) {
  return (
    <Block title="A.3 GRADE Evidence Profile">
      <MiniTable
        head={["Outcome", "No. of studies", "Study design", "Certainty", "Effect estimate"]}
        rows={rows.map((r) => [
          r.outcome,
          r.studies || "—",
          r.design || "—",
          "☐ High ☐ Moderate ☐ Low ☐ Very low",
          r.effect || "—",
        ])}
        emphasizeFirst
      />
    </Block>
  );
}

/* ---- B.6 Budget Impact (multi-year, tabbed; repeats per record) ---- */

function SubCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1d70b8]">
      {children}
    </p>
  );
}

function BudgetImpact({ records }: { records: BudgetRecord[] }) {
  if (!records.length) {
    return (
      <Block title="B.6 Budget Impact Analysis (5-Year)">
        <Empty />
      </Block>
    );
  }
  return (
    <>
      {records.map((rec, i) => (
        <BudgetRecordView key={rec.label || i} record={rec} multi={records.length > 1} />
      ))}
    </>
  );
}

function BudgetRecordView({ record, multi }: { record: BudgetRecord; multi: boolean }) {
  const firstWithData = record.years.find((y) => y.hasData)?.year ?? 1;
  const [year, setYear] = useState(firstWithData);
  const active = record.years.find((y) => y.year === year) ?? record.years[0];

  const title = multi
    ? `B.6 Budget Impact Analysis (5-Year) — Record ${record.label}`
    : "B.6 Budget Impact Analysis (5-Year)";

  const anyCostBasis = record.costBasis.some((r) => r.present);
  const anyOffsets = record.offsets.some((r) => r.present);
  const anyJudgment = record.judgment.some((r) => r.present);

  return (
    <Block title={title}>
      {/* Multi-Year Summary — headline figures, pinned to the top */}
      <div className="mb-5 rounded-xl border border-[#27aae1]/30 bg-[#27aae1]/[0.06] p-3">
        <SubCaption>Multi-Year Summary</SubCaption>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {record.summary.map((r) => (
            <div key={r.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
                {r.label}
              </p>
              <p className={`mt-1 break-words text-sm font-bold tabular-nums ${r.present ? "text-slate-800" : "text-slate-300"}`}>
                {r.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {anyCostBasis && (
        <div className="mb-4">
          <SubCaption>Cost Basis &amp; SHA Tariffs</SubCaption>
          <FieldTable rows={record.costBasis} />
        </div>
      )}

      <SubCaption>Year-by-Year Projection</SubCaption>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {record.years.map((y) => {
          const isActive = y.year === year;
          return (
            <button
              key={y.year}
              onClick={() => setYear(y.year)}
              className={[
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                isActive
                  ? "border-transparent text-white"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50",
              ].join(" ")}
              style={isActive ? { background: BRAND } : undefined}
            >
              Year {y.year}
              {!y.hasData && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white/60" : "bg-slate-300"}`}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
      <FieldTable rows={active.rows} />

      {anyOffsets && (
        <div className="mt-4">
          <SubCaption>Budget Offsets &amp; Donor Funding</SubCaption>
          <FieldTable rows={record.offsets} />
        </div>
      )}
      {anyJudgment && (
        <div className="mt-4">
          <SubCaption>Affordability</SubCaption>
          <FieldTable rows={record.judgment} />
        </div>
      )}
    </Block>
  );
}

function FormBlockView({ block }: { block: RenderFormBlock }) {
  return (
    <Block title={block.title} intro={block.intro}>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="w-1/3 bg-slate-50/70 px-3 py-2 align-top text-xs font-semibold text-slate-600">
                  {r.label}
                </td>
                <td className="px-3 py-2 align-top text-sm">
                  {r.kind === "text" ? (
                    <span className={`whitespace-pre-wrap break-words ${r.text === NA_LABEL ? "text-slate-300" : "text-slate-700"}`}>{r.text}</span>
                  ) : (
                    <span className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
                      {r.options?.map((o) => (
                        <span key={o.label} className={o.checked ? "font-medium text-slate-800" : ""}>
                          {o.checked ? "☑" : "☐"} {o.label}
                        </span>
                      ))}
                      {r.suffix && <span className="text-slate-300">{r.suffix}</span>}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

/* ---- shared Section 2 chrome ---- */

function Block({
  title, intro, children,
}: {
  title: string; intro?: string; children: React.ReactNode;
}) {
  return (
    <div className="break-inside-avoid rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        {intro && <p className="mt-0.5 text-xs text-slate-500">{intro}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MiniTable({
  head, rows, emphasizeFirst,
}: {
  head: string[]; rows: string[][]; emphasizeFirst?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-slate-200 px-2.5 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-slate-100 align-top last:border-0">
              {r.map((c, ci) => (
                <td
                  key={ci}
                  className={`whitespace-pre-wrap break-words px-2.5 py-2 ${
                    emphasizeFirst && ci === 0 ? "font-medium text-slate-700" : "text-slate-600"
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return <p className="py-2 text-center text-sm text-slate-300">—</p>;
}