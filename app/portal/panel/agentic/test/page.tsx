"use client";
import { useState } from "react";
import { FlaskConical, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TestRunsResult } from "@/types/new/agentic";
import { PickedTarget, TargetPicker } from "../_shared/target";
import { runAccuracyTest } from "@/app/api/new/panel/agentic";


const BRAND = "#27aae1";
const RUN_OPTIONS = [3, 5, 10];

export default function AITestingPage() {
  const [target, setTarget] = useState<PickedTarget | null>(null);
  const [runs, setRuns] = useState(3);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestRunsResult | null>(null);

  const go = async () => {
    if (!target) { toast.warning("Select a proposal first."); return; }
    setRunning(true);
    setResult(null);
    const res = await runAccuracyTest(target.target_type, target.id, runs);
    setRunning(false);
    if (!res) { toast.error("Test failed."); return; }
    setResult(res);
    toast.success(`Completed ${res.runs} runs.`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
          <FlaskConical className="h-5 w-5" style={{ color: BRAND }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Accuracy Testing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Run the same proposal multiple times to check score consistency.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Proposal</label>
          <TargetPicker value={target} onChange={setTarget} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Runs</label>
          <div className="flex gap-2">
            {RUN_OPTIONS.map((n) => (
              <button key={n} onClick={() => setRuns(n)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${runs === n ? "text-white border-transparent" : "bg-white border-slate-300 text-slate-600"}`}
                style={runs === n ? { background: BRAND } : undefined}>
                {n}×
              </button>
            ))}
          </div>
        </div>
        <button onClick={go} disabled={running || !target}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: BRAND }}>
          {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Running {runs} appraisals…</> : `Run ${runs} times`}
        </button>
      </div>

      {result && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-800">Consistency across {result.runs} runs</p>
            <p className="text-xs text-slate-400">Stable = same score every run. Wider min–max = more variance.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Criterion", "Runs scored", "Distinct scores", "Min–Max", "Stable"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.consistency.map((c) => (
                <tr key={c.criterion} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">{c.criterion}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{c.runs_scored}/{result.runs}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{c.distinct_scores.map((s) => s.toFixed(2)).join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{c.min.toFixed(2)} – {c.max.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {c.stable
                      ? <span className="flex items-center gap-1 text-emerald-700 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Stable</span>
                      : <span className="flex items-center gap-1 text-amber-700 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Varies</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}