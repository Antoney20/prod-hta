"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { PanelAppraisalDetail } from "@/types/new/agentic";
import { getAppraisalById } from "@/app/api/new/panel/agentic";

const BRAND = "#27aae1";

export default function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PanelAppraisalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppraisalById(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><RefreshCw className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">Appraisal not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs" style={{ color: BRAND }}>{data.reference_number ?? "—"}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                {data.target_type === "national_proposal" ? "National" : "Intervention"}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 mt-1">{data.target_name}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums" style={{ color: BRAND }}>{data.total_score.toFixed(2)}</p>
            <p className="text-xs text-slate-400">total score</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.scores.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {s.ok
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span className="text-sm font-semibold text-slate-800">{s.criterion_name}</span>
              </div>
              {s.ok
                ? <span className="text-lg font-bold tabular-nums" style={{ color: BRAND }}>{s.score?.toFixed(2)}</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">No data</span>}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{s.ok ? s.reasoning : s.failure_reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}