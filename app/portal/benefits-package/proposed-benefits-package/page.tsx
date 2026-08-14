"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  buildFromSwg, overviewProposed, pkgErr, promoteProposed, setDecision,
} from "@/app/api/new/panel/benefits-package";
import { listSwg } from "@/app/api/new/panel/swg";
import { downloadProposed } from "@/app/portal/benefits-package/_lib/package-excel";
import type {
  Decision, PackageIntervention, ProposedPackage, SwgListSummary,
} from "@/types/panel/benefits-package";

// Adjust to your evidence report route:
const evidenceHref = (id: string) => `/portal/appraisal/evidence/${id}`;

const DECISION_STYLE: Record<Decision, string> = {
  include: "bg-green-100 text-green-700",
  exclude: "bg-red-100 text-red-600",
  pending: "bg-slate-100 text-slate-500",
};

export default function ProposedBenefitsPackagePage() {
  const [pkgs, setPkgs] = useState<ProposedPackage[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [swgLists, setSwgLists] = useState<SwgListSummary[]>([]);
  const [showBuild, setShowBuild] = useState(false);
  const [buildSwg, setBuildSwg] = useState("");
  const [buildFund, setBuildFund] = useState("");
  const [buildHta, setBuildHta] = useState("");

  const load = async () => {
    const data = await overviewProposed();
    setPkgs(data);
    const c: Record<string, string> = {};
    data.forEach((p) => p.services.forEach((s) => s.interventions.forEach((it) => (c[it.ref] = it.comment))));
    setComments(c);
  };
  useEffect(() => { load(); listSwg().then(setSwgLists); }, []);

  const decide = async (pkgId: string, it: PackageIntervention, decision: Decision) => {
    try {
      await setDecision(pkgId, { ref: it.ref, decision, comment: comments[it.ref] ?? it.comment });
      setPkgs((ps) => ps.map((p) => p.id !== pkgId ? p : {
        ...p, services: p.services.map((s) => ({
          ...s, interventions: s.interventions.map((x) => x.ref === it.ref ? { ...x, decision } : x),
        })),
      }));
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const saveComment = async (pkgId: string, it: PackageIntervention) => {
    const comment = comments[it.ref] ?? "";
    if (comment === it.comment) return;
    try {
      await setDecision(pkgId, { ref: it.ref, decision: it.decision, comment });
      toast.success("Comment saved");
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const promote = async (pkgId: string) => {
    try {
      const rev = await promoteProposed(pkgId);
      toast.success(`Promoted ${rev.items.length} included interventions to revised`);
    } catch (e) { toast.error(pkgErr(e)); }
  };

  const runBuild = async () => {
    if (!buildSwg) return toast.warn("Pick an SWG list");
    try {
      await buildFromSwg({ swg_id: buildSwg, fund: buildFund, hta_type: buildHta || undefined });
      setShowBuild(false);
      await load();
      toast.success("Proposed packages built from SWG");
    } catch (e) { toast.error(pkgErr(e)); }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-lg font-semibold text-slate-800">Proposed benefits package</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowBuild(true)}
            className="rounded bg-[#27aae1] px-3 py-1.5 text-sm text-white">Build from SWG</button>
          <button onClick={() => downloadProposed(pkgs)}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm">Download Excel</button>
        </div>
      </div>

      {showBuild && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-slate-50 p-3">
          <div>
            <label className="block text-xs text-slate-500">SWG list</label>
            <select value={buildSwg} onChange={(e) => setBuildSwg(e.target.value)}
              className="rounded border border-slate-200 p-1 text-sm">
              <option value="">Select…</option>
              {swgLists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.count})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500">Fund</label>
            <input value={buildFund} onChange={(e) => setBuildFund(e.target.value)}
              className="rounded border border-slate-200 p-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500">HTA type</label>
            <select value={buildHta} onChange={(e) => setBuildHta(e.target.value)}
              className="rounded border border-slate-200 p-1 text-sm">
              <option value="">All</option>
              <option value="rapid">Rapid</option>
              <option value="full">Full</option>
              <option value="panel">Panel</option>
            </select>
          </div>
          <button onClick={runBuild} className="rounded bg-[#fe7105] px-3 py-1.5 text-sm text-white">Build</button>
          <button onClick={() => setShowBuild(false)} className="rounded border border-slate-200 px-3 py-1.5 text-sm">Cancel</button>
        </div>
      )}

      {!pkgs.length && <p className="text-sm text-slate-500">No proposed packages yet. Build one from an SWG list.</p>}

      <div className="space-y-5">
        {pkgs.map((p) => (
          <section key={p.id} className="rounded-lg border border-slate-200">
            <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
              <h2 className="font-semibold text-[#1d70b8]">{p.name}</h2>
              {p.fund && <span className="text-xs text-slate-400">{p.fund}</span>}
              <span className="text-xs text-slate-400">· current package: {p.current.length} items</span>
              <button onClick={() => promote(p.id)}
                className="ml-auto rounded bg-green-600 px-3 py-1 text-xs text-white">Promote included → Revised</button>
            </header>

            {p.services.map((s) => (
              <div key={s.service} className="px-3 py-2">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{s.service}</h3>
                <div className="space-y-2">
                  {s.interventions.map((it) => (
                    <div key={it.ref} className="rounded border border-slate-100 p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{it.ref}</span>
                        <span className="text-sm font-medium text-slate-700">{it.name}</span>
                        {it.evidence_id
                          ? <a href={evidenceHref(it.evidence_id)} className="text-xs text-[#27aae1] hover:underline">View evidence →</a>
                          : <span className="text-xs text-slate-300">no evidence</span>}
                        {it.routing && <span className="rounded bg-[#27aae1]/10 px-2 py-0.5 text-xs text-[#1d70b8]">{it.routing}</span>}
                        <span className={`ml-auto rounded px-2 py-0.5 text-xs ${DECISION_STYLE[it.decision]}`}>{it.decision}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {(["include", "exclude", "pending"] as Decision[]).map((d) => (
                          <button key={d} onClick={() => decide(p.id, it, d)}
                            className={`rounded border px-2 py-1 text-xs capitalize ${it.decision === d ? "border-[#27aae1] text-[#1d70b8]" : "border-slate-200 text-slate-500"}`}>
                            {d}</button>
                        ))}
                        <textarea rows={1} placeholder="Comment…"
                          value={comments[it.ref] ?? ""} onChange={(e) => setComments((c) => ({ ...c, [it.ref]: e.target.value }))}
                          onBlur={() => saveComment(p.id, it)}
                          className="flex-1 resize-y rounded border border-slate-200 p-1 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}