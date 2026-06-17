"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Download, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ProtocolGuide, ScoringModel } from "@/types/panel/scoring";
import { errMsg, finalizeScoringModel, getScoringModel, listProtocolGuides, listScoringModels, scoreScoringModel } from "@/app/api/panel";


export default function AppraisalPage() {
  const params = useSearchParams();
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [guides, setGuides] = useState<ProtocolGuide[]>([]);
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [protocolId, setProtocolId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listScoringModels().then(setModels).catch((e) => toast.error(errMsg(e)));
    listProtocolGuides()
      .then((gs) => {
        setGuides(gs);
        const active = gs.find((g) => g.is_active);
        if (active) setProtocolId(active.id);
      })
      .catch((e) => toast.error(errMsg(e)));
  }, []);

  // load the model named in ?model=, else the first one
  useEffect(() => {
    const id = params.get("model") || models[0]?.id;
    if (id) getScoringModel(id).then(setModel).catch((e) => toast.error(errMsg(e)));
  }, [params, models]);

  const results = model?.scores?.results ?? {};
  const criteria = useMemo(() => {
    const set = new Set<string>();
    Object.values(results).forEach((r) => Object.keys(r).forEach((c) => set.add(c)));
    return [...set];
  }, [results]);
  const refs = Object.keys(results);

  const run = async () => {
    if (!model) return;
    if (!protocolId) {
      toast.error("Pick a protocol guide first.");
      return;
    }
    setBusy(true);
    try {
      const scored = await scoreScoringModel(model.id, { protocol_id: protocolId });
      setModel(scored);
      toast.success("Scoring complete.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    if (!model) return;
    try {
      const done = await finalizeScoringModel(model.id);
      setModel(done);
      toast.success("Marked as final.");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const download = async () => {
    if (!model) return;
    const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Scores");
    ws.addRow(["Intervention", ...criteria, "Total"]);
    ws.getRow(1).font = { bold: true };
    refs.forEach((ref) => {
      const row = results[ref];
      const cells = criteria.map((c) => row[c]?.score ?? "");
      const total = cells.reduce((a: number, v: any) => a + (typeof v === "number" ? v : 0), 0);
      ws.addRow([ref, ...cells, total]);
    });
    const buf = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `appraisal-${model.title.replace(/\s+/g, "-").toLowerCase()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-800">Appraisal results</h1>
        <p className="text-sm text-slate-500">Run a scoring model against a protocol guide.</p>
      </header>

      {/* controls */}
      <div className="flex flex-wrap items-end gap-3 border border-slate-200 p-4">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scoring model</span>
          <select
            value={model?.id ?? ""}
            onChange={(e) => getScoringModel(e.target.value).then(setModel)}
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.title} ({m.row_count})</option>
            ))}
          </select>
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Protocol guide</span>
          <select
            value={protocolId}
            onChange={(e) => setProtocolId(e.target.value)}
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
          >
            <option value="">— select —</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} v{g.version}{g.is_active ? " (active)" : ""}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={run} disabled={busy || !model} style={{ backgroundColor: "#27aae1" }} className="text-white">
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
          Run scoring
        </Button>
      </div>

      {/* results */}
      {refs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Scored under {model?.scores?.protocol?.name} v{model?.scores?.protocol?.version}
              {model?.status === "final" && (
                <span className="ml-2 inline-flex items-center gap-1 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> final
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={download}>
                <Download className="mr-1 h-3.5 w-3.5" /> Download scores
              </Button>
              {model?.status !== "final" && (
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={finalize}>
                  <Lock className="mr-1 h-3.5 w-3.5" /> Finalize
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-auto border border-slate-200">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-slate-500">Intervention</th>
                  {criteria.map((c) => (
                    <th key={c} className="px-2 py-2 text-center font-semibold text-slate-500">{c}</th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-[#fe7105]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refs.map((ref) => {
                  const row = results[ref];
                  const total = criteria.reduce((a, c) => a + (typeof row[c]?.score === "number" ? (row[c]!.score as number) : 0), 0);
                  return (
                    <tr key={ref}>
                      <td className="px-2 py-1.5 font-mono text-slate-700">{ref}</td>
                      {criteria.map((c) => (
                        <td key={c} className="px-2 py-1.5 text-center text-slate-700" title={row[c]?.label}>
                          {row[c]?.score ?? "—"}
                        </td>
                      ))}
                      <td className="px-2 py-1.5 text-center font-semibold text-[#fe7105]">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          No scores yet. Pick a model and protocol, then run scoring.
        </p>
      )}
    </div>
  );
}