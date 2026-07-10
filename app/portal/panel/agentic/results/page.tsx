"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, FileText } from "lucide-react";
import { PanelAppraisal } from "@/types/new/agentic";
import { getAppraisals } from "@/app/api/new/panel/agentic";

const BRAND = "#27aae1";

export default function AppraisalResultsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PanelAppraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAppraisals().then(setRows).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.target_name.toLowerCase().includes(q) || (r.reference_number?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
            <FileText className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">AI Appraisal Results</h1>
            <p className="text-sm text-slate-500 mt-0.5">All generated appraisals with scores and reasoning.</p>
          </div>
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or reference…"
        className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Ref No.", "Proposal", "Type", "Total", "Status", "Created"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No appraisals yet.</td></tr>
            ) : filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/portal/appraisal/ai-results/${r.id}`)}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: BRAND }}>{r.reference_number ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-xs">{r.target_name}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    {r.target_type === "national_proposal" ? "National" : "Intervention"}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums font-bold text-slate-800">{r.total_score.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {r.success
                    ? <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Complete</span>
                    : <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Partial</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}