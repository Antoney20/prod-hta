"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, RefreshCw, Package, Layers, FileWarning, ExternalLink, CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { CoverageDetail, DetailCriterion } from "@/types/new/evidence-coverage";
import { getCoverageDetail } from "@/app/api/new/panel/coverage";
import { CELL_STYLE, OVERALL_STYLE } from "@/components/shared/status";


export default function CoverageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<CoverageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setDetail(await getCoverageDetail(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const backToList = () => router.push("/portal/panel/evidence/coverage");

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-center text-slate-500">
        Target not found.
        <Button variant="link" onClick={backToList}>Back to coverage</Button>
      </div>
    );
  }

  const badge = OVERALL_STYLE[detail.overall];

  return (
    <div className="space-y-6 p-2">
      {/* header */}
      <div className="flex items-start gap-3">
        <button onClick={backToList}
          className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1]">
              {detail.reference_number || "—"}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
              {badge.label}
            </span>
            <span className={`text-[10px] uppercase tracking-wide ${
              detail.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
            }`}>
              {detail.kind === "intervention" ? "Intervention" : "National Program"}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{detail.name || "Untitled"}</h1>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
           <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
            {detail.package && (
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-4 w-4 text-slate-400" />
                {detail.package.name ?? "—"}
                {detail.package.batch_number && (
                  <span className="text-xs text-slate-400">· batch {detail.package.batch_number}</span>
                )}
              </span>
            )}
            {detail.phase && (
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" />
                {detail.phase.name ?? "—"}
                {detail.phase.batch_number && (
                  <span className="text-xs text-slate-400">· batch {detail.phase.batch_number}</span>
                )}
              </span>
            )}
          </div>

          {/* link back to the source proposal */}
          <Link
            href={
              detail.kind === "intervention"
                ? `/portal/interventions/${detail.id}`
                : `/portal/interventions/${detail.id}`
            }
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium rounded border py-2 px-6  text-[#27aae1] hover:underline"
          >
            See original proposal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* coverage bar */}
      <div className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Evidence coverage</span>
          <span className="text-slate-500">{detail.coverage.covered} of {detail.coverage.total} criteria</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded bg-slate-100">
          <div className="h-full rounded bg-[#27aae1] transition-all" style={{ width: `${detail.coverage.percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          {(["complete", "incomplete", "empty", "missing"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${CELL_STYLE[s].dot}`} />
              {CELL_STYLE[s].label}: <strong className="text-slate-700">{detail.counts[s]}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* one section per criterion */}
      <div className="space-y-4">
        {detail.criteria.map((c) => (
          <CriterionSection key={c.criterion} criterion={c} />
        ))}
      </div>
    </div>
  );
}

function CriterionSection({ criterion: c }: { criterion: DetailCriterion }) {
  const style = CELL_STYLE[c.status];
  const hasData = c.status !== "missing" && Object.keys(c.data ?? {}).length > 0;

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <h3 className="font-semibold text-slate-800">{c.criterion_name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
            {style.label}{c.total > 0 ? ` · ${c.filled}/${c.total}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
          {c.score != null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#27aae1]" /> Score {c.score}
            </span>
          )}
          <Link href={`/portal/panel/evidence/${c.criterion_id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#27aae1] hover:underline">
            Manage <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <FileWarning className="h-7 w-7 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No evidence added here</p>
          <p className="text-xs text-slate-400">This criterion has no evidence for this target yet.</p>
        <Link href={`/portal/panel/evidence/${c.criterion_id}`}
            className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#27aae1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d8fc3]">
            Add evidence <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {(c.headers.length ? c.headers : Object.keys(c.data).map((k) => ({ key: k, label: k }))).map((h) => {
                const raw = (c.data as any)?.[h.key];
                const val =
                  raw == null || raw === "" ? null
                  : Array.isArray(raw) ? raw.join(", ")
                  : String(raw);
                return (
                  <tr key={h.key} className="hover:bg-slate-50/60">
                    <td className="w-1/3 px-4 py-2.5 align-top text-xs font-medium uppercase tracking-wide text-slate-400">
                      {h.label}
                    </td>
                    <td className={`px-4 py-2.5 align-top text-sm ${val ? "text-slate-700" : "text-slate-300"}`}>
                      {val ?? "— empty —"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}