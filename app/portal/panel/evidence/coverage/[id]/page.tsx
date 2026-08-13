"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, ArrowRight, FileText } from "lucide-react";

import { CoverageDetail } from "@/types/new/evidence-coverage";
import { getCoverageDetail } from "@/app/api/new/panel/coverage";
import { OVERALL_STYLE } from "@/components/shared/status";
import EvidenceReport from "../report/main";



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
    <div className="py-2 ">
      {/* slim action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <button onClick={backToList}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800"
            aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/portal/assessment/evidence/${detail.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-[#27aae1] hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" /> Documents &amp; materials
          </Link>
          <Link
            href={`/portal/interventions/${detail.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-[#27aae1] hover:bg-slate-50"
          >
            See original proposal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EvidenceReport source={detail} />
    </div>
  );
}